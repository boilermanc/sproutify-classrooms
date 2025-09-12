import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

type MemberRow = {
  id: string; user_id: string; active: boolean; role: "super_admin"|"staff";
  profile?: { full_name: string | null; email?: string | null };
};

export default function TeamManager() {
  const { toast } = useToast();
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"super_admin"|"staff">("staff");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, user_id, active, role, profile:profiles!team_members_user_id_fkey(full_name, email)")
      .order("invited_at", { ascending: false });
    if (error) { console.error(error); return; }
    setRows((data ?? []) as any);
  }
  useEffect(()=>{ refresh(); }, []);

  async function invite() {
    if (!email) return;
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/invite-team-member`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ description: "Invitation sent." });
      setEmail("");
      await refresh();
    } catch (e:any) {
      toast({ variant:"destructive", description: e.message || "Invite failed" });
    } finally { setLoading(false); }
  }

  async function setMemberRole(id: string, newRole: "super_admin"|"staff") {
    const { error } = await supabase.from("team_members").update({ role: newRole }).eq("id", id);
    if (error) return toast({ variant:"destructive", description: error.message });
    await refresh();
  }
  async function toggleActive(id: string, next: boolean) {
    const { error } = await supabase.from("team_members").update({ active: next }).eq("id", id);
    if (error) return toast({ variant:"destructive", description: error.message });
    await refresh();
  }

  return (
    <Card>
      <CardHeader><CardTitle>Sproutify Team</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label className="block mb-1">Invite by email</Label>
            <Input placeholder="teammate@sproutify.app" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <Label className="block mb-1">Role</Label>
            <select className="w-full border rounded p-2" value={role} onChange={e=>setRole(e.target.value as any)}>
              <option value="staff">Staff</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <Button onClick={invite} disabled={loading || !email}>Send Invite</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b">
              <th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Role</th><th className="py-2 pr-4">Status</th><th className="py-2">Actions</th>
            </tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="border-b last:border-none">
                  <td className="py-2 pr-4">{r.profile?.full_name ?? r.user_id.slice(0,8)}</td>
                  <td className="py-2 pr-4">{r.profile?.email ?? "—"}</td>
                  <td className="py-2 pr-4"><Badge variant="secondary">{r.role}</Badge></td>
                  <td className="py-2 pr-4">{r.active ? <Badge>active</Badge> : <Badge variant="outline">inactive</Badge>}</td>
                  <td className="py-2 space-x-2">
                    <select className="border rounded p-1" value={r.role} onChange={e=>setMemberRole(r.id, e.target.value as any)}>
                      <option value="staff">staff</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={()=>toggleActive(r.id, !r.active)}>{r.active ? "Deactivate" : "Activate"}</Button>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td className="py-4 text-muted-foreground">No team members yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
