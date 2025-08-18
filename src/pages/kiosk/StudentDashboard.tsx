// src/pages/kiosk/StudentDashboard.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Leaderboard from "@/pages/leaderboard/Leaderboard";
import { SEO } from "@/components/SEO";

// A simple data card for navigation
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

export default function StudentDashboard() {
  const [towerId, setTowerId] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const classroomId = localStorage.getItem("student_classroom_id");
    if (!classroomId) return;

    // To figure out which tower to work on, we first find the teacher who owns the classroom
    const fetchTowerInfo = async () => {
      const { data: classroomData, error: classError } = await supabase
        .from("classrooms")
        .select("teacher_id")
        .eq("id", classroomId)
        .single();
      
      if (classError || !classroomData) {
        console.error("Could not find classroom's teacher");
        return;
      }

      const currentTeacherId = classroomData.teacher_id;
      setTeacherId(currentTeacherId);

      // Then, we find the first tower that belongs to that teacher
      // NOTE: This assumes one tower per teacher for now. This can be expanded later.
      const { data: towerData, error: towerError } = await supabase
        .from("towers")
        .select("id")
        .eq("teacher_id", currentTeacherId)
        .limit(1)
        .single();
      
      if (towerError || !towerData) {
        console.error("Could not find a tower for this class");
        return;
      }
      setTowerId(towerData.id);
    };

    fetchTowerInfo();
  }, []);

  return (
    <div className="container py-8 space-y-8">
      <SEO title="Student Dashboard | Sproutify School" />
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Select a task to get started.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {towerId ? (
          <>
            <ActionCard to={`/student/vitals?towerId=${towerId}`} title="Log Vitals" description="Enter today's pH and EC readings." />
            <ActionCard to={`/student/harvest?towerId=${towerId}`} title="Log a Harvest" description="Record the weight of the plants you harvested." />
            <ActionCard to={`/student/photos?towerId=${towerId}`} title="Add a Photo" description="Upload a picture of the tower's progress." />
            {/* Add more cards here for Pests, Waste, etc. as needed */}
          </>
        ) : (
          <p className="text-muted-foreground">Loading tower information...</p>
        )}
      </div>

      <Leaderboard />
    </div>
  );
}
