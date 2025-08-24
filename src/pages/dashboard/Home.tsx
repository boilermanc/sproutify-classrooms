// src/pages/dashboard/Home.tsx - Enhanced with Harvest Dashboard
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Leaf, Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

type Stats = {
  towers: number;
  plants: number;
  harvests: number;
};

type HarvestSummary = {
  towerId: string;
  towerName: string;
  plantName: string;
  expectedHarvestDate: string;
  daysRemaining: number;
  status: 'overdue' | 'today' | 'soon' | 'upcoming';
};

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({ towers: 0, plants: 0, harvests: 0 });
  const [harvestSummary, setHarvestSummary] = useState<HarvestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Please log in to view your dashboard.");
          return;
        }
        
        setTeacherId(user.id);

        // Fetch basic stats
        const [towersRes, plantsRes, harvestsRes] = await Promise.all([
          supabase.from("towers").select("id").eq("teacher_id", user.id),
          supabase.from("plantings").select("id").eq("teacher_id", user.id),
          supabase.from("harvests").select("id").eq("teacher_id", user.id)
        ]);

        setStats({
          towers: towersRes.data?.length || 0,
          plants: plantsRes.data?.length || 0,
          harvests: harvestsRes.data?.length || 0
        });

        // Fetch harvest data for the widget
        const { data: harvestData, error: harvestError } = await supabase
          .from('plantings')
          .select(`
            id,
            name,
            expected_harvest_date,
            tower_id,
            towers!inner(id, name)
          `)
          .eq('teacher_id', user.id)
          .eq('status', 'active')
          .not('expected_harvest_date', 'is', null)
          .order('expected_harvest_date', { ascending: true });

        if (harvestError) throw harvestError;

        const today = new Date();
        const processed = harvestData.map(plant => {
          const harvestDate = new Date(plant.expected_harvest_date!);
          const diffTime = harvestDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let status: HarvestSummary['status'] = 'upcoming';
          if (daysRemaining < 0) status = 'overdue';
          else if (daysRemaining === 0) status = 'today';
          else if (daysRemaining <= 7) status = 'soon';

          return {
            towerId: plant.tower_id,
            towerName: plant.towers.name,
            plantName: plant.name,
            expectedHarvestDate: plant.expected_harvest_date!,
            daysRemaining: Math.abs(daysRemaining),
            status
          };
        });

        setHarvestSummary(processed);

      } catch (err: any) {
        console.error("Error loading dashboard:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'today': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'soon': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Calendar className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string, daysRemaining: number) => {
    const variants = {
      overdue: 'destructive',
      today: 'default',
      soon: 'secondary',
      upcoming: 'outline'
    } as const;

    const text = {
      overdue: `${daysRemaining}d overdue`,
      today: 'Ready now!',
      soon: `${daysRemaining}d left`,
      upcoming: `${daysRemaining} days`
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {text[status as keyof typeof text]}
      </Badge>
    );
  };

  // Group harvests by priority
  const urgentHarvests = harvestSummary.filter(h => h.status === 'overdue' || h.status === 'today');
  const soonHarvests = harvestSummary.filter(h => h.status === 'soon');
  const upcomingHarvests = harvestSummary.filter(h => h.status === 'upcoming').slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-6">
        <SEO title="Dashboard – Sproutify School" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error} Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="Dashboard – Sproutify School" />
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your classroom towers and growing progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/app/towers" className="hover:opacity-90 transition-opacity">
          <Card>
            <CardHeader><CardTitle>Total Towers</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{stats.towers}</CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader><CardTitle>Active Plants</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{stats.plants}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Total Harvests</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{stats.harvests}</CardContent>
        </Card>
      </div>

      {/* Harvest Dashboard Widget */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Harvest Schedule
            </CardTitle>
            {harvestSummary.length > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link to="/app/catalog">Manage Plants</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {harvestSummary.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No harvest dates scheduled</h3>
              <p className="text-muted-foreground mb-4">
                Add expected harvest dates to your plants to see the schedule here.
              </p>
              <Button asChild>
                <Link to="/app/catalog">
                  <Leaf className="h-4 w-4 mr-2" />
                  Add Plants from Catalog
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Urgent harvests */}
              {urgentHarvests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Needs Immediate Attention
                  </h4>
                  {urgentHarvests.map((harvest, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(harvest.status)}
                        <div>
                          <p className="font-medium">{harvest.plantName}</p>
                          <p className="text-sm text-muted-foreground">
                            {harvest.towerName} • {new Date(harvest.expectedHarvestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(harvest.status, harvest.daysRemaining)}
                        <Button asChild size="sm">
                          <Link to={`/app/towers/${harvest.towerId}?tab=plants`}>
                            View Tower
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coming soon */}
              {soonHarvests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-yellow-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Coming This Week
                  </h4>
                  {soonHarvests.map((harvest, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(harvest.status)}
                        <div>
                          <p className="font-medium">{harvest.plantName}</p>
                          <p className="text-sm text-muted-foreground">{harvest.towerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(harvest.status, harvest.daysRemaining)}
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/app/towers/${harvest.towerId}?tab=plants`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming */}
              {upcomingHarvests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming
                  </h4>
                  {upcomingHarvests.map((harvest, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(harvest.status)}
                        <div>
                          <p className="font-medium">{harvest.plantName}</p>
                          <p className="text-sm text-muted-foreground">{harvest.towerName}</p>
                        </div>
                      </div>
                      {getStatusBadge(harvest.status, harvest.daysRemaining)}
                    </div>
                  ))}
                </div>
              )}

              {harvestSummary.length > (urgentHarvests.length + soonHarvests.length + upcomingHarvests.length) && (
                <div className="text-center pt-2 border-t">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/app/catalog">
                      View All Plants ({harvestSummary.length} total)
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}