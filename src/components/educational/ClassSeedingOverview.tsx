import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sprout, TrendingUp, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClassSeedingOverviewProps {
  classroomId: string;
  onActionClick?: (action: 'start-seeding' | 'check-germination' | 'transfer-towers') => void;
}

interface SeedingStats {
  totalSeedings: number;
  activeSeedings: number;
  germinationRate: number;
  studentsParticipating: number;
  recentSeedings: any[];
}

export default function ClassSeedingOverview({ classroomId, onActionClick }: ClassSeedingOverviewProps) {
  const { toast } = useToast();
  const [stats, setStats] = useState<SeedingStats>({
    totalSeedings: 0,
    activeSeedings: 0,
    germinationRate: 0,
    studentsParticipating: 0,
    recentSeedings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassStats();
  }, [classroomId]);

  const fetchClassStats = async () => {
    try {
      setLoading(true);
      
      // Get all seedings for this classroom
      // Note: This will need to be updated once we have the proper seeding tables
      const { data: seedings, error } = await supabase
        .from('plantings')
        .select(`
          id,
          name,
          seeded_at,
          planted_at,
          status,
          teacher_id
        `)
        .not('seeded_at', 'is', null);

      if (error) {
        console.log('No seeding data yet, using mock data for demo');
        // For now, use mock data until we have proper seeding tables
        setStats({
          totalSeedings: 0,
          activeSeedings: 0,
          germinationRate: 0,
          studentsParticipating: 0,
          recentSeedings: [],
        });
        return;
      }

      const totalSeedings = seedings?.length || 0;
      const activeSeedings = seedings?.filter(s => s.status === 'active' && s.seeded_at).length || 0;
      const germinatedSeedings = seedings?.filter(s => s.planted_at).length || 0;
      const germinationRate = totalSeedings > 0 ? (germinatedSeedings / totalSeedings) * 100 : 0;
      const studentsParticipating = new Set(seedings?.map(s => s.teacher_id)).size;
      const recentSeedings = seedings?.slice(-5) || [];

      setStats({
        totalSeedings,
        activeSeedings,
        germinationRate,
        studentsParticipating,
        recentSeedings,
      });
    } catch (error) {
      console.error('Error fetching class stats:', error);
      // Set empty stats on error
      setStats({
        totalSeedings: 0,
        activeSeedings: 0,
        germinationRate: 0,
        studentsParticipating: 0,
        recentSeedings: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Sprout className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalSeedings}</div>
                <div className="text-xs text-muted-foreground">Total Seedings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.activeSeedings}</div>
                <div className="text-xs text-muted-foreground">Active Seedings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{Math.round(stats.germinationRate)}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.studentsParticipating}</div>
                <div className="text-xs text-muted-foreground">Students Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Seeding Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSeedings.length === 0 ? (
            <div className="text-center py-8">
              <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No seeding activity yet. Students can start their first seedings!
              </p>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Ready to Start
              </Badge>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentSeedings.map((seeding) => (
                <div key={seeding.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{seeding.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {seeding.quantity} seeds • {seeding.seeded_at ? 'Seeded' : 'Not seeded'}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${
                      seeding.planted_at ? 'bg-green-100 text-green-800' :
                      seeding.seeded_at ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {seeding.planted_at ? 'Transplanted' :
                       seeding.seeded_at ? 'Seeded' : 'Pending'}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {seeding.seeded_at ? new Date(seeding.seeded_at).toLocaleDateString() : 'Not started'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted transition-colors"
              onClick={() => onActionClick?.('start-seeding')}
            >
              <Sprout className="h-8 w-8 text-primary" />
              <div className="text-center">
                <h4 className="font-medium mb-1">Start New Seeding</h4>
                <p className="text-sm text-muted-foreground">
                  Begin a new rockwool seeding session
                </p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted transition-colors"
              onClick={() => onActionClick?.('check-germination')}
            >
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="text-center">
                <h4 className="font-medium mb-1">Check Germination</h4>
                <p className="text-sm text-muted-foreground">
                  Review and update germination status
                </p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted transition-colors"
              onClick={() => onActionClick?.('transfer-towers')}
            >
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <h4 className="font-medium mb-1">Transfer to Towers</h4>
                <p className="text-sm text-muted-foreground">
                  Move successful seedlings to towers
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
