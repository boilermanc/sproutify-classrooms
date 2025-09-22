// src/components/RecentActivityWidget.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Camera } from 'lucide-react';
import { SourceDetailModal } from '@/components/modals/SourceDetailModal';

interface Activity {
  type: string;
  date: string;
  icon: string;
  title: string;
  description: string;
  tower?: string;
  student?: string;
  sourceId?: string;
  towerId?: string;
}

interface RecentActivityWidgetProps {
  teacherId: string;
  maxItems?: number;
}

export function RecentActivityWidget({ 
  teacherId, 
  maxItems = 8 
}: RecentActivityWidgetProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('');
  const [selectedTowerId, setSelectedTowerId] = useState<string>('');

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Fetch recent activities from multiple tables
        const [vitalsData, photosData, harvestsData, plantingsData, pestsData, milestonesData] = await Promise.all([
          supabase
            .from('tower_vitals')
            .select('recorded_at, ph, ec, towers(name)')
            .eq('teacher_id', teacherId)
            .order('recorded_at', { ascending: false })
            .limit(5),
          
          supabase
            .from('tower_photos')
            .select('taken_at, caption, student_name, towers(name)')
            .eq('teacher_id', teacherId)
            .order('taken_at', { ascending: false })
            .limit(5),
          
          supabase
            .from('harvests')
            .select('harvested_at, plant_name, plant_quantity, weight_grams, tower_id, towers(name)')
            .eq('teacher_id', teacherId)
            .order('harvested_at', { ascending: false })
            .limit(5),
          
          supabase
            .from('plantings')
            .select('planted_at, name, towers(name)')
            .eq('teacher_id', teacherId)
            .order('planted_at', { ascending: false })
            .limit(5),
          
          supabase
            .from('pest_logs')
            .select('observed_at, pest, towers(name)')
            .eq('teacher_id', teacherId)
            .order('observed_at', { ascending: false })
            .limit(5),
          
          supabase
            .from('tower_documents')
            .select('created_at, title, milestone_type, classrooms(name)')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        const allActivities: Activity[] = [];

        // Process vitals
        vitalsData.data?.forEach(vital => {
          allActivities.push({
            type: 'vitals',
            date: vital.recorded_at,
            icon: '📊',
            title: 'Vitals Recorded',
            description: `pH: ${vital.ph}, EC: ${vital.ec}`,
            tower: vital.towers?.name || 'Unknown Tower',
            sourceId: `vital-${vital.id}`,
            towerId: vital.tower_id
          });
        });

        // Process photos
        photosData.data?.forEach(photo => {
          allActivities.push({
            type: 'photo',
            date: photo.taken_at,
            icon: '📸',
            title: 'Photo Added',
            description: photo.caption || 'Tower photo',
            tower: photo.towers?.name || 'Unknown Tower',
            student: photo.student_name,
            sourceId: `photo-${photo.id}`,
            towerId: photo.tower_id
          });
        });

        // Process harvests
        harvestsData.data?.forEach(harvest => {
          allActivities.push({
            type: 'harvest',
            date: harvest.harvested_at,
            icon: '🥗',
            title: 'Harvest Completed',
            description: `${harvest.plant_name} (${harvest.weight_grams}g)`,
            tower: harvest.towers?.name || 'Unknown Tower',
            sourceId: `harvest-${harvest.id}`,
            towerId: harvest.tower_id
          });
        });

        // Process plantings
        plantingsData.data?.forEach(planting => {
          allActivities.push({
            type: 'plant',
            date: planting.planted_at,
            icon: '🌱',
            title: 'Plant Added',
            description: planting.name,
            tower: planting.towers?.name || 'Unknown Tower',
            sourceId: `plant-${planting.id}`,
            towerId: planting.tower_id
          });
        });

        // Process pests
        pestsData.data?.forEach(pest => {
          allActivities.push({
            type: 'pest',
            date: pest.observed_at,
            icon: '🐛',
            title: 'Pest Observed',
            description: pest.pest,
            tower: pest.towers?.name || 'Unknown Tower',
            sourceId: `pest-${pest.id}`,
            towerId: pest.tower_id
          });
        });

        // Process milestones
        milestonesData.data?.forEach(milestone => {
          const milestoneIcons: Record<string, string> = {
            'planting': '🌱',
            'harvest': '🥗',
            'observation': '👁️',
            'achievement': '🏆',
            'learning': '📚',
            'custom': '⭐'
          };
          
          allActivities.push({
            type: 'milestone',
            date: milestone.created_at,
            icon: milestoneIcons[milestone.milestone_type] || '⭐',
            title: 'Milestone Created',
            description: milestone.title,
            tower: milestone.classrooms?.name || 'Classroom'
          });
        });

        // Sort by date and take the most recent
        allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActivities(allActivities.slice(0, maxItems));

      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchRecentActivity();
    }
  }, [teacherId, maxItems]);

  const handleActivityClick = (activity: Activity) => {
    if (activity.sourceId && activity.towerId) {
      setSelectedSourceId(activity.sourceId);
      setSelectedSourceType(activity.type);
      setSelectedTowerId(activity.towerId);
      setShowDetailModal(true);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="w-6 h-6 bg-muted animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No recent activity</h3>
            <p className="text-muted-foreground text-sm">
              Activity from your towers will appear here as students log data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Recent Activity ({activities.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors group ${
                activity.sourceId ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/20' : ''
              }`}
              onClick={() => activity.sourceId && handleActivityClick(activity)}
            >
              <span className="text-lg">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <div className="flex items-center gap-2">
                    {activity.sourceId && (
                      <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{activity.tower}</span>
                  {activity.student && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">by {activity.student}</span>
                    </>
                  )}
                </div>
                {activity.type === 'photo' && activity.towerId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to student tower detail page
                      window.open(`/student/tower/${activity.towerId}`, '_blank');
                    }}
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    View Gallery
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      {/* Source Detail Modal */}
      <SourceDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sourceId={selectedSourceId}
        sourceType={selectedSourceType}
        towerId={selectedTowerId}
      />
    </Card>
  );
}
