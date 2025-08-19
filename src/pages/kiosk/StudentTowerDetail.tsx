// src/pages/kiosk/StudentTowerDetail.tsx (Fully Updated)

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Import BOTH report components
import VitalsReport from "@/components/reports/VitalsReport";
import PestReport from "@/components/reports/PestReport";

const ActionCard = ({ to, title, description }: { to: string; title: string; description: string }) => (
    // ... (no changes here)
);

export default function StudentTowerDetail() {
  const { id: towerId } = useParams();
  const [towerName, setTowerName] = useState("");
  const teacherId = localStorage.getItem("teacher_id_for_tower");

  useEffect(() => {
    // ... (no changes here)
  }, [towerId]);

  if (!towerId || !teacherId) {
    // ... (no changes here)
  }

  return (
    <div className="container py-8 space-y-8">
      <SEO title={`${towerName || 'Tower'} Detail | Sproutify School`} />
      
      <div className="flex items-center justify-between">
        {/* ... (no changes here) */}
      </div>

      {/* The Accordion now lives here, controlling both reports */}
      <Accordion type="single" collapsible defaultValue="vitals" className="w-full">
        <AccordionItem value="vitals">
            <AccordionTrigger className="text-2xl font-semibold">Vitals Report</AccordionTrigger>
            <AccordionContent className="pt-4">
                {/* We pass the props down to the VitalsReport component */}
                <VitalsReport towerId={towerId} teacherId={teacherId} />
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pests">
            <AccordionTrigger className="text-2xl font-semibold">Pest Observation History</AccordionTrigger>
            <AccordionContent className="pt-4">
                {/* And we do the same for our new PestReport component */}
                <PestReport towerId={towerId} teacherId={teacherId} />
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Log New Data</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ... (no changes to the action cards) ... */}
        </div>
      </div>
    </div>
  );
}
