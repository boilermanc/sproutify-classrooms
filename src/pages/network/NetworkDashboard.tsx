import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Trophy,
  Settings,
  Search,
  Plus,
  Network,
  TrendingUp,
  Calendar,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import { NetworkService } from '@/services/networkService';
import { useAppStore } from '@/context/AppStore';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const sb = supabase as any;

interface NetworkStats {
  is_network_enabled: boolean;
  connection_count: number;
  pending_requests: number;
  active_challenges: number;
  network_rank: number | null;
}

interface RecentActivity {
  type: 'connection' | 'challenge' | 'harvest';
  title: string;
  description: string;
  timestamp: string;
  classroom_name?: string;
}

interface Classroom {
  id: string;
  name: string;
  is_selected_for_network?: boolean;
}

export default function NetworkDashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const [stats, setStats] = useState<NetworkStats>({
    is_network_enabled: false,
    connection_count: 0,
    pending_requests: 0,
    active_challenges: 0,
    network_rank: null
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkSettings, setNetworkSettings] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  // Get user ID
  useEffect(() => {
    const initializeUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    initializeUser();
  }, []);

  // Load selected classroom from DB if not in AppStore
  useEffect(() => {
    const loadSelectedClassroom = async () => {
      if (!userId) return;

      // First: AppStore
      if (state.selectedClassroom?.is_selected_for_network) {
        setSelectedClassroom(state.selectedClassroom);
        return;
      }

      // Fallback: query DB
      try {
        const { data, error } = await sb
          .from('classrooms')
          .select('id, name, is_selected_for_network')
          .eq('teacher_id', userId)
          .eq('is_selected_for_network', true)
          .limit(1)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error loading selected classroom:', error);
          }
          setSelectedClassroom(null);
          return;
        }

        if (data) {
          setSelectedClassroom(data);
          dispatch({ type: 'SET_SELECTED_CLASSROOM', payload: data });
        }
      } catch (error) {
        console.error('Failed to load selected classroom:', error);
      }
    };

    loadSelectedClassroom();
  }, [userId, state.selectedClassroom, dispatch]);

  useEffect(() => {
    if (selectedClassroom?.id) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassroom?.id]);

  const loadDashboardData = async () => {
    if (!selectedClassroom?.id) return;

    setLoading(true);
    try {
      // Load network settings
      const settings = await NetworkService.getNetworkSettings(selectedClassroom.id);
      setNetworkSettings(settings);

      if (!settings?.is_network_enabled) {
        setStats(prev => ({ ...prev, is_network_enabled: false }));
        setLoading(false);
        return;
      }

      // Load activity stats
      const activity = await NetworkService.getMyNetworkActivity(selectedClassroom.id);
      setStats({
        is_network_enabled: true,
        connection_count: activity.connection_count,
        pending_requests: activity.pending_requests,
        active_challenges: activity.active_challenges,
        network_rank: activity.network_rank
      });

      // Demo recent activity
      setRecentActivity([
        {
          type: 'connection',
          title: 'New connection request',
          description: 'Green Valley Elementary wants to connect',
          timestamp: '2 hours ago'
        },
        {
          type: 'challenge',
          title: 'Monthly Harvest Challenge',
          description: 'Challenge ends in 5 days',
          timestamp: '1 day ago'
        }
      ]);
    } catch (error) {
      console.error('Failed to load network dashboard:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ client-side navigation (fixes the blank-page issue)
  const enableNetwork = () => navigate('/app/network/settings');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedClassroom) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Network className="mx-auto h-12 w-12 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold">Select a Classroom</h2>
            <p className="text-muted-foreground">
              Please select a classroom to access Garden Network features.
            </p>
          </div>
          <Button asChild>
            <Link to="/app/classrooms">Go to Classrooms</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Not enrolled in network
  if (!stats.is_network_enabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Garden Network</h1>
          <p className="text-muted-foreground">
            Connect with classrooms worldwide to compete, collaborate, and share growing experiences.
          </p>
        </div>

        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Network className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Join the Garden Network</CardTitle>
            <CardDescription>
              Connect your classroom to a global community of hydroponic educators and students
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <Trophy className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                <div className="font-medium">Compete</div>
                <div className="text-muted-foreground">Join harvest challenges and friendly competitions</div>
              </div>
              <div>
                <Users className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                <div className="font-medium">Collaborate</div>
                <div className="text-muted-foreground">Share tips and learn from other educators</div>
              </div>
              <div>
                <TrendingUp className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                <div className="font-medium">Track Progress</div>
                <div className="text-muted-foreground">Compare your growth with similar classrooms</div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={enableNetwork} size="lg">
                Get Started
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                You can always change your privacy settings later
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active network dashboard
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Garden Network</h1>
          <p className="text-muted-foreground">
            Welcome to your network dashboard, {selectedClassroom.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            {networkSettings?.visibility_level === 'public' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {networkSettings?.visibility_level === 'public' ? 'Public' :
              networkSettings?.visibility_level === 'invite_only' ? 'Invite Only' : 'Connected Only'}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/network/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connection_count}</div>
            <p className="text-xs text-muted-foreground">
              Active classroom connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_requests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending_requests > 0 ? 'Need your attention' : 'All caught up'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_challenges}</div>
            <p className="text-xs text-muted-foreground">
              Participating in competitions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Rank</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.network_rank ? `#${stats.network_rank}` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              In harvest leaderboard
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common network activities
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/app/network/discover">
                <Search className="h-4 w-4 mr-2" />
                Discover New Classrooms
              </Link>
            </Button>

            <Button variant="outline" className="justify-start" asChild>
              <Link to="/app/network/connections">
                <Users className="h-4 w-4 mr-2" />
                Manage Connections
                {stats.pending_requests > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {stats.pending_requests}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="outline" className="justify-start" asChild>
              <Link to="/app/network/challenges">
                <Trophy className="h-4 w-4 mr-2" />
                Browse Challenges
              </Link>
            </Button>

            <Button variant="outline" className="justify-start" asChild>
              <Link to="/app/leaderboard">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Network Leaderboard
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your network
            </CardDescription>
          </CardHeader>
        <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'connection' && <Users className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'challenge' && <Trophy className="h-4 w-4 text-yellow-500" />}
                      {activity.type === 'harvest' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">{activity.description}</div>
                      <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <div className="text-sm text-muted-foreground">No recent activity</div>
                <div className="text-xs text-muted-foreground">
                  Connect with classrooms to see updates here
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Tips */}
      {stats.connection_count === 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Ready to Connect?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You're all set up for the Garden Network! Here are some ways to get started:
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium">1. Discover Classrooms</div>
                <div className="text-muted-foreground">Find other classrooms in your region or grade level</div>
              </div>
              <div>
                <div className="font-medium">2. Join Challenges</div>
                <div className="text-muted-foreground">Participate in monthly competitions</div>
              </div>
              <div>
                <div className="font-medium">3. Share Your Success</div>
                <div className="text-muted-foreground">Let others see your harvest progress</div>
              </div>
              <div>
                <div className="font-medium">4. Learn from Others</div>
                <div className="text-muted-foreground">Get tips from successful classrooms</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
