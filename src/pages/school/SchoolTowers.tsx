import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

async function getSchoolId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await supabase.from("profiles").select("school_id").eq("id", data.user.id).single();
  return p?.school_id ?? null;
}

async function fetchTowers(school_id: string | number) {
  const { data, error } = await supabase
    .from("towers")
    .select("id, name, status")
    .eq("school_id", school_id)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export default function SchoolTowers() {
  const { data: schoolId } = useQuery({ queryKey: ["me", "school_id"], queryFn: getSchoolId });
  const towersQ = useQuery({ queryKey: ["school_towers", schoolId], queryFn: () => fetchTowers(schoolId!), enabled: !!schoolId });

  const [search, setSearch] = useState("");
  const rows = useMemo(() => {
    const list = towersQ.data ?? [];
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter((t: any) => [t.name, t.status].join(" ").toLowerCase().includes(s));
  }, [towersQ.data, search]);

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Towers</h1>
        <Input placeholder="Search towers…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Registered Towers</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as any[]).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.status ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <a href={`/app/towers/${t.id}`}>Open in Teacher App</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!towersQ.isLoading && rows.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No towers yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
