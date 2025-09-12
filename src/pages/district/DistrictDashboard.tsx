import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2, School, Users, Sprout, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Profile = { id: string; district_id: number | string | null };

async function getMe(): Promise<Profile | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, district_id")
    .eq("id", data.user.id)
    .single();
  return profile as Profile | null;
}

async function getDistrictSummary(district_id: string | number) {
  try {
    // Get schools in the district
    const { data: schools } = await supabase
      .from("schools")
      .select("id,name")
      .eq("district_id", district_id);

    // Get teachers in the district (through profiles with district_id)
    const { count: teachersCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("district_id", district_id);

    // Get towers count by finding teachers in the district and counting their towers
    const { data: districtTeachers } = await supabase
      .from("profiles")
      .select("id")
      .eq("district_id", district_id);

    let towersCount = 0;
    if (districtTeachers && districtTeachers.length > 0) {
      const teacherIds = districtTeachers.map(t => t.id);
      const { count } = await supabase
        .from("towers")
        .select("*", { count: "exact", head: true })
        .in("teacher_id", teacherIds);
      towersCount = count || 0;
    }

    // Per-school tower counts for a small chart
    let perSchoolAgg: Record<string, number> = {};
    if (schools && schools.length > 0) {
      const schoolIds = schools.map(s => s.id);
      
      // Get teachers for each school
      const { data: schoolTeachers } = await supabase
        .from("profiles")
        .select("id, schools(id, name)")
        .in("school_id", schoolIds);

      if (schoolTeachers && schoolTeachers.length > 0) {
        const teacherIds = schoolTeachers.map(t => t.id);
        
        // Get towers for these teachers
        const { data: towers } = await supabase
          .from("towers")
          .select("teacher_id, profiles(schools(name))")
          .in("teacher_id", teacherIds);

        if (towers) {
          perSchoolAgg = towers.reduce((acc: Record<string, number>, tower: any) => {
            const schoolName = tower.profiles?.schools?.name || 'Unknown School';
            acc[schoolName] = (acc[schoolName] || 0) + 1;
            return acc;
          }, {});
        }
      }
    }

    return {
      schools: schools ?? [],
      teachersCount: teachersCount ?? 0,
      towersCount,
      perSchoolAgg,
    };
  } catch (error) {
    console.error("Error fetching district summary:", error);
    return {
      schools: [],
      teachersCount: 0,
      towersCount: 0,
      perSchoolAgg: {},
    };
  }
}

export default function DistrictDashboard() {
  const me = useQuery({ queryKey: ["me"], queryFn: getMe });
  const districtId = me.data?.district_id ?? null;

  const summary = useQuery({
    queryKey: ["district_summary", districtId],
    queryFn: () => getDistrictSummary(districtId as string | number),
    enabled: !!districtId,
  });

  const chartData = useMemo(() => {
    const entries = Object.entries(summary.data?.perSchoolAgg ?? {});
    // Keep top 8 by count for readability
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 8).map(([name, count]) => ({ name, towers: count }));
  }, [summary.data]);

  if (me.isLoading || summary.isLoading) {
    return <div className="p-6">Loading dashboard…</div>;
  }

  if (me.error || summary.error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              {me.error?.message || summary.error?.message || "An error occurred while loading the dashboard."}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try refreshing the page or contact support if the issue persists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!districtId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No district linked</CardTitle>
          </CardHeader>
          <CardContent>
            Your profile is missing a <code>district_id</code>. Please contact an admin or update your settings.
          </CardContent>
        </Card>
      </div>
    );
  }

  const schoolsCount = summary.data?.schools.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">District Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link to="/district/settings">District Settings</Link>
          </Button>
          <Button asChild>
            <Link to="/district/schools">Manage Schools</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schools</CardTitle>
            <Building2 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolsCount}</div>
            <p className="text-xs text-muted-foreground">Schools in district</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.data?.teachersCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active teacher accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Towers</CardTitle>
            <Sprout className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.data?.towersCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Registered towers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Schools</CardTitle>
            <BarChart3 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.min(chartData.length, 8)}</div>
            <p className="text-xs text-muted-foreground">By tower count</p>
          </CardContent>
        </Card>
      </div>

      {summary.data?.towersCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tower distribution by school</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Button asChild variant="outline"><Link to="/district/teachers">View Teachers</Link></Button>
          <Button asChild variant="outline"><Link to="/district/schools">View Schools</Link></Button>
          <Button asChild variant="outline"><Link to="/district/reports">Reports</Link></Button>
          <Button asChild variant="outline"><Link to="/district/join-codes">Join Codes</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
