// src/pages/subscription/SubscriptionSuccess.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // Not logged in, redirect to login
          navigate('/auth/login');
          return;
        }

        // Fetch updated user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan, full_name, first_name')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUserPlan(profile.subscription_plan);
          setUserName(profile.full_name || profile.first_name || 'there');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Subscription Confirmed | Sproutify School"
        description="Your subscription to Sproutify School has been confirmed."
        canonical="/subscription/success"
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to Sproutify School!
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Hi {userName}! Your subscription has been successfully activated.
            </p>
            {userPlan && (
              <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-800 font-medium">
                  {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan Active
                </span>
              </div>
            )}
          </div>

          {/* What's Next */}
          <Card className="text-left mb-8">
            <CardHeader>
              <CardTitle className="text-center">What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Create Your First Tower</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up your classroom aeroponic tower and start tracking plants
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Invite Your Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Create classrooms and generate join codes for your students
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Start Growing</h3>
                  <p className="text-sm text-muted-foreground">
                    Track vitals, log harvests, and engage students in hands-on learning
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/app')}
              size="lg"
              className="w-full sm:w-auto text-lg px-8"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => navigate('/app/towers/new')}
                className="w-full sm:w-auto"
              >
                Create First Tower
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/app/classrooms')}
                className="w-full sm:w-auto"
              >
                Set Up Classroom
              </Button>
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Need help getting started? Visit our{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/app/help')}>
                Help Center
              </Button>
              {' '}or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}