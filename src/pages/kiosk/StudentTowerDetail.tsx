// src/pages/kiosk/StudentTowerDetail.tsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";

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
  const { id: towerId } = useParams(); // Get the tower ID from the URL
  const [towerName, setTowerName] = useState("");

  useEffect(() => {
    // Fetch the tower's name to display it in the title
    const fetchTowerName = async () => {
      if (!towerId) return;
      const { data } = await supabase.from("towers").select("name").eq("id", towerId).single();
      if (data) setTowerName(data.name);
    };
    fetchTowerName();
  }, [towerId]);

  return (
    <div className="container py-8 space-y-8">
      <SEO title={`${towerName || 'Tower'} Detail | Sproutify School`} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{towerName || "Tower Detail"}</h1>
          <p className="text-muted-foreground">Select a task for this tower.</p>
        </div>
        <Button variant="outline" asChild>
            <Link to="/student/dashboard">Back to All Towers</Link>
        </Button>
      </div>

      {/* This is the grid of actions, now specific to this tower */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard to={`/student/vitals?towerId=${towerId}`} title="Log Vitals" description="Enter today's pH and EC readings." />
        <ActionCard to={`/student/harvest?towerId=${towerId}`} title="Log a Harvest" description="Record the weight of plants harvested." />
        <ActionCard to={`/student/waste?towerId=${towerId}`} title="Log Waste" description="Record any plants that were discarded." />
        <ActionCard to={`/student/pests?towerId=${towerId}`} title="Log Pest Observation" description="Note any pests or issues you see." />
        <ActionCard to={`/student/photos?towerId=${towerId}`} title="Add a Photo" description="Upload a picture of the tower's progress." />
      </div>
    </div>
  );
}
