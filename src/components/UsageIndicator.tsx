// src/components/UsageIndicator.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, ArrowUp } from 'lucide-react';

interface UsageData {
  towers_used: number;
  students_used: number;
  max_towers: number;
  max_students: number;
  subscription_plan: string;
}

export const UsageIndicator: React.FC = () => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile with limits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('max_towers, max_students, subscription_plan')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Count towers
      const { count: towersCount, error: towersError } = await supabase
        .from('towers')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id);

      if (towersError) {
        console.error('Error counting towers:', towersError);
        return;
      }

      // Count students across all classrooms for this teacher
      const { data: classrooms, error: classroomsError } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_id', user.id);

      if (classroomsError) {
        console.error('Error fetching classrooms:', classroomsError);
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
          return;
        }

        studentsCount = studentCount || 0;
      }

      setUsage({
        towers_used: towersCount || 0,
        students_used: studentsCount,
        max_towers: profile.max_towers || 0,
        max_students: profile.max_students || 0,
        subscription_plan: profile.subscription_plan || 'basic'
      });

    } catch (error) {
      console.error('Error in fetchUsageData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (loading || !usage) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Plan Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages
  const towerPercentage = Math.min((usage.towers_used / usage.max_towers) * 100, 100);
  const studentPercentage = Math.min((usage.students_used / usage.max_students) * 100, 100);

  // Determine status colors and messages
  const getTowerStatus = () => {
    if (usage.towers_used >= usage.max_towers) {
      return { color: 'destructive', status: 'At Limit', urgent: true };
    } else if (towerPercentage >= 80) {
      return { color: 'warning', status: 'Nearly Full', urgent: false };
    } else {
      return { color: 'default', status: 'Available', urgent: false };
    }
  };

  const getStudentStatus = () => {
    if (usage.students_used >= usage.max_students) {
      return { color: 'destructive', status: 'At Limit', urgent: true };
    } else if (studentPercentage >= 80) {
      return { color: 'warning', status: 'Nearly Full', urgent: false };
    } else {
      return { color: 'default', status: 'Available', urgent: false };
    }
  };

  const towerStatus = getTowerStatus();
  const studentStatus = getStudentStatus();

  // Show upgrade suggestion if either metric is at or near limit
  const shouldShowUpgrade = towerStatus.urgent || studentStatus.urgent || 
                           towerPercentage >= 80 || studentPercentage >= 80;

  // Format large numbers (for "unlimited" plans)
  const formatLimit = (limit: number) => {
    if (limit >= 999999) return "Unlimited";
    return limit.toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Plan Usage</CardTitle>
        <Badge variant="outline" className="text-xs">
          {usage.subscription_plan.charAt(0).toUpperCase() + usage.subscription_plan.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Towers Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Towers</span>
              <Badge 
                variant={towerStatus.color === 'destructive' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {towerStatus.status}
              </Badge>
            </div>
            <span className="text-muted-foreground">
              {usage.towers_used}/{formatLimit(usage.max_towers)}
            </span>
          </div>
          <Progress 
            value={towerPercentage} 
            className={`h-2 ${towerStatus.color === 'destructive' ? '[&>div]:bg-destructive' : 
                              towerPercentage >= 80 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
          />
        </div>

        {/* Students Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Students</span>
              <Badge 
                variant={studentStatus.color === 'destructive' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {studentStatus.status}
              </Badge>
            </div>
            <span className="text-muted-foreground">
              {usage.students_used}/{formatLimit(usage.max_students)}
            </span>
          </div>
          <Progress 
            value={studentPercentage} 
            className={`h-2 ${studentStatus.color === 'destructive' ? '[&>div]:bg-destructive' : 
                              studentPercentage >= 80 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
          />
        </div>

        {/* Upgrade Suggestion */}
        {shouldShowUpgrade && (
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground mb-3">
              {towerStatus.urgent || studentStatus.urgent 
                ? "You've reached your plan limits. Upgrade to continue adding resources."
                : "You're approaching your plan limits. Consider upgrading for more capacity."
              }
            </div>
            <Button 
              onClick={handleUpgrade}
              size="sm" 
              className="w-full"
              variant={towerStatus.urgent || studentStatus.urgent ? "destructive" : "default"}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </div>
        )}

        {/* Plan Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Current plan includes {formatLimit(usage.max_towers)} towers and {formatLimit(usage.max_students)} students
        </div>
      </CardContent>
    </Card>
  );
};