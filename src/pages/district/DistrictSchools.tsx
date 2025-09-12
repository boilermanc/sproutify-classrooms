import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

async function getDistrictId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("district_id")
    .eq("id", data.user.id)
    .single();
  return profile?.district_id ?? null;
}

async function fetchSchools(district_id: string | number) {
  const { data, error } = await supabase
    .from("schools")
    .select("id, name, created_at")
    .eq("district_id", district_id)
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export default function DistrictSchools() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data: districtId } = useQuery({ queryKey: ["me", "district_id"], queryFn: getDistrictId });
  const schoolsQ = useQuery({
    queryKey: ["district_schools", districtId],
    queryFn: () => fetchSchools(districtId!),
    enabled: !!districtId,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { error } = await supabase.from("schools").insert([{ ...payload, district_id: districtId }]);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["district_schools", districtId] });
      toast({ title: "School created" });
    },
    onError: (e: any) => toast({ title: "Error creating school", description: String(e.message ?? e), variant: "destructive" }),
  });

  const rows = useMemo(() => {
    const list = schoolsQ.data ?? [];
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter((r: any) => r.name.toLowerCase().includes(s));
  }, [schoolsQ.data, search]);

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Schools</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add School</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New School</DialogTitle></DialogHeader>
            <SchoolForm onSubmit={createMutation.mutate} submitting={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">All Schools</CardTitle>
          <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as any[]).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <a href={`/district/towers?school_id=${s.id}`}>View Towers</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!schoolsQ.isLoading && rows.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No schools yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SchoolForm({ onSubmit, submitting }: { onSubmit: (p: any) => void; submitting: boolean }) {
  const [name, setName] = useState("");

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit({ name: name.trim() }); }}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label>School Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Create School"}</Button>
      </DialogFooter>
    </form>
  );
}
