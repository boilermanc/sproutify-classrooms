import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  Droplets, 
  Bug, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  Sprout,
  Zap,
  Shield
} from "lucide-react";

interface StudentTowerOverviewProps {
  towerId: string;
}

interface OverviewData {
  activePlants: number;
  recentPh: number | null;
  recentEc: number | null;
  pestIssues: number;
  nextHarvest: string | null;
  lastVitalsDate: string | null;
  totalHarvests: number;
  plantings: Array<{
    id: string;
    name: string;
    port_number: number | null;
    planted_at: string | null;
    expected_harvest_date: string | null;
    status: string;
  }>;
  pests: Array<{
    id: string;
    pest: string;
    severity: number | null;
    observed_at: string;
  }>;
  nextHarvestPlant: string | null;
}

export function StudentTowerOverview({ towerId }: StudentTowerOverviewProps) {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedBox, setExpandedBox] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        // Get classroom ID from localStorage to find teacher
        const classroomId = localStorage.getItem('student_classroom_id');
        if (!classroomId) return;

        // Get teacher ID from classroom
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('teacher_id')
          .eq('id', classroomId)
          .single();

        if (!classroom?.teacher_id) return;

        const teacherId = classroom.teacher_id;

        // Execute all queries in parallel to avoid N+1 pattern
        const [
          plantingsResult,
          vitalsResult,
          pestDataResult,
          nextHarvestResult,
          harvestsResult
        ] = await Promise.all([
          // Fetch active plantings
          supabase
            .from('plantings')
            .select('id, planted_at, expected_harvest_date, status, name')
            .eq('tower_id', towerId)
            .eq('teacher_id', teacherId)
            .eq('status', 'active'),
          
          // Fetch recent vitals (pH and EC)
          supabase
            .from('tower_vitals')
            .select('ph, ec, created_at')
            .eq('tower_id', towerId)
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false })
            .limit(1),
          
          // Fetch pest issues from pest_logs
          supabase
            .from('pest_logs')
            .select('id, pest, severity, observed_at')
            .eq('tower_id', towerId)
            .eq('teacher_id', teacherId)
            .gte('observed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()), // Last 7 days
          
          // Fetch next harvest
          supabase
            .from('plantings')
            .select('expected_harvest_date, name')
            .eq('tower_id', towerId)
            .eq('teacher_id', teacherId)
            .not('expected_harvest_date', 'is', null)
            .gte('expected_harvest_date', new Date().toISOString())
            .order('expected_harvest_date', { ascending: true })
            .limit(1),
          
          // Fetch total harvests
          supabase
            .from('harvests')
            .select('id')
            .eq('tower_id', towerId)
            .eq('teacher_id', teacherId)
        ]);

        const plantings = plantingsResult.data || [];
        const vitals = vitalsResult.data || [];
        const pestData = pestDataResult.data || [];
        const nextHarvestData = nextHarvestResult.data || [];
        const harvests = harvestsResult.data || [];

        const activePlants = plantings.length;
        const recentPh = vitals[0]?.ph || null;
        const recentEc = vitals[0]?.ec || null;
        const pestIssues = pestData.length;
        const nextHarvest = nextHarvestData[0]?.expected_harvest_date || null;
        const lastVitalsDate = vitals[0]?.created_at || null;
        const totalHarvests = harvests.length;

        setOverviewData({
          activePlants,
          recentPh,
          recentEc,
          pestIssues,
          nextHarvest,
          lastVitalsDate,
          totalHarvests,
          plantings,
          pests: pestData,
          nextHarvestPlant: nextHarvestData[0]?.name || null,
        });
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [towerId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-6 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
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
    if (ph === null) return { status: 'unknown', color: 'secondary', icon: AlertTriangle };
    if (ph >= 5.5 && ph <= 6.5) return { status: 'optimal', color: 'default', icon: CheckCircle };
    if (ph < 5.5) return { status: 'low', color: 'destructive', icon: AlertTriangle };
    return { status: 'high', color: 'destructive', icon: AlertTriangle };
  };

  const getEcStatus = (ec: number | null) => {
    if (ec === null) return { status: 'unknown', color: 'secondary', icon: AlertTriangle };
    if (ec >= 1.0 && ec <= 2.5) return { status: 'good', color: 'default', icon: CheckCircle };
    if (ec < 1.0) return { status: 'low', color: 'destructive', icon: AlertTriangle };
    return { status: 'high', color: 'destructive', icon: AlertTriangle };
  };

  const phStatus = getPhStatus(overviewData.recentPh);
  const ecStatus = getEcStatus(overviewData.recentEc);

  const toggleExpanded = (boxId: string) => {
    setExpandedBox(expandedBox === boxId ? null : boxId);
  };

  return (
    <div className="space-y-4">
      {/* Unified Dashboard Grid - All 5 cards in one row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Plants Box */}
        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-green-200"
          onClick={() => toggleExpanded('plants')}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Sprout className="h-5 w-5 text-green-600" />
              </div>
              {expandedBox === 'plants' ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <div className="text-xl font-bold text-green-600 mb-1">
              {overviewData.activePlants}
            </div>
            <div className="text-xs text-muted-foreground">
              Active Plants
            </div>
            
            {expandedBox === 'plants' && (
              <div className="mt-3 pt-3 border-t">
                <div className="space-y-2">
                  {overviewData.plantings.length > 0 ? (
                    overviewData.plantings.map((planting, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="font-medium">{planting.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Port {planting.port_number || '?'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No active plants</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issues Box */}
        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-red-200"
          onClick={() => toggleExpanded('issues')}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Bug className="h-5 w-5 text-red-600" />
              </div>
              {expandedBox === 'issues' ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <div className="text-xl font-bold text-red-600 mb-1">
              {overviewData.pestIssues}
            </div>
            <div className="text-xs text-muted-foreground">
              Pest Issues
            </div>
            
            {expandedBox === 'issues' && (
              <div className="mt-3 pt-3 border-t">
                <div className="space-y-2">
                  {overviewData.pests.length > 0 ? (
                    overviewData.pests.map((pest, index) => (
                      <div key={index} className="text-xs">
                        <div className="font-medium">{pest.pest}</div>
                        <div className="text-xs text-muted-foreground">
                          Severity: {pest.severity || 'Unknown'} • {formatDate(pest.observed_at)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No pest issues detected</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* pH Box */}
        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-200"
          onClick={() => toggleExpanded('ph')}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              {expandedBox === 'ph' ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <div className="text-xl font-bold text-blue-600 mb-1">
              {overviewData.recentPh ? overviewData.recentPh.toFixed(1) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">
              pH Level
            </div>
            
            {expandedBox === 'ph' && (
              <div className="mt-3 pt-3 border-t">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <phStatus.icon className="h-3 w-3" />
                    <Badge variant={phStatus.color as any} className="text-xs">
                      {phStatus.status}
                    </Badge>
                  </div>
                  {overviewData.lastVitalsDate && (
                    <p className="text-xs text-muted-foreground">
                      Last reading: {formatDate(overviewData.lastVitalsDate)}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Optimal range: 5.5 - 6.5
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* EC Box */}
        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-purple-200"
          onClick={() => toggleExpanded('ec')}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              {expandedBox === 'ec' ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <div className="text-xl font-bold text-purple-600 mb-1">
              {overviewData.recentEc ? overviewData.recentEc.toFixed(1) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">
              EC Level
            </div>
            
            {expandedBox === 'ec' && (
              <div className="mt-3 pt-3 border-t">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ecStatus.icon className="h-3 w-3" />
                    <Badge variant={ecStatus.color as any} className="text-xs">
                      {ecStatus.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Optimal range: 1.0 - 2.5
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Harvest Schedule Box */}
        <Card 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-orange-200"
          onClick={() => toggleExpanded('harvest')}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              {expandedBox === 'harvest' ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <div className="text-lg font-bold text-orange-600 mb-1">
              {overviewData.nextHarvest ? formatDate(overviewData.nextHarvest) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">
              Harvest Schedule
            </div>
            
            {expandedBox === 'harvest' && (
              <div className="mt-3 pt-3 border-t">
                <div className="space-y-2">
                  {overviewData.nextHarvest ? (
                    <div className="space-y-1">
                      <div className="text-xs font-medium">{overviewData.nextHarvestPlant || 'Plant'}</div>
                      <div className="text-xs text-muted-foreground">
                        Expected: {formatDate(overviewData.nextHarvest)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-2 w-2 mr-1" />
                        Upcoming
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No harvests scheduled</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Total this season:</span>
                    <span className="text-xs font-medium">{overviewData.totalHarvests}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
