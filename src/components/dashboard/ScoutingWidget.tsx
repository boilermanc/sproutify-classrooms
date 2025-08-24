// CREATE: src/components/dashboard/ScoutingWidget.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/stores/AppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bug, 
  AlertTriangle, 
  Clock, 
  Eye,
  Plus,
  ArrowRight,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface ScoutingEntry {
  id: string;
  tower_id: string;
  tower_name: string;
  tower_location: string;
  pest: string;
  severity?: number;
  follow_up_needed: boolean;
  follow_up_date?: string;
  observed_at: string;
  notes?: string;
}

export function ScoutingWidget() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [activeIssues, setActiveIssues] = useState<ScoutingEntry[]>([]);
  const [overdueIssues, setOverdueIssues] = useState<ScoutingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadScoutingData();
    }
  }, [user]);

  const loadScoutingData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load active scouting entries
      const { data, error } = await supabase
        .from('pest_logs')
        .select(`
          id,
          tower_id,
          pest,
          severity,
          follow_up_needed,
          follow_up_date,
          observed_at,
          notes,
          towers!inner(name, location)
        `)
        .eq('teacher_id', user.id)
        .eq('resolved', false)
        .order('observed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform the data
      const transformedData = data?.map(entry => ({
        ...entry,
        tower_name: entry.towers.name,
        tower_location: entry.towers.location
      })) || [];

      // Separate active and overdue issues
      const now = new Date();
      const overdue = transformedData.filter(entry => 
        entry.follow_up_needed && 
        entry.follow_up_date && 
        new Date(entry.follow_up_date) < now
      );
      
      const active = transformedData.filter(entry => 
        !entry.follow_up_needed || 
        !entry.follow_up_date || 
        new Date(entry.follow_up_date) >= now
      );

      setActiveIssues(active);
      setOverdueIssues(overdue);
    } catch (error) {
      console.error('Error loading scouting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: number) => {
    switch (severity) {
      case 3: return "text-red-600";
      case 2: return "text-yellow-600"; 
      case 1: return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityBadge = (severity?: number) => {
    if (!severity) return null;
    
    const colors = {
      1: "bg-green-100 text-green-800",
      2: "bg-yellow-100 text-yellow-800", 
      3: "bg-red-100 text-red-800"
    };
    
    return <Badge className={colors[severity as keyof typeof colors]} size="sm">Level {severity}</Badge>;
  };

  const totalActiveIssues = activeIssues.length + overdueIssues.length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Scouting Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Scouting Overview
          </div>
          <div className="flex gap-2">
            {totalActiveIssues > 0 && (
              <Button
                onClick={() => navigate('/scouting')}
                variant="outline"
                size="sm"
              >
                View All ({totalActiveIssues})
              </Button>
            )}
            <Button
              onClick={() => navigate('/towers')}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalActiveIssues === 0 ? (
          <div className="text-center py-6">
            <Bug className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">All Clear! 🌱</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No active pest or disease issues detected.
            </p>
            <Button onClick={() => navigate('/towers')} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Record Observation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overdue Issues Alert */}
            {overdueIssues.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  <strong>Attention:</strong> {overdueIssues.length} issue{overdueIssues.length > 1 ? 's' : ''} need{overdueIssues.length === 1 ? 's' : ''} immediate follow-up!
                </AlertDescription>
              </Alert>
            )}

            {/* Priority Issues (Overdue + High Severity) */}
            {overdueIssues.slice(0, 2).map((issue) => (
              <div key={issue.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">{issue.pest}</h4>
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <span>{issue.tower_name}</span>
                      {issue.follow_up_date && (
                        <>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>Due {format(new Date(issue.follow_up_date), 'MMM d')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(issue.severity)}
                    <Badge className="bg-red-100 text-red-800" size="sm">
                      Overdue
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  {issue.notes && (
                    <p className="text-xs text-red-700 line-clamp-1 flex-1">
                      {issue.notes}
                    </p>
                  )}
                  <Button
                    onClick={() => navigate(`/towers/${issue.tower_id}?tab=scouting`)}
                    variant="outline"
                    size="sm"
                    className="ml-2"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                </div>
              </div>
            ))}

            {/* Recent Active Issues */}
            <div className="space-y-2">
              {activeIssues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{issue.pest}</h4>
                        {getSeverityBadge(issue.severity)}
                        {issue.follow_up_needed && (
                          <Badge variant="outline" size="sm" className="text-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Follow-up
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{issue.tower_name}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(issue.observed_at), 'MMM d')}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/towers/${issue.tower_id}?tab=scouting`)}
                      variant="ghost"
                      size="sm"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Footer */}
            {totalActiveIssues > 3 && (
              <div className="text-center pt-2 border-t">
                <Button
                  onClick={() => navigate('/scouting')}
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                >
                  View {totalActiveIssues - 3} more issue{totalActiveIssues - 3 > 1 ? 's' : ''}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {overdueIssues.length}
                </div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {activeIssues.filter(i => i.follow_up_needed).length}
                </div>
                <div className="text-xs text-muted-foreground">Follow-up</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {activeIssues.filter(i => !i.follow_up_needed).length}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}