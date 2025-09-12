import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

async function getSchoolId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await supabase.from("profiles").select("school_id").eq("id", data.user.id).single();
  return p?.school_id ?? null;
}

async function fetchTeachers(school_id: string | number) {
  // profiles joined with user_roles filtered to this school
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, user_roles(role)")
    .eq("user_roles.role", "teacher")
    .eq("school_id", school_id)
    .order("full_name");
  if (error) throw error;
  return data ?? [];
}

export default function SchoolTeachers() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: schoolId } = useQuery({ queryKey: ["me", "school_id"], queryFn: getSchoolId });
  const teachersQ = useQuery({ queryKey: ["school_teachers", schoolId], queryFn: () => fetchTeachers(schoolId!), enabled: !!schoolId });

  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const list = teachersQ.data ?? [];
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter((t: any) => [t.full_name, t.email].join(" ").toLowerCase().includes(s));
  }, [teachersQ.data, search]);

  const removeMutation = useMutation({
    mutationFn: async (user_id: string) => {
      const { error } = await supabase.from("profiles").update({ school_id: null }).eq("id", user_id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["school_teachers", schoolId] });
      toast({ title: "Teacher unassigned from school" });
    },
    onError: (e: any) => toast({ title: "Update failed", description: String(e.message ?? e), variant: "destructive" }),
  });

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teachers</h1>
        <InviteTeacherButton schoolId={schoolId as string | number} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">All Teachers</CardTitle>
          <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as any[]).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.full_name ?? "—"}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => removeMutation.mutate(t.id)}>Unassign</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!teachersQ.isLoading && rows.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No teachers yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function InviteTeacherButton({ schoolId }: { schoolId?: string | number }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const invite = async () => {
    try {
      // Create a pending invite record
      const { data: inviteData, error } = await supabase.from("pending_invites").insert({
        email: email.trim(),
        full_name: fullName.trim() || null,
        role: "teacher",
        school_id: schoolId ?? null,
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
    } catch (e: any) {
      toast({ title: "Invite failed", description: String(e.message ?? e), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Invite Teacher</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Teacher</DialogTitle>
          <DialogDescription>
            Send an invitation to a new teacher to join your school. They'll receive an email with instructions to create their account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.org" />
          </div>
          <div className="grid gap-2">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={invite} disabled={!email.trim()}>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
