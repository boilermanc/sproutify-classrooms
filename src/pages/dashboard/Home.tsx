import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

        const [towersResult, plantsResult, harvestsResult] = await Promise.all([
          supabase
            .from('towers')
            .select('id', { count: 'exact', head: true })
            .eq('teacher_id', user.id),
          supabase
            .from('plantings')
            .select('id', { count: 'exact', head: true })
            .eq('teacher_id', user.id),
          supabase
            .from('harvests')
            .select('id', { count: 'exact', head: true })
            .eq('teacher_id', user.id)
        ]);

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
      <Link to="/app/towers" className="hover:opacity-90 transition-opacity">
        <Card>
          <CardHeader><CardTitle>Total Towers</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{stats.towers}</CardContent>
        </Card>
      </Link>

      {/* 1. Wrapped the "Plants" Card in a Link */}
      <Link to="/app/plants" className="hover:opacity-90 transition-opacity">
        <Card>
          <CardHeader><CardTitle>Plants</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{stats.plants}</CardContent>
        </Card>
      </Link>

      {/* 2. Wrapped the "Harvests" Card in a Link */}
      <Link to="/app/harvests" className="hover:opacity-90 transition-opacity">
        <Card>
          <CardHeader><CardTitle>Harvests</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{stats.harvests}</CardContent>
        </Card>
      </Link>
    </div>
  );
}
