import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

function randomCode(n = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = ""; for (let i=0;i<n;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

async function getSchoolId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await supabase.from("profiles").select("school_id").eq("id", data.user.id).single();
  return p?.school_id ?? null;
}

export default function SchoolJoinCodes() {
  const qc = useQueryClient();
  const { data: schoolId } = useQuery({ queryKey: ["me", "school_id"], queryFn: getSchoolId });

  const codesQ = useQuery({
    queryKey: ["school_join_codes", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("join_codes")
        .select("id, code, role, max_uses, uses_count, expires_at, is_active, created_at")
        .eq("school_id", schoolId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: { code: string; max_uses: number | null; expires_at: string | null }) => {
      const { error } = await supabase.from("join_codes").insert([{ ...payload, role: "teacher", school_id: schoolId, is_active: true }]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school_join_codes", schoolId] }),
  });

  const toggle = useMutation({
    mutationFn: async (id_is_active: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("join_codes").update({ is_active: id_is_active.is_active }).eq("id", id_is_active.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school_join_codes", schoolId] }),
  });

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Join Codes</h1>
        <Dialog>
          <DialogTrigger asChild><Button>Create Code</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Join Code</DialogTitle></DialogHeader>
            <NewCodeForm onCreate={(p) => create.mutate(p)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Codes for this School</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(codesQ.data ?? []).map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell>{c.uses_count}/{c.max_uses ?? "∞"}</TableCell>
                  <TableCell>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell><Switch checked={!!c.is_active} onCheckedChange={(v) => toggle.mutate({ id: c.id, is_active: v })} /></TableCell>
                </TableRow>
              ))}
              {!codesQ.isLoading && (codesQ.data ?? []).length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No join codes yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function NewCodeForm({ onCreate }: { onCreate: (p: any) => void }) {
  const [code, setCode] = useState(randomCode());
  const [maxUses, setMaxUses] = useState<string>(""); const [expires, setExpires] = useState<string>("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onCreate({ code: code.trim().toUpperCase(), max_uses: maxUses ? Number(maxUses) : null, expires_at: expires || null }); }} className="space-y-4">
      <div className="grid gap-2">
        <Label>Code</Label>
        <div className="flex gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value)} className="font-mono uppercase" />
          <Button type="button" variant="outline" onClick={() => setCode(randomCode())}>Randomize</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Max uses (blank = unlimited)</Label>
          <Input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} inputMode="numeric" />
        </div>
        <div className="grid gap-2">
          <Label>Expires at (optional)</Label>
          <Input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
        </div>
      </div>
      <DialogFooter><Button type="submit">Create</Button></DialogFooter>
    </form>
  );
}
