// src/pages/dashboard/Home.tsx - Enhanced with Harvest Dashboard + Subscription Components
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Leaf, Calendar, Clock, CheckCircle, AlertTriangle, Crown, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { TrialStatusBanner } from "@/components/TrialStatusBanner";
import { UsageIndicator } from "@/components/UsageIndicator";
import { RecentActivityWidget } from "@/components/RecentActivityWidget";
import WelcomeModal from "@/components/WelcomeModal";
import SchoolAdminWelcomeModal from "@/components/SchoolAdminWelcomeModal";
import DistrictAdminWelcomeModal from "@/components/DistrictAdminWelcomeModal";

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

interface SubscriptionData {
  subscription_status: string | null;
  subscription_plan: string | null;
  trial_ends_at: string | null;
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  onboarding_completed?: boolean;
  schools?: {
    name: string;
  };
  districts?: {
    id: string;
    name: string;
    join_code: string;
  };
  user_role?: string;
}

// Subscription Banner Component
const SubscriptionBanner = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_plan, trial_ends_at')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setSubscription(data);
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [userId]);

  if (loading || !subscription) return null;

  // Don't show banner for active subscribers
  if (subscription.subscription_status === 'active') return null;

  const isTrialExpiringSoon = subscription.trial_ends_at && 
    new Date(subscription.trial_ends_at) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

  const isTrialExpired = subscription.trial_ends_at && 
    new Date(subscription.trial_ends_at) <= new Date();

  const isPastDue = subscription.subscription_status === 'past_due';

  // Don't show if TrialStatusBanner is already handling this
  if (!isTrialExpired && !isPastDue && !isTrialExpiringSoon) return null;

  return (
    <Card className={`mb-6 ${
      isTrialExpired || isPastDue ? 'border-red-200 bg-red-50' : 
      isTrialExpiringSoon ? 'border-yellow-200 bg-yellow-50' : 
      'border-blue-200 bg-blue-50'
    }`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isTrialExpired || isPastDue ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : isTrialExpiringSoon ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            ) : (
              <Gift className="h-5 w-5 text-blue-600" />
            )}
            
            <div>
              {isTrialExpired ? (
                <div>
                  <p className="font-semibold text-red-900">Trial Expired</p>
                  <p className="text-sm text-red-700">
                    Subscribe now to continue using Sproutify School
                  </p>
                </div>
              ) : isPastDue ? (
                <div>
                  <p className="font-semibold text-red-900">Payment Past Due</p>
                  <p className="text-sm text-red-700">
                    Please update your payment method to continue service
                  </p>
                </div>
              ) : isTrialExpiringSoon ? (
                <div>
                  <p className="font-semibold text-yellow-900">Trial Ending Soon</p>
                  <p className="text-sm text-yellow-700">
                    Your trial ends on {new Date(subscription.trial_ends_at!).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-blue-900">Ready to Grow?</p>
                  <p className="text-sm text-blue-700">
                    Unlock unlimited towers and advanced features
                  </p>
                </div>
              )}
              
              <Badge variant="outline" className="mt-1">
                Current: {subscription.subscription_plan?.charAt(0).toUpperCase() + (subscription.subscription_plan?.slice(1) || 'Free')}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isPastDue ? (
              <Button 
                variant="default"
                onClick={() => navigate('/subscription/manage')}
                className="bg-red-600 hover:bg-red-700"
              >
                Update Payment
              </Button>
            ) : (
              <Button 
                variant={isTrialExpired ? "default" : "outline"}
                onClick={() => navigate('/pricing')}
                className={isTrialExpired ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <Crown className="h-4 w-4 mr-2" />
                {isTrialExpired ? 'Subscribe Now' : 'Upgrade'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({ towers: 0, plants: 0, harvests: 0 });
  const [harvestSummary, setHarvestSummary] = useState<HarvestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSchoolAdminModal, setShowSchoolAdminModal] = useState(false);
  const [showDistrictAdminModal, setShowDistrictAdminModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Please log in to view your dashboard.");
          return;
        }
        
        setTeacherId(user.id);

        // Fetch user profile to check onboarding status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id, 
            first_name, 
            last_name, 
            subscription_plan, 
            subscription_status, 
            onboarding_completed,
            schools(name),
            districts(id, name, join_code)
          `)
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          // Fetch user role
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          const userRole = roleData?.role || 'teacher';
          const profileWithRole = { ...profile, user_role: userRole };
          setUserProfile(profileWithRole);
          
          // Show appropriate welcome modal if onboarding hasn't been completed
          if (!profile.onboarding_completed) {
            switch (userRole) {
              case 'district_admin':
                setShowDistrictAdminModal(true);
                break;
              case 'school_admin':
                setShowSchoolAdminModal(true);
                break;
              default:
                setShowWelcomeModal(true);
                break;
            }
          }
        }

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
            towers(id, name)
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
            towerName: plant.towers?.name || 'Unknown Tower',
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

  const handleWelcomeModalClose = async () => {
    setShowWelcomeModal(false);
    // Refresh user profile to get updated onboarding status
    await refreshUserProfile();
  };

  const handleSchoolAdminModalClose = async () => {
    setShowSchoolAdminModal(false);
    // Refresh user profile to get updated onboarding status
    await refreshUserProfile();
  };

  const handleDistrictAdminModalClose = async () => {
    setShowDistrictAdminModal(false);
    // Refresh user profile to get updated onboarding status
    await refreshUserProfile();
  };

  const refreshUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch updated user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, 
          first_name, 
          last_name, 
          subscription_plan, 
          subscription_status, 
          onboarding_completed,
          schools(name),
          districts(id, name, join_code)
        `)
        .eq('id', user.id)
        .single();

      if (!profileError && profile) {
        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const userRole = roleData?.role || 'teacher';
        const profileWithRole = { ...profile, user_role: userRole };
        setUserProfile(profileWithRole);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

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

      {/* Subscription Status Banner (for critical subscription issues) */}
      {teacherId && <SubscriptionBanner userId={teacherId} />}

      {/* Trial Status Banner (your existing component for general trial info) */}
      <TrialStatusBanner />

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

      {/* Usage Indicator */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
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

        {/* Sidebar with Usage Indicator and Recent Activity */}
        <div className="space-y-4">
          <UsageIndicator />
          {teacherId && (
            <RecentActivityWidget 
              teacherId={teacherId}
              maxItems={6}
            />
          )}
        </div>
      </div>

      {/* Welcome Modals */}
      {userProfile && (
        <>
          <WelcomeModal
            isOpen={showWelcomeModal}
            onClose={handleWelcomeModalClose}
            userProfile={userProfile}
          />
          <SchoolAdminWelcomeModal
            isOpen={showSchoolAdminModal}
            onClose={handleSchoolAdminModalClose}
            userProfile={userProfile}
          />
          <DistrictAdminWelcomeModal
            isOpen={showDistrictAdminModal}
            onClose={handleDistrictAdminModalClose}
            userProfile={userProfile}
          />
        </>
      )}
    </div>
  );
}