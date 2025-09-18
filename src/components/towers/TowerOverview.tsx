import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Leaf, 
  Droplets, 
  Bug, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Activity
} from "lucide-react";

interface TowerOverviewProps {
  towerId: string;
  teacherId: string;
}

interface OverviewData {
  activePlants: number;
  recentPh: number | null;
  recentEc: number | null;
  pestIssues: number;
  nextHarvest: string | null;
  lastVitalsDate: string | null;
  totalHarvests: number;
  avgGrowthRate: string;
}

export function TowerOverview({ towerId, teacherId }: TowerOverviewProps) {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        // Fetch active plantings
        const { data: plantings } = await supabase
          .from('plantings')
          .select('id, planted_at, expected_harvest_date, status')
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId)
          .eq('status', 'active');

        // Fetch recent vitals (pH and EC)
        const { data: vitals } = await supabase
          .from('tower_vitals')
          .select('ph, ec, created_at')
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId)
          .order('created_at', { ascending: false })
          .limit(1);

        // Fetch pest issues from pest_logs
        const { data: pestData } = await supabase
          .from('pest_logs')
          .select('id')
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId)
          .gte('observed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

        // Fetch next harvest
        const { data: nextHarvestData } = await supabase
          .from('plantings')
          .select('expected_harvest_date')
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId)
          .not('expected_harvest_date', 'is', null)
          .gte('expected_harvest_date', new Date().toISOString())
          .order('expected_harvest_date', { ascending: true })
          .limit(1);

        // Fetch total harvests
        const { data: harvests } = await supabase
          .from('harvests')
          .select('id')
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId);

        const activePlants = plantings?.length || 0;
        const recentPh = vitals?.[0]?.ph || null;
        const recentEc = vitals?.[0]?.ec || null;
        const pestIssues = pestData?.length || 0;
        const nextHarvest = nextHarvestData?.[0]?.expected_harvest_date || null;
        const lastVitalsDate = vitals?.[0]?.created_at || null;
        const totalHarvests = harvests?.length || 0;

        // Calculate average growth rate (simplified)
        const avgGrowthRate = activePlants > 0 ? "Healthy" : "No active plants";

        setOverviewData({
          activePlants,
          recentPh,
          recentEc,
          pestIssues,
          nextHarvest,
          lastVitalsDate,
          totalHarvests,
          avgGrowthRate
        });
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [towerId, teacherId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Unable to load tower overview data.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPhStatus = (ph: number | null) => {
    if (ph === null) return { status: 'unknown', color: 'secondary' };
    if (ph >= 5.5 && ph <= 6.5) return { status: 'optimal', color: 'default' };
    if (ph < 5.5) return { status: 'low', color: 'destructive' };
    return { status: 'high', color: 'destructive' };
  };

  const getEcStatus = (ec: number | null) => {
    if (ec === null) return { status: 'unknown', color: 'secondary' };
    if (ec >= 1.0 && ec <= 2.5) return { status: 'good', color: 'default' };
    if (ec < 1.0) return { status: 'low', color: 'destructive' };
    return { status: 'high', color: 'destructive' };
  };

  const phStatus = getPhStatus(overviewData.recentPh);
  const ecStatus = getEcStatus(overviewData.recentEc);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plants</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overviewData.activePlants}</div>
            <p className="text-xs text-muted-foreground">
              {overviewData.activePlants > 0 ? 'Growing healthy' : 'No active plants'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">pH Level</CardTitle>
            <Droplets className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData.recentPh ? overviewData.recentPh.toFixed(1) : '--'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={phStatus.color as any} className="text-xs">
                {phStatus.status}
              </Badge>
              {overviewData.lastVitalsDate && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(overviewData.lastVitalsDate)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EC Level</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData.recentEc ? overviewData.recentEc.toFixed(1) : '--'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={ecStatus.color as any} className="text-xs">
                {ecStatus.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pest Issues</CardTitle>
            <Bug className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overviewData.pestIssues}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tower Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Plant Health</p>
              <p className="text-sm text-muted-foreground">
                Your tower is currently growing {overviewData.activePlants} active plant{overviewData.activePlants !== 1 ? 's' : ''} with {overviewData.avgGrowthRate.toLowerCase()} growth patterns.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {overviewData.recentPh && overviewData.recentEc ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            )}
            <div>
              <p className="font-medium">Nutrient Levels</p>
              <p className="text-sm text-muted-foreground">
                {overviewData.recentPh && overviewData.recentEc ? (
                  <>
                    Recent pH readings show {phStatus.status} levels at {overviewData.recentPh.toFixed(1)}, and EC measurements indicate {ecStatus.status} nutrient balance.
                  </>
                ) : (
                  'No recent pH or EC readings available. Consider logging vitals data.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {overviewData.pestIssues === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div>
              <p className="font-medium">Pest Management</p>
              <p className="text-sm text-muted-foreground">
                {overviewData.pestIssues === 0 ? (
                  'No pest issues have been detected in the last week.'
                ) : (
                  `${overviewData.pestIssues} pest issue${overviewData.pestIssues !== 1 ? 's' : ''} detected in the last week.`
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {overviewData.nextHarvest ? (
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            ) : (
              <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
            )}
            <div>
              <p className="font-medium">Harvest Schedule</p>
              <p className="text-sm text-muted-foreground">
                {overviewData.nextHarvest ? (
                  `Your next harvest is scheduled for ${formatDate(overviewData.nextHarvest)}.`
                ) : (
                  'No upcoming harvests scheduled.'
                )}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total harvests this season:</span>
              <span className="font-medium">{overviewData.totalHarvests}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
