// src/pages/kiosk/StudentTowerDetail.tsx - Complete with Harvest Widget
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Calendar,
  Clock,
  Sparkles,
  Trophy,
  Leaf,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import VitalsReport from "@/components/reports/VitalsReport";
import PestReport from "@/components/reports/PestReport";
import StudentPhotoReport from "@/components/reports/StudentPhotoReport";
import StudentPlantingReport from "@/components/reports/StudentPlantingReport";
import StudentHarvestReport from "@/components/reports/StudentHarvestReport";
import StudentWasteReport from "@/components/reports/StudentWasteReport";

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

// ActionCard component for the action buttons
const ActionCard = ({ to, title, description }: { to: string; title: string; description: string }) => (
  <Link to={to}>
    <Card className="hover:bg-muted/50 hover:border-primary transition-all h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  </Link>
);

// Student Tower Harvest Widget Component
function StudentTowerHarvestWidget({ 
  towerId, 
  teacherId, 
  classroomId,
  maxItems = 5
}: {
  towerId: string;
  teacherId: string;
  classroomId: string;
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
          .eq('tower_id', towerId)
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

    if (teacherId && classroomId && towerId) {
      fetchHarvests();
    }
  }, [classroomId, teacherId, towerId, maxItems]);

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            This Tower's Harvest Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-8 w-3/4 rounded" />
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
            This Tower's Harvest Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-2">No harvests scheduled for this tower</h3>
            <p className="text-sm text-muted-foreground">
              Plants need harvest dates to appear here!
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
          <Calendar className="h-5 w-5 text-green-600" />
          This Tower's Harvest Schedule
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
                    {harvest.portNumber && (
                      <p className="text-sm text-muted-foreground">
                        Port {harvest.portNumber}
                      </p>
                    )}
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
                    {harvest.portNumber && (
                      <p className="text-sm text-muted-foreground">Port {harvest.portNumber}</p>
                    )}
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
              <h4 className="font-medium text-sm">🌱 Still Growing...</h4>
            </div>
            <div className="grid gap-2">
              {later.map((harvest) => (
                <div key={harvest.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{harvest.plantName}</p>
                    {harvest.portNumber && (
                      <p className="text-xs text-muted-foreground">Port {harvest.portNumber}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {harvest.daysRemaining} days
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert>
          <Leaf className="h-4 w-4" />
          <AlertDescription>
            <strong>Remember:</strong> Always ask your teacher before harvesting any plants!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default function StudentTowerDetail() {
  const { id: towerId } = useParams();
  const [towerName, setTowerName] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const teacherId = localStorage.getItem("teacher_id_for_tower");

  useEffect(() => {
    const storedClassroomId = localStorage.getItem("student_classroom_id");
    if (storedClassroomId) {
      setClassroomId(storedClassroomId);
    }

    const fetchTowerName = async () => {
      if (!towerId) return;
      const { data } = await supabase.from("towers").select("name").eq("id", towerId).single();
      if (data) setTowerName(data.name);
    };
    fetchTowerName();
  }, [towerId]);

  if (!towerId || !teacherId) {
    return (
        <div className="container py-8">
            <p className="text-muted-foreground">Error: Missing tower or class information. Please go back and try again.</p>
            <Button variant="outline" asChild className="mt-4">
                <Link to="/student/dashboard">Back to Dashboard</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <SEO title={`${towerName || 'Tower'} Detail | Sproutify School`} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{towerName || "Tower Detail"}</h1>
          <p className="text-muted-foreground">Review reports, check harvest schedule, and log new data for this tower.</p>
        </div>
        <Button variant="outline" asChild>
            <Link to="/student/dashboard">Back to All Towers</Link>
        </Button>
      </div>

      {/* Log New Data Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Log New Data</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard to={`/student/add-plant?towerId=${towerId}`} title="Add a New Plant" description="Log a new seedling you've just planted." />
            <ActionCard to={`/student/vitals?towerId=${towerId}`} title="Log Vitals" description="Enter today's pH and EC readings." />
            <ActionCard to={`/student/harvest?towerId=${towerId}`} title="Log a Harvest" description="Record the weight of plants harvested." />
            <ActionCard to={`/student/waste?towerId=${towerId}`} title="Log Waste" description="Record any plants that were discarded." />
            <ActionCard to={`/student/pests?towerId=${towerId}`} title="Log Pest Observation" description="Note any pests or issues you see." />
            <ActionCard to={`/student/photos?towerId=${towerId}`} title="Add a Photo" description="Upload a picture of the tower's progress." />
        </div>
      </div>

      <Separator />

      {/* Tower Harvest Schedule */}
      {teacherId && classroomId && towerId && (
        <StudentTowerHarvestWidget 
          towerId={towerId} 
          teacherId={teacherId}
          classroomId={classroomId}
        />
      )}

      <Accordion type="single" collapsible defaultValue="vitals" className="w-full">
        <AccordionItem value="vitals">
            <AccordionTrigger className="text-2xl font-semibold">Vitals Report</AccordionTrigger>
            <AccordionContent className="pt-4">
                <VitalsReport towerId={towerId} teacherId={teacherId} />
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="photos">
            <AccordionTrigger className="text-2xl font-semibold">Photo Gallery</AccordionTrigger>
            <AccordionContent className="pt-4">
                <StudentPhotoReport towerId={towerId} teacherId={teacherId} />
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="planting">
            <AccordionTrigger className="text-2xl font-semibold">Planting History</AccordionTrigger>
            <AccordionContent className="pt-4">
                <StudentPlantingReport towerId={towerId} teacherId={teacherId} />
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="harvests">
            <AccordionTrigger className="text-2xl font-semibold">Harvest History</AccordionTrigger>
            <AccordionContent className="pt-4">
                <StudentHarvestReport towerId={towerId} teacherId={teacherId} />
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="waste">
            <AccordionTrigger className="text-2xl font-semibold">Waste History</AccordionTrigger>
            <AccordionContent className="pt-4">
                <StudentWasteReport towerId={towerId} teacherId={teacherId} />
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pests">
            <AccordionTrigger className="text-2xl font-semibold">Pest Observation History</AccordionTrigger>
            <AccordionContent className="pt-4">
                <PestReport towerId={towerId} teacherId={teacherId} />
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}