// src/components/SubscriptionGuard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CreditCard, Mail, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

type SubscriptionStatus = 'trial' | 'active' | 'canceled' | 'past_due' | 'unpaid' | null;

interface Profile {
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  subscription_plan: string | null;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate('/auth/login');
        return;
      }

      // Get user profile with subscription info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at, subscription_ends_at, subscription_plan')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      setProfile(profile);

      // Check if user has valid access
      const access = checkAccess(profile);
      setHasAccess(access);
      
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAccess = (profile: Profile): boolean => {
    if (!profile?.subscription_status) {
      return false;
    }

    const now = new Date();

    switch (profile.subscription_status) {
      case 'trial':
        if (!profile.trial_ends_at) return false;
        return new Date(profile.trial_ends_at) > now;
        
      case 'active':
        if (!profile.subscription_ends_at) return true; // Permanent subscription
        return new Date(profile.subscription_ends_at) > now;
        
      case 'canceled':
      case 'past_due':
      case 'unpaid':
      default:
        return false;
    }
  };

  const handleUpgrade = () => {
    // Redirect to pricing page where users can choose their plan
    navigate('/pricing');
  };

  const handleContactSupport = () => {
    window.open('mailto:support@sproutify.app?subject=Subscription Support', '_blank');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Access granted - render the app
  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied - show upgrade screen
  const getStatusMessage = () => {
    if (!profile?.subscription_status) {
      return {
        title: "Subscription Required",
        description: "You need an active subscription to access Sproutify School.",
        variant: "default" as const
      };
    }

    switch (profile.subscription_status) {
      case 'trial':
        return {
          title: "Trial Expired",
          description: "Your free trial has ended. Upgrade to continue using Sproutify School.",
          variant: "default" as const
        };
      case 'canceled':
        return {
          title: "Subscription Canceled",
          description: "Your subscription has been canceled. Reactivate to continue using Sproutify School.",
          variant: "default" as const
        };
      case 'past_due':
        return {
          title: "Payment Past Due",
          description: "Your payment is past due. Please update your payment method to continue.",
          variant: "destructive" as const
        };
      case 'unpaid':
        return {
          title: "Payment Failed",
          description: "Your last payment failed. Please update your payment method to continue.",
          variant: "destructive" as const
        };
      default:
        return {
          title: "Access Restricted",
          description: "Please check your subscription status or contact support.",
          variant: "default" as const
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-xl">{statusMessage.title}</CardTitle>
            <CardDescription className="mt-2">
              {statusMessage.description}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Subscription Plan Info */}
          {profile?.subscription_plan && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium">Current Plan: {profile.subscription_plan}</p>
              {profile.trial_ends_at && (
                <p className="text-muted-foreground">
                  Trial ended: {new Date(profile.trial_ends_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade} 
              className="w-full"
              size="lg"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
            
            <Button 
              onClick={handleContactSupport} 
              variant="outline" 
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            
            <Button 
              onClick={handleSignOut} 
              variant="ghost" 
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>Need help? Email us at</p>
            <a 
              href="mailto:support@sproutify.app" 
              className="text-primary hover:underline font-medium"
            >
              support@sproutify.app
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};