// src/pages/kiosk/StudentDashboard.tsx - Complete with Harvest Widget
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import Leaderboard from "@/pages/leaderboard/Leaderboard";
import { 
  Leaf, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Trophy,
  Target,
  Camera,
  Wheat,
  Trash2,
  Bug
} from "lucide-react";

// Define a type for our tower data
type Tower = {
  id: string;
  name: string;
  ports: number;
};

type StudentHarvestItem = {
  id: string;
  plantName: string;
  towerName: string;
  towerId: string;
  expectedHarvestDate: string;
  daysRemaining: number;
  status: 'overdue' | 'today' | 'soon' | 'upcoming';
  portNumber?: number;
};

// A component for displaying a single tower card
const TowerCard = ({ tower }: { tower: Tower }) => (
  <Link to={`/student/tower/${tower.id}`}>
    <Card className="hover:bg-muted/50 hover:border-primary transition-all h-full">
      <CardHeader>
        <CardTitle>{tower.name}</CardTitle>
        <CardDescription>{tower.ports} ports</CardDescription>
      </CardHeader>
    </Card>
  </Link>
);

// Recent Activity Widget Component
function RecentActivityWidget({ 
  classroomId, 
  teacherId, 
  maxItems = 8
}: {
  classroomId: string;
  teacherId: string;
  maxItems?: number;
}) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            .select('created_at, title, description, milestone_type, classrooms(name)')
            .eq('teacher_id', teacherId)
            .eq('document_type', 'milestone')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        const allActivities: any[] = [];

        // Process vitals
        vitalsData.data?.forEach(vital => {
          allActivities.push({
            type: 'vitals',
            date: vital.recorded_at,
            icon: '📊',
            title: 'Vitals Logged',
            description: `pH: ${vital.ph || 'N/A'}, EC: ${vital.ec || 'N/A'}`,
            tower: vital.towers?.name || 'Unknown Tower'
          });
        });

        // Process photos
        photosData.data?.forEach(photo => {
          allActivities.push({
            type: 'photo',
            date: photo.taken_at,
            icon: '📸',
            title: 'Photo Added',
            description: photo.caption || 'New tower photo',
            student: photo.student_name,
            tower: photo.towers?.name || 'Unknown Tower'
          });
        });

        // Process harvests
        harvestsData.data?.forEach(harvest => {
          allActivities.push({
            type: 'harvest',
            date: harvest.harvested_at,
            icon: '🥗',
            title: 'Harvest Recorded',
            description: `${harvest.plant_name} (${harvest.weight_grams || harvest.plant_quantity || 0}g)`,
            student: 'Teacher', // Harvests don't have student_name, so show as Teacher
            tower: harvest.towers?.name || 'Unknown Tower'
          });
        });

        // Process plantings
        plantingsData.data?.forEach(planting => {
          allActivities.push({
            type: 'planting',
            date: planting.planted_at,
            icon: '🌱',
            title: 'Plant Added',
            description: planting.name,
            tower: planting.towers?.name || 'Unknown Tower'
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
            tower: pest.towers?.name || 'Unknown Tower'
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
            tower: milestone.classrooms?.name || 'Classroom',
            milestone_type: milestone.milestone_type
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

    if (teacherId && classroomId) {
      fetchRecentActivity();
    }
  }, [classroomId, teacherId, maxItems]);

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
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
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
          <div className="text-center py-6">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-2">No recent activity</h3>
            <p className="text-sm text-muted-foreground">
              Activity will appear here as students log data!
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
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <span className="text-lg">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
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
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Student Harvest Widget Component
function StudentHarvestWidget({ 
  classroomId, 
  teacherId, 
  maxItems = 6
}: {
  classroomId: string;
  teacherId: string;
  maxItems?: number;
}) {
  const [harvests, setHarvests] = useState<StudentHarvestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHarvests = async () => {
      try {
        const { data, error } = await supabase
          .from('plantings')
          .select(`
            id,
            name,
            expected_harvest_date,
            port_number,
            tower_id,
            towers(id, name)
          `)
          .eq('teacher_id', teacherId)
          .eq('status', 'active')
          .not('expected_harvest_date', 'is', null)
          .order('expected_harvest_date', { ascending: true })
          .limit(maxItems);

        if (error) throw error;

        const today = new Date();
        const processed = data.map(plant => {
          const harvestDate = new Date(plant.expected_harvest_date!);
          const diffTime = harvestDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let status: StudentHarvestItem['status'] = 'upcoming';
          if (daysRemaining < 0) status = 'overdue';
          else if (daysRemaining === 0) status = 'today';
          else if (daysRemaining <= 7) status = 'soon';

          return {
            id: plant.id,
            plantName: plant.name,
            towerName: plant.towers?.name || 'Unknown Tower',
            towerId: plant.tower_id,
            expectedHarvestDate: plant.expected_harvest_date!,
            daysRemaining: Math.abs(daysRemaining),
            status,
            portNumber: plant.port_number
          };
        });

        setHarvests(processed);
      } catch (error) {
        console.error('Error fetching student harvests:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId && classroomId) {
      fetchHarvests();
    }
  }, [classroomId, teacherId, maxItems]);

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'overdue': return '🚨';
      case 'today': return '🎉';
      case 'soon': return '⏰';
      default: return '🌱';
    }
  };

  const getStatusMessage = (status: string, daysRemaining: number) => {
    switch (status) {
      case 'overdue': return `Ready ${daysRemaining} days ago!`;
      case 'today': return 'Ready to harvest today!';
      case 'soon': return `Ready in ${daysRemaining} days`;
      default: return `${daysRemaining} days to harvest`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 border-red-300';
      case 'today': return 'bg-green-100 border-green-300';
      case 'soon': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-blue-100 border-blue-300';
    }
  };

  // Group by urgency for students
  const readyNow = harvests.filter(h => h.status === 'overdue' || h.status === 'today');
  const comingSoon = harvests.filter(h => h.status === 'soon');
  const later = harvests.filter(h => h.status === 'upcoming');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-32 h-4 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (harvests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Class Harvest Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-2">No harvests scheduled yet</h3>
            <p className="text-sm text-muted-foreground">
              Ask your teacher to add plants with harvest dates!
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
          <Target className="h-5 w-5 text-green-600" />
          What Can We Harvest?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ready Now Section */}
        {readyNow.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-sm">🎉 Ready to Harvest!</h4>
            </div>
            {readyNow.map((harvest) => (
              <div key={harvest.id} className={`p-3 rounded-lg border-2 ${getStatusColor(harvest.status)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {getStatusEmoji(harvest.status)} {harvest.plantName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {harvest.towerName}
                      {harvest.portNumber && ` • Port ${harvest.portNumber}`}
                    </p>
                    <p className="text-sm font-medium text-green-700">
                      {getStatusMessage(harvest.status, harvest.daysRemaining)}
                    </p>
                  </div>
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                    <Link to={`/student/harvest?towerId=${harvest.towerId}`}>
                      Help Harvest! 🥗
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Section */}
        {comingSoon.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-sm">⏰ Coming This Week</h4>
            </div>
            {comingSoon.map((harvest) => (
              <div key={harvest.id} className={`p-3 rounded-lg border ${getStatusColor(harvest.status)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{harvest.plantName}</p>
                    <p className="text-sm text-muted-foreground">
                      {harvest.towerName}
                      {harvest.portNumber && ` • Port ${harvest.portNumber}`}
                    </p>
                    <p className="text-sm text-yellow-700">
                      {getStatusMessage(harvest.status, harvest.daysRemaining)}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {harvest.daysRemaining}d left
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Later Section */}
        {later.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-sm">🌱 Growing...</h4>
            </div>
            <div className="grid gap-2">
              {later.slice(0, 3).map((harvest) => (
                <div key={harvest.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{harvest.plantName}</p>
                    <p className="text-xs text-muted-foreground">{harvest.towerName}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {harvest.daysRemaining} days
                  </Badge>
                </div>
              ))}
              {later.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  ...and {later.length - 3} more plants growing!
                </p>
              )}
            </div>
          </div>
        )}

        <Alert>
          <Leaf className="h-4 w-4" />
          <AlertDescription>
            <strong>Students:</strong> Look for plants marked "Ready to Harvest!" - these need your help! 
            Ask your teacher before harvesting anything.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default function StudentDashboard() {
  // State now holds an array of towers, not just one ID
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [classroomId, setClassroomId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [studentName, setStudentName] = useState<string | null>(null);

  useEffect(() => {
    const storedClassroomId = localStorage.getItem("student_classroom_id");
    const storedStudentName = localStorage.getItem("student_name");
    
    if (!storedClassroomId) {
      setLoading(false);
      return;
    }

    setClassroomId(storedClassroomId);
    setStudentName(storedStudentName);

    const fetchTowersForClass = async () => {
      // First, get the teacher_id for the classroom
      const { data: classroomData, error: classError } = await supabase
        .from("classrooms")
        .select("teacher_id")
        .eq("id", storedClassroomId)
        .single();
      
      if (classError || !classroomData) {
        console.error("Could not find classroom's teacher");
        setLoading(false);
        return;
      }

      const currentTeacherId = classroomData.teacher_id;
      setTeacherId(currentTeacherId);
      localStorage.setItem("teacher_id_for_tower", currentTeacherId);
      
      // Now, fetch ALL towers belonging to that teacher
      const { data: towerData, error: towerError } = await supabase
        .from("towers")
        .select("id, name, ports") // Get all the info we need for the cards
        .eq("teacher_id", currentTeacherId);
      
      if (towerError) {
        console.error("Could not find towers for this class:", towerError);
      } else {
        setTowers(towerData || []);
      }
      setLoading(false);
    };

    fetchTowersForClass();
  }, []);

  return (
    <div className="container py-8 space-y-8">
      <SEO title="Student Dashboard | Sproutify School" />
      <div>
        <h1 className="text-3xl font-bold">
          {studentName ? `Welcome, ${studentName}!` : "Student Dashboard"}
        </h1>
        <p className="text-muted-foreground">Check harvest schedule and select a tower to log data.</p>
      </div>

      {/* Harvest Schedule and Recent Activity Section */}
      {teacherId && classroomId && (
        <div className="grid lg:grid-cols-2 gap-6">
          <StudentHarvestWidget 
            classroomId={classroomId} 
            teacherId={teacherId}
            maxItems={8}
          />
          <RecentActivityWidget 
            classroomId={classroomId} 
            teacherId={teacherId}
            maxItems={8}
          />
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4">Class Towers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            // Show skeleton loaders while fetching
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))
          ) : towers.length > 0 ? (
            // Map over the towers and display a card for each
            towers.map(tower => <TowerCard key={tower.id} tower={tower} />)
          ) : (
            <p className="text-muted-foreground col-span-full">No towers have been added for this class yet.</p>
          )}
        </div>
      </div>

      <Leaderboard />
    </div>
  );
}