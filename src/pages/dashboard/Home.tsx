import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type DashboardStats = {
  towers: number;
  plants: number;
  harvests: number;
};

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({ towers: 0, plants: 0, harvests: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Authentication required");
        }

        // Fetch all counts in parallel
        const [towersResult, plantsResult, harvestsResult] = await Promise.all([
          // Count towers
          supabase
            .from('towers')
            .select('id', { count: 'exact', head: true })
            .eq('teacher_id', user.id),
          
          // Count plantings
          supabase
            .from('plantings')
            .select('id', { count: 'exact', head: true })
            .eq('teacher_id', user.id),
          
          // Count harvests
          supabase
            .from('harvests')
            .select('id', { count: 'exact', head: true })
            .eq('teacher_id', user.id)
        ]);

        // Check for errors
        if (towersResult.error) throw towersResult.error;
        if (plantsResult.error) throw plantsResult.error;
        if (harvestsResult.error) throw harvestsResult.error;

        setStats({
          towers: towersResult.count || 0,
          plants: plantsResult.count || 0,
          harvests: harvestsResult.count || 0,
        });

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Towers</CardTitle></CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-16" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Plants</CardTitle></CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-16" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Harvests</CardTitle></CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-16" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle>Total Towers</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{stats.towers}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Plants</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{stats.plants}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Harvests</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{stats.harvests}</CardContent>
      </Card>
    </div>
  );
}
