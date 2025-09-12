import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart3, Sprout, Users, GraduationCap, Camera } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Profile = { id: string; school_id: number | string | null };

async function getMe(): Promise<Profile | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, school_id")
    .eq("id", data.user.id)
    .single();
  return profile as Profile | null;
}

async function getSchoolSummary(school_id: string | number) {
  // Get teachers in the school
  const { data: schoolTeachers } = await supabase
    .from("profiles")
    .select("id")
    .eq("school_id", school_id);

  const teacherIds = schoolTeachers?.map(t => t.id) || [];

  // Get counts for towers, classrooms, and students
  const [{ count: towersCount }, { count: classroomsCount }, { count: studentsCount }, { data: recentVitals }] =
    await Promise.all([
      // Count towers for teachers in this school
      teacherIds.length > 0 
        ? supabase.from("towers").select("*", { count: "exact", head: true }).in("teacher_id", teacherIds)
        : { count: 0 },
      
      // Count classrooms for teachers in this school
      teacherIds.length > 0
        ? supabase.from("classrooms").select("*", { count: "exact", head: true }).in("teacher_id", teacherIds)
        : { count: 0 },
      
      // Count students in classrooms for teachers in this school
      teacherIds.length > 0
        ? supabase.from("students").select("id", { count: "exact", head: true })
            .in("classroom_id", 
              supabase.from("classrooms").select("id").in("teacher_id", teacherIds)
            )
        : { count: 0 },
      
      // Get recent vitals for towers belonging to teachers in this school
      teacherIds.length > 0
        ? supabase
            .from("tower_vitals")
            .select("created_at")
            .in("tower_id", 
              supabase.from("towers").select("id").in("teacher_id", teacherIds)
            )
            .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
            .order("created_at", { ascending: true })
        : { data: [] },
    ]);

  return {
    towersCount: towersCount ?? 0,
    classroomsCount: classroomsCount ?? 0,
    studentsCount: studentsCount ?? 0,
    recentVitals: recentVitals ?? [],
  };
}

export default function SchoolDashboard() {
  const me = useQuery({ queryKey: ["me"], queryFn: getMe });
  const schoolId = me.data?.school_id ?? null;

  const summary = useQuery({
    queryKey: ["school_summary", schoolId],
    queryFn: () => getSchoolSummary(schoolId as string | number),
    enabled: !!schoolId,
  });

  const chartData = useMemo(() => {
    // Bucket recent vitals by day
    const bucket = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      bucket.set(key, 0);
    }
    (summary.data?.recentVitals ?? []).forEach((row: { created_at: string }) => {
      const key = row.created_at.slice(0, 10);
      if (bucket.has(key)) bucket.set(key, (bucket.get(key) || 0) + 1);
    });
    return Array.from(bucket.entries()).map(([date, count]) => ({ date, submissions: count }));
  }, [summary.data]);

  if (me.isLoading || summary.isLoading) {
    return <div className="p-6">Loading dashboard…</div>;
  }

  if (!schoolId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No school linked</CardTitle>
          </CardHeader>
          <CardContent>
            Your profile is missing a <code>school_id</code>. Please contact an admin or update your settings.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">School Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link to="/school/settings">School Settings</Link>
          </Button>
          <Button asChild>
            <Link to="/app/kiosk">Open Kiosk</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Towers</CardTitle>
            <Sprout className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.data?.towersCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active towers at your school</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classrooms</CardTitle>
            <GraduationCap className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.data?.classroomsCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Participating classrooms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.data?.studentsCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions (14d)</CardTitle>
            <Camera className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.reduce((a, b) => a + b.submissions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Vitals/photos & other entries</p>
          </CardContent>
        </Card>
      </div>

      {chartData.some(d => d.submissions > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
      )}
    </div>
  );
}
