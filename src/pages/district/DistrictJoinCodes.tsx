import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../integrations/supabase/client";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

async function getDistrictId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("district_id").eq("id", user.id).single();
  return p?.district_id ?? null;
}

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function DistrictJoinCodes() {
  const qc = useQueryClient();
  const { data: districtId } = useQuery({ queryKey: ["me", "district_id"], queryFn: getDistrictId });

  const codesQ = useQuery({
    queryKey: ["district_join_codes", districtId],
    enabled: !!districtId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("district_join_codes")
        .select("id, code, description, max_uses, current_uses, expires_at, is_active, created_at")
        .eq("district_id", districtId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: { code: string; description: string; max_uses: number | null; expires_at: string | null }) => {
      const { error } = await supabase.from("district_join_codes").insert([{ 
        ...payload, 
        district_id: districtId, 
        is_active: true,
        current_uses: 0
      }]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["district_join_codes", districtId] }),
  });

  const toggle = useMutation({
    mutationFn: async (id_is_active: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("district_join_codes").update({ is_active: id_is_active.is_active }).eq("id", id_is_active.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["district_join_codes", districtId] }),
  });

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Join Codes</h1>
        <Dialog>
          <DialogTrigger asChild><Button>Create Code</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New District Join Code</DialogTitle>
              <DialogDescription>
                Create a new join code that schools can use to join your district. Set an expiration date and optional usage limit.
              </DialogDescription>
            </DialogHeader>
            <NewCodeForm onCreate={(p) => create.mutate(p)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Codes for this District</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(codesQ.data ?? []).map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell>{c.description || "—"}</TableCell>
                  <TableCell>{c.current_uses}/{c.max_uses ?? "∞"}</TableCell>
                  <TableCell>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell><Switch checked={!!c.is_active} onCheckedChange={(v) => toggle.mutate({ id: c.id, is_active: v })} /></TableCell>
                </TableRow>
              ))}
              {!codesQ.isLoading && (codesQ.data ?? []).length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No join codes yet.</TableCell></TableRow>
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
  const [description, setDescription] = useState("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      code,
      description: description.trim() || null,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="code">Code</Label>
        <div className="flex gap-2">
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono" />
          <Button type="button" variant="outline" onClick={() => setCode(randomCode())}>Generate</Button>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Spring 2024 Teachers" />
      </div>
      <div>
        <Label htmlFor="maxUses">Max Uses (optional)</Label>
        <Input id="maxUses" type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Leave empty for unlimited" />
      </div>
      <div>
        <Label htmlFor="expiresAt">Expires At (optional)</Label>
        <Input id="expiresAt" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </div>
      <Button type="submit" className="w-full">Create Code</Button>
    </form>
  );
}
