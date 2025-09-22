import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

async function getSchoolId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await supabase.from("profiles").select("school_id").eq("id", data.user.id).single();
  return p?.school_id ?? null;
}

async function fetchClassrooms(school_id: string | number) {
  const { data, error } = await supabase
    .from("classrooms")
    .select("id, name, grade_level, created_at")
    .eq("school_id", school_id)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export default function SchoolClassrooms() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: schoolId } = useQuery({ queryKey: ["me", "school_id"], queryFn: getSchoolId });
  const roomsQ = useQuery({ queryKey: ["school_classrooms", schoolId], queryFn: () => fetchClassrooms(schoolId!), enabled: !!schoolId });

  const [search, setSearch] = useState("");

  const create = useMutation({
    mutationFn: async (payload: { name: string; grade_level?: string | null }) => {
      // Generate a temporary PIN - the database trigger should replace it with a unique one
      const tempPin = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { error } = await supabase.from("classrooms").insert([{ 
        ...payload, 
        school_id: schoolId,
        kiosk_pin: tempPin, // Temporary value, database trigger should replace with unique PIN
        educational_package: "base", // Default educational package
        is_selected_for_network: false, // Default to not selected for network
        teacher_id: schoolId // Use school_id as teacher_id for school-created classrooms
      }]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["school_classrooms", schoolId] });
    },
    onError: (e: any) => toast({ title: "Error creating classroom", description: String(e.message ?? e), variant: "destructive" }),
  });

  const rows = useMemo(() => {
    const list = roomsQ.data ?? [];
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter((r: any) => [r.name, r.grade_level].join(" ").toLowerCase().includes(s));
  }, [roomsQ.data, search]);

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Classrooms</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search classrooms…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <Dialog>
            <DialogTrigger asChild><Button>New Classroom</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Classroom</DialogTitle></DialogHeader>
              <NewClassroomForm onCreate={(p) => create.mutate(p)} creating={create.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Your Classrooms</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as any[]).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.grade_level ?? "—"}</TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {!roomsQ.isLoading && rows.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No classrooms yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function NewClassroomForm({ onCreate, creating }: { onCreate: (p: any) => void; creating: boolean }) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onCreate({ name: name.trim(), grade_level: grade.trim() || null }); }}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label>Classroom name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label>Grade level (optional)</Label>
        <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g., 4th Grade" />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={creating}>{creating ? "Creating…" : "Create"}</Button>
      </DialogFooter>
    </form>
  );
}
