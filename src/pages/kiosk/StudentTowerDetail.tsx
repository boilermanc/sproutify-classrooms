// src/pages/kiosk/StudentTowerDetail.tsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import VitalsReport from "@/components/reports/VitalsReport"; // 1. Import our new report component
import { Separator } from "@/components/ui/separator";

// This ActionCard component is still used for the data entry links
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

export default function StudentTowerDetail() {
  const { id: towerId } = useParams();
  const [towerName, setTowerName] = useState("");
  
  // 2. We need the teacherId for the VitalsReport, so let's get it from localStorage
  const teacherId = localStorage.getItem("teacher_id_for_tower");

  useEffect(() => {
    const fetchTowerName = async () => {
      if (!towerId) return;
      const { data } = await supabase.from("towers").select("name").eq("id", towerId).single();
      if (data) setTowerName(data.name);
    };
    fetchTowerName();
  }, [towerId]);

  if (!towerId || !teacherId) {
    // Handle the case where the required IDs are not available
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
          <p className="text-muted-foreground">Review reports and log new data for this tower.</p>
        </div>
        <Button variant="outline" asChild>
            <Link to="/student/dashboard">Back to All Towers</Link>
        </Button>
      </div>

      {/* 3. Add the VitalsReport component here */}
      <VitalsReport towerId={towerId} teacherId={teacherId} />

      <Separator />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Log New Data</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard to={`/student/vitals?towerId=${towerId}`} title="Log Vitals" description="Enter today's pH and EC readings." />
          <ActionCard to={`/student/harvest?towerId=${towerId}`} title="Log a Harvest" description="Record the weight of plants harvested." />
          <ActionCard to={`/student/waste?towerId=${towerId}`} title="Log Waste" description="Record any plants that were discarded." />
          <ActionCard to={`/student/pests?towerId=${towerId}`} title="Log Pest Observation" description="Note any pests or issues you see." />
          <ActionCard to={`/student/photos?towerId=${towerId}`} title="Add a Photo" description="Upload a picture of the tower's progress." />
        </div>
      </div>
    </div>
  );
}
