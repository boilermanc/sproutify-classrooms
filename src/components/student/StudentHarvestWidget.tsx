// 1. StudentHarvestWidget.tsx - Shared component for both student pages
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Leaf, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Trophy,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface StudentHarvestWidgetProps {
  classroomId: string;
  teacherId: string;
  showTitle?: boolean;
  maxItems?: number;
  towerId?: string; // If specified, only show harvests for this tower
}

export function StudentHarvestWidget({ 
  classroomId, 
  teacherId, 
  showTitle = true, 
  maxItems = 6,
  towerId 
}: StudentHarvestWidgetProps) {
  const [harvests, setHarvests] = useState<StudentHarvestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHarvests = async () => {
      try {
        let query = supabase
          .from('plantings')
          .select(`
            id,
            name,
            expected_harvest_date,
            port_number,
            tower_id,
            towers!inner(id, name)
          `)
          .eq('teacher_id', teacherId)
          .eq('status', 'active')
          .not('expected_harvest_date', 'is', null);

        // If towerId is specified, filter to just that tower
        if (towerId) {
          query = query.eq('tower_id', towerId);
        }

        const { data, error } = await query
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
            towerName: plant.towers.name,
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

    fetchHarvests();
  }, [classroomId, teacherId, maxItems, towerId]);

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
            <div className="w-4 h-4 bg-muted animate-pulse rounded" />
            <div className="w-32 h-4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (harvests.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Harvest Calendar
            </CardTitle>
          </CardHeader>
        )}
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
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            {towerId ? 'Tower Harvest Calendar' : 'Class Harvest Calendar'}
          </CardTitle>
        </CardHeader>
      )}
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
      </CardContent>
    </Card>
  );
}

// 2. Usage in StudentDashboard.tsx - ADD THIS TO THE DASHBOARD
export function StudentDashboardHarvestSection({ classroomId, teacherId }: { classroomId: string; teacherId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          What Can We Harvest?
        </h2>
      </div>
      
      <StudentHarvestWidget 
        classroomId={classroomId} 
        teacherId={teacherId}
        showTitle={false}
        maxItems={8}
      />

      <Alert>
        <Leaf className="h-4 w-4" />
        <AlertDescription>
          <strong>Students:</strong> Look for plants marked "Ready to Harvest!" - these need your help! 
          Ask your teacher before harvesting anything.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// 3. Usage in StudentTowerDetail.tsx - ADD THIS TO TOWER DETAIL
export function StudentTowerHarvestSection({ 
  towerId, 
  teacherId, 
  classroomId 
}: { 
  towerId: string; 
  teacherId: string; 
  classroomId: string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Calendar className="h-5 w-5 text-green-600" />
        This Tower's Harvest Schedule
      </h3>
      
      <StudentHarvestWidget 
        classroomId={classroomId} 
        teacherId={teacherId}
        showTitle={false}
        maxItems={5}
        towerId={towerId}
      />
    </div>
  );
}