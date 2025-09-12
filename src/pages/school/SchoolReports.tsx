import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

async function getSchoolId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await supabase.from("profiles").select("school_id").eq("id", data.user.id).single();
  return p?.school_id ?? null;
}

async function fetchSummary(school_id: string | number) {
  const [towers, vitals] = await Promise.all([
    supabase.from("towers").select("id, status").eq("school_id", school_id),
    supabase
      .from("tower_vitals")
      .select("created_at")
      .eq("school_id", school_id)
      .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true }),
  ]);
  if (towers.error) throw towers.error;
  if (vitals.error) throw vitals.error;

  const statusAgg = (towers.data ?? []).reduce((acc: Record<string, number>, t: any) => {
    const key = t.status ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const bucket = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    bucket.set(d.toISOString().slice(0,10), 0);
  }
  (vitals.data ?? []).forEach((row: any) => {
    const k = row.created_at.slice(0,10);
    if (bucket.has(k)) bucket.set(k, (bucket.get(k) || 0) + 1);
  });

  return { statusAgg, series: Array.from(bucket.entries()).map(([date, submissions]) => ({ date, submissions })) };
}

export default function SchoolReports() {
  const { data: schoolId } = useQuery({ queryKey: ["me", "school_id"], queryFn: getSchoolId });
  const { data } = useQuery({ queryKey: ["school_reports", schoolId], queryFn: () => fetchSummary(schoolId!), enabled: !!schoolId });

  const pieData = useMemo(
    () => Object.entries(data?.statusAgg ?? {}).map(([status, value]) => ({ status, value: value as number })),
    [data]
  );
  const lineData = data?.series ?? [];

  const exportCSV = () => {
    const rows = [["Date","Submissions"], ...lineData.map(r => [r.date, String(r.submissions)])];
    const csv = rows.map(r => r.map(x => `"${(x ?? "").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "school_activity_14d.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <Button onClick={exportCSV}>Export CSV</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Activity (last 14 days)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="submissions" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tower Status Mix</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="status" outerRadius={120} label />
                {pieData.map((_, i) => <Cell key={i} />)}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
