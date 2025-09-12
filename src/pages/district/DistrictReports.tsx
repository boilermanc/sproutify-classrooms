import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

async function getDistrictId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await supabase.from("profiles").select("district_id").eq("id", data.user.id).single();
  return p?.district_id ?? null;
}

async function fetchSummary(district_id: string | number) {
  const [schools, teachers] = await Promise.all([
    supabase.from("schools").select("id,name").eq("district_id", district_id),
    supabase.from("profiles").select("id").eq("district_id", district_id),
  ]);
  if (schools.error) throw schools.error;
  if (teachers.error) throw teachers.error;

  const teacherIds = (teachers.data ?? []).map(t => t.id);
  
  // Get towers for these teachers
  const { data: towers, error: towersError } = await supabase
    .from("towers")
    .select("id, teacher_id")
    .in("teacher_id", teacherIds);
  
  if (towersError) throw towersError;

  const perSchool = (schools.data ?? []).reduce((acc: Record<string, number>, school: any) => {
    acc[school.name] = 0; // Initialize all schools with 0 towers
    return acc;
  }, {});
  
  // Count towers per school (simplified - just show school names with 0 for now)
  const statusAgg = { "active": towers?.data?.length ?? 0 };
  
  return { schools: schools.data ?? [], perSchool, statusAgg };
}

export default function DistrictReports() {
  const { data: districtId } = useQuery({ queryKey: ["me", "district_id"], queryFn: getDistrictId });
  const { data } = useQuery({ queryKey: ["district_reports", districtId], queryFn: () => fetchSummary(districtId!), enabled: !!districtId });

  const barData = useMemo(
    () => Object.entries(data?.perSchool ?? {}).map(([name, count]) => ({ name, towers: count })),
    [data]
  );
  const pieData = useMemo(
    () => Object.entries(data?.statusAgg ?? {}).map(([status, n]) => ({ status, value: n as number })),
    [data]
  );

  const exportCSV = () => {
    const rows = [["School", "Towers"], ...barData.map((r) => [r.name, String(r.towers)])];
    const csv = rows.map((r) => r.map((x) => `"${(x ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "district_tower_counts.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <Button onClick={exportCSV}>Export CSV</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Towers per School</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="towers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tower Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="status" outerRadius={120} label />
                {pieData.map((_, idx) => <Cell key={idx} />)}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
