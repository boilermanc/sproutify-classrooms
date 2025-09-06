// src/hooks/useSubscriptionLimits.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionLimits {
  max_towers: number;
  max_students: number;
  towers_used: number;
  students_used: number;
  subscription_plan: string;
  subscription_status: string;
}

interface LimitCheckResult {
  canCreate: boolean;
  reason?: string;
  suggestion?: string;
}

export const useSubscriptionLimits = () => {
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch current limits and usage
  const fetchLimits = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get profile with subscription info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('max_towers, max_students, subscription_plan, subscription_status')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      // Count current towers
      const { count: towersCount, error: towersError } = await supabase
        .from('towers')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id);

      if (towersError) {
        console.error('Error counting towers:', towersError);
        setLoading(false);
        return;
      }

      // Count current students
      const { data: classrooms, error: classroomsError } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_id', user.id);

      if (classroomsError) {
        console.error('Error fetching classrooms:', classroomsError);
        setLoading(false);
        return;
      }

      let studentsCount = 0;
      if (classrooms && classrooms.length > 0) {
        const classroomIds = classrooms.map(c => c.id);
        const { count: studentCount, error: studentsError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .in('classroom_id', classroomIds);

        if (studentsError) {
          console.error('Error counting students:', studentsError);
        } else {
          studentsCount = studentCount || 0;
        }
      }

      setLimits({
        max_towers: profile.max_towers || 0,
        max_students: profile.max_students || 0,
        towers_used: towersCount || 0,
        students_used: studentsCount,
        subscription_plan: profile.subscription_plan || 'basic',
        subscription_status: profile.subscription_status || 'trial'
      });

    } catch (error) {
      console.error('Error in fetchLimits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Check if user can create a new tower
  const checkTowerLimit = useCallback(async (): Promise<boolean> => {
    if (!limits) {
      await fetchLimits();
      return false;
    }

    const result = canCreateTower();
    
    if (!result.canCreate) {
      toast({
        title: "Tower Limit Reached",
        description: result.reason,
        variant: "destructive",
        action: result.suggestion === 'upgrade' ? {
          label: "Upgrade Plan",
          onClick: () => navigate('/pricing')
        } : undefined
      });
      return false;
    }

    return true;
  }, [limits, fetchLimits, toast, navigate]);

  // Check if user can create a new student
  const checkStudentLimit = useCallback(async (): Promise<boolean> => {
    if (!limits) {
      await fetchLimits();
      return false;
    }

    const result = canCreateStudent();
    
    if (!result.canCreate) {
      toast({
        title: "Student Limit Reached",
        description: result.reason,
        variant: "destructive",
        action: result.suggestion === 'upgrade' ? {
          label: "Upgrade Plan",
          onClick: () => navigate('/pricing')
        } : undefined
      });
      return false;
    }

    return true;
  }, [limits, fetchLimits, toast, navigate]);

  // Check if user can create multiple students (bulk invite)
  const checkStudentLimitBulk = useCallback(async (count: number): Promise<boolean> => {
    if (!limits) {
      await fetchLimits();
      return false;
    }

    const result = canCreateStudents(count);
    
    if (!result.canCreate) {
      toast({
        title: "Student Limit Exceeded",
        description: result.reason,
        variant: "destructive",
        action: result.suggestion === 'upgrade' ? {
          label: "Upgrade Plan",
          onClick: () => navigate('/pricing')
        } : undefined
      });
      return false;
    }

    return true;
  }, [limits, fetchLimits, toast, navigate]);

  // Pure functions for limit checking (no side effects)
  const canCreateTower = (): LimitCheckResult => {
    if (!limits) {
      return { canCreate: false, reason: "Unable to check limits. Please try again." };
    }

    if (limits.towers_used >= limits.max_towers) {
      const planName = limits.subscription_plan.charAt(0).toUpperCase() + limits.subscription_plan.slice(1);
      return {
        canCreate: false,
        reason: `You've reached your ${planName} plan limit of ${limits.max_towers} towers. Upgrade to add more towers.`,
        suggestion: 'upgrade'
      };
    }

    return { canCreate: true };
  };

  const canCreateStudent = (): LimitCheckResult => {
    if (!limits) {
      return { canCreate: false, reason: "Unable to check limits. Please try again." };
    }

    if (limits.students_used >= limits.max_students) {
      const planName = limits.subscription_plan.charAt(0).toUpperCase() + limits.subscription_plan.slice(1);
      return {
        canCreate: false,
        reason: `You've reached your ${planName} plan limit of ${limits.max_students} students. Upgrade to add more students.`,
        suggestion: 'upgrade'
      };
    }

    return { canCreate: true };
  };

  const canCreateStudents = (count: number): LimitCheckResult => {
    if (!limits) {
      return { canCreate: false, reason: "Unable to check limits. Please try again." };
    }

    const wouldExceed = (limits.students_used + count) > limits.max_students;
    
    if (wouldExceed) {
      const available = limits.max_students - limits.students_used;
      const planName = limits.subscription_plan.charAt(0).toUpperCase() + limits.subscription_plan.slice(1);
      
      if (available <= 0) {
        return {
          canCreate: false,
          reason: `You've reached your ${planName} plan limit of ${limits.max_students} students. Upgrade to add more students.`,
          suggestion: 'upgrade'
        };
      } else {
        return {
          canCreate: false,
          reason: `You can only add ${available} more student${available === 1 ? '' : 's'} with your ${planName} plan. You're trying to add ${count}.`,
          suggestion: 'upgrade'
        };
      }
    }

    return { canCreate: true };
  };

  // Refresh limits after creating resources
  const refreshLimits = useCallback(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Get usage percentages for UI components
  const getUsagePercentages = useCallback(() => {
    if (!limits) return { towers: 0, students: 0 };

    return {
      towers: Math.min((limits.towers_used / limits.max_towers) * 100, 100),
      students: Math.min((limits.students_used / limits.max_students) * 100, 100)
    };
  }, [limits]);

  // Check if user is approaching limits (80%+)
  const isApproachingLimits = useCallback(() => {
    const percentages = getUsagePercentages();
    return percentages.towers >= 80 || percentages.students >= 80;
  }, [getUsagePercentages]);

  // Check if user is at any limit
  const isAtLimits = useCallback(() => {
    if (!limits) return false;
    return limits.towers_used >= limits.max_towers || limits.students_used >= limits.max_students;
  }, [limits]);

  return {
    // State
    limits,
    loading,
    
    // Limit checking functions (with UI feedback)
    checkTowerLimit,
    checkStudentLimit,
    checkStudentLimitBulk,
    
    // Pure limit checking functions (no UI feedback)
    canCreateTower,
    canCreateStudent,
    canCreateStudents,
    
    // Utility functions
    refreshLimits,
    getUsagePercentages,
    isApproachingLimits,
    isAtLimits,
    
    // Direct access to usage data
    towersUsed: limits?.towers_used || 0,
    studentsUsed: limits?.students_used || 0,
    maxTowers: limits?.max_towers || 0,
    maxStudents: limits?.max_students || 0,
    subscriptionPlan: limits?.subscription_plan || 'basic',
    subscriptionStatus: limits?.subscription_status || 'trial'
  };
};