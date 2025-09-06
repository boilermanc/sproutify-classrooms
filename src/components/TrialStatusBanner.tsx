// src/components/TrialStatusBanner.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Crown, AlertTriangle } from 'lucide-react';

interface Profile {
  subscription_status: string;
  trial_ends_at: string | null;
  subscription_plan: string | null;
}

export const TrialStatusBanner: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.trial_ends_at) {
      calculateDaysLeft();
      // Update every hour to keep countdown fresh
      const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60);
      return () => clearInterval(interval);
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at, subscription_plan')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(profile);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = () => {
    if (!profile?.trial_ends_at) return;

    const now = new Date();
    const trialEnd = new Date(profile.trial_ends_at);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysLeft(Math.max(0, diffDays));
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  // Don't show banner if loading or user doesn't have trial status
  if (loading || !profile || profile.subscription_status !== 'trial') {
    return null;
  }

  // Don't show if no trial end date
  if (!profile.trial_ends_at || daysLeft === null) {
    return null;
  }

  // Determine banner style and message based on days left
  const getBannerConfig = () => {
    if (daysLeft <= 0) {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        title: 'Trial Expired',
        description: 'Your free trial has ended. Upgrade now to continue using Sproutify School.',
        buttonText: 'Upgrade Now',
        urgent: true
      };
    } else if (daysLeft <= 1) {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        title: 'Trial Ending Soon',
        description: `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Upgrade to continue without interruption.`,
        buttonText: 'Upgrade Now',
        urgent: true
      };
    } else if (daysLeft <= 3) {
      return {
        variant: 'default' as const,
        icon: Clock,
        title: 'Trial Ending Soon',
        description: `Your free trial ends in ${daysLeft} days. Consider upgrading to the ${profile.subscription_plan} plan.`,
        buttonText: 'View Plans',
        urgent: false
      };
    } else {
      return {
        variant: 'default' as const,
        icon: Crown,
        title: 'Free Trial Active',
        description: `You have ${daysLeft} days left in your free trial of the ${profile.subscription_plan} plan.`,
        buttonText: 'View Plans',
        urgent: false
      };
    }
  };

  const config = getBannerConfig();
  const IconComponent = config.icon;

  return (
    <Alert className={`mb-4 ${config.urgent ? 'border-destructive bg-destructive/10' : 'border-primary bg-primary/10'}`}>
      <IconComponent className={`h-4 w-4 ${config.urgent ? 'text-destructive' : 'text-primary'}`} />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{config.title}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {config.description}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {daysLeft > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold">{daysLeft}</div>
              <div className="text-xs text-muted-foreground">
                day{daysLeft === 1 ? '' : 's'} left
              </div>
            </div>
          )}
          <Button 
            onClick={handleUpgrade}
            variant={config.urgent ? "destructive" : "default"}
            size="sm"
          >
            {config.buttonText}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};