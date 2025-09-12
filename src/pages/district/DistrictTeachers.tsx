import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

async function getDistrictId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase.from("profiles").select("district_id").eq("id", data.user.id).single();
  return profile?.district_id ?? null;
}

async function fetchTeachers(district_id: string | number) {
  // Get profiles with user_roles for teachers in this district
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, school_id, schools(name)")
    .eq("district_id", district_id)
    .order("full_name");
  if (error) throw error;
  
  // Filter to only include teachers by checking user_roles
  const teacherProfiles = [];
  for (const profile of data ?? []) {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.id)
      .eq("role", "teacher")
      .single();
    
    if (roleData) {
      teacherProfiles.push(profile);
    }
  }
  
  return teacherProfiles;
}

async function fetchSchools(district_id: string | number) {
  const { data, error } = await supabase.from("schools").select("id, name").eq("district_id", district_id).order("name");
  if (error) throw error;
  return data ?? [];
}

export default function DistrictTeachers() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data: districtId } = useQuery({ queryKey: ["me", "district_id"], queryFn: getDistrictId });
  const teachersQ = useQuery({
    queryKey: ["district_teachers", districtId],
    queryFn: () => fetchTeachers(districtId!),
    enabled: !!districtId,
  });
  const schoolsQ = useQuery({
    queryKey: ["district_schools_options", districtId],
    queryFn: () => fetchSchools(districtId!),
    enabled: !!districtId,
  });

  const assignMutation = useMutation({
    mutationFn: async (payload: { user_id: string; school_id: string | null }) => {
      const { error } = await supabase.from("profiles").update({ school_id: payload.school_id }).eq("id", payload.user_id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["district_teachers", districtId] });
      toast({ title: "Teacher updated" });
    },
    onError: (e: any) => toast({ title: "Update failed", description: String(e.message ?? e), variant: "destructive" }),
  });

  const rows = useMemo(() => {
    const list = teachersQ.data ?? [];
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter((r: any) => [r.full_name, r.email, r.schools?.name].join(" ").toLowerCase().includes(s));
  }, [teachersQ.data, search]);

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teachers</h1>
        <InviteTeacherButton districtId={districtId as string | number} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">All Teachers</CardTitle>
          <Input placeholder="Search by name, email, school…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>School</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as any[]).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.full_name ?? "—"}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{t.schools?.name ?? "Unassigned"}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Assign School</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Assign School</DialogTitle></DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget as HTMLFormElement);
                            const school_id = (fd.get("school_id") as string) === "unassigned" ? null : (fd.get("school_id") as string);
                            assignMutation.mutate({ user_id: t.id, school_id });
                          }}
                          className="space-y-4"
                        >
                          <div className="grid gap-2">
                            <Label>School</Label>
                            <Select name="school_id" defaultValue={t.school_id ?? "unassigned"}>
                              <SelectTrigger><SelectValue placeholder="Pick a school" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {(schoolsQ.data ?? []).map((s: any) => (
                                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={assignMutation.isPending}>Save</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {!teachersQ.isLoading && rows.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No teachers yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function InviteTeacherButton({ districtId }: { districtId?: string | number }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolId, setSchoolId] = useState<string>("");

  const { data: schools } = useQuery({
    queryKey: ["invite_schools", districtId],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("id,name").eq("district_id", districtId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!districtId,
  });

  const invite = async () => {
    try {
      // Create a pending invite record
      const { data: inviteData, error } = await supabase.from("pending_invites").insert({
        email: email.trim(),
        full_name: fullName.trim() || null,
        role: "teacher",
        district_id: districtId ?? null,
        school_id: schoolId || null,
      }).select().single();
      
      if (error) throw error;
      
      // Generate invite link
      const inviteLink = `${window.location.origin}/auth/accept-invite?invite=${inviteData.id}`;
      
      toast({ 
        title: "Teacher invite created successfully", 
        description: `Invite link: ${inviteLink}` 
      });
      setOpen(false); 
      setEmail(""); 
      setFullName(""); 
      setSchoolId("");
    } catch (e: any) {
      toast({ title: "Invite failed", description: String(e.message ?? e), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Invite Teacher</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Invite Teacher</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="teacher@school.org" />
          </div>
          <div className="grid gap-2">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Optional" />
          </div>
          <div className="grid gap-2">
            <Label>Assign to school (optional)</Label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger><SelectValue placeholder="Pick a school" /></SelectTrigger>
              <SelectContent>
                {(schools ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={invite} disabled={!email.trim()}>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
