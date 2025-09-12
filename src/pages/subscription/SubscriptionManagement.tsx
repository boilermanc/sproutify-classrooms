// src/pages/subscription/SubscriptionManagement.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPlanName, capitalizeSubscriptionStatus } from '@/lib/utils';

interface SubscriptionData {
  subscription_status: string | null;
  subscription_plan: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
}

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate('/auth/login');
          return;
        }

        setUserId(session.user.id);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_plan, stripe_customer_id, stripe_subscription_id, trial_ends_at')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching subscription:', error);
          toast({
            title: "Error",
            description: "Failed to load subscription information.",
            variant: "destructive"
          });
        } else {
          setSubscription(profile);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [navigate, toast]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />{capitalizeSubscriptionStatus(status)}</Badge>;
      case 'trial':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Free Trial</Badge>;
      case 'past_due':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{capitalizeSubscriptionStatus(status)}</Badge>;
      case 'canceled':
        return <Badge variant="secondary">{capitalizeSubscriptionStatus(status)}</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const openStripePortal = () => {
    if (subscription?.stripe_customer_id) {
      // In production, you'd want to create a Supabase Edge Function to generate the portal link
      // For now, we'll show a message
      toast({
        title: "Billing Portal",
        description: "Please contact support to manage your billing details.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Subscription Management | Sproutify School"
        description="Manage your Sproutify School subscription and billing."
        canonical="/subscription/manage"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/app/profile')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
            <p className="text-muted-foreground">
              Manage your Sproutify School subscription and billing preferences
            </p>
          </div>

          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">
                        {formatPlanName(subscription?.subscription_plan)} Plan
                      </span>
                      {getStatusBadge(subscription?.subscription_status)}
                    </div>
                    
                    {subscription?.subscription_status === 'trial' && subscription.trial_ends_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Trial ends on {new Date(subscription.trial_ends_at).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      {subscription?.subscription_status === 'active' && 'Full access to all features'}
                      {subscription?.subscription_status === 'trial' && 'Limited trial access'}
                      {subscription?.subscription_status === 'past_due' && 'Payment required to continue'}
                      {!subscription?.subscription_status && 'Basic free features only'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/pricing')}
                    className="w-full"
                    variant={subscription?.subscription_status === 'active' ? 'outline' : 'default'}
                  >
                    {subscription?.subscription_status === 'active' ? 'Change Plan' : 'Upgrade Plan'}
                  </Button>
                  
                  {subscription?.subscription_status === 'active' && subscription.stripe_customer_id && (
                    <Button 
                      onClick={openStripePortal}
                      variant="outline" 
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Billing
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Plan Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {subscription?.subscription_plan === 'basic' ? '3' :
                     subscription?.subscription_plan === 'professional' ? '10' :
                     subscription?.subscription_plan === 'school' ? '∞' : '1'}
                  </div>
                  <div className="text-sm text-muted-foreground">Tower Gardens</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {subscription?.subscription_plan === 'basic' ? '30' :
                     subscription?.subscription_plan === 'professional' ? '100' :
                     subscription?.subscription_plan === 'school' ? '∞' : '5'}
                  </div>
                  <div className="text-sm text-muted-foreground">Student Accounts</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {subscription?.subscription_status === 'active' ? '✓' : 
                     subscription?.subscription_status === 'trial' ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-muted-foreground">All Features</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status Messages */}
          {subscription?.subscription_status === 'trial' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Free Trial Active</h3>
                    <p className="text-sm text-blue-700">
                      Your trial ends on {subscription.trial_ends_at && new Date(subscription.trial_ends_at).toLocaleDateString()}. 
                      Upgrade now to continue using all features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {subscription?.subscription_status === 'past_due' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-900">Payment Past Due</h3>
                    <p className="text-sm text-red-700">
                      Your subscription payment is past due. Please update your payment method to continue service.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(!subscription?.subscription_status || subscription?.subscription_status === 'free') && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Ready to Unlock More?</h3>
                    <p className="text-sm text-green-700">
                      Subscribe to unlock unlimited towers, advanced features, and priority support.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Billing Questions</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact our support team for billing assistance.
                  </p>
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Feature Questions</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn more about Sproutify School features.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/app/help')}
                  >
                    Help Center
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}