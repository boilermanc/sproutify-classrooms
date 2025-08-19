// src/components/reports/VitalsReport.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";
import { Skeleton } from "../ui/skeleton";

// 1. Import the Accordion components from shadcn/ui
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// --- The RecommendationCard component remains exactly the same ---
interface VitalsReportProps {
  towerId: string;
  teacherId: string;
}

type VitalReading = {
  recorded_at: string;
  ph: number | null;
  ec: number | null;
};

const RecommendationCard = ({ vital }: { vital: VitalReading | null }) => {
    // ... (no changes in this component)
};

// --- The main component is updated below ---

export default function VitalsReport({ towerId, teacherId }: VitalsReportProps) {
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVitals = async () => {
      if (!towerId || !teacherId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("tower_vitals")
        .select("recorded_at, ph, ec")
        .eq("tower_id", towerId)
        .eq("teacher_id", teacherId)
        .or('ph.is.not.null,ec.is.not.null')
        .order("recorded_at", { ascending: true })
        .limit(30);

      if (error) {
        console.error("Error fetching vitals:", error);
      } else {
        const formattedData = data.map(d => ({
            ...d,
            recorded_at: new Date(d.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
        setVitals(formattedData);
      }
      setLoading(false);
    };
    fetchVitals();
  }, [towerId, teacherId]);

  if (loading) {
    // ... (loading skeleton remains the same)
  }
  
  const latestVitalWithPh = [...vitals].reverse().find(v => v.ph !== null) || null;

  return (
    <div className="space-y-6">
        <RecommendationCard vital={latestVitalWithPh} />

        {/* 2. Wrap the reports in the Accordion component */}
        {/* We'll have it default to the pH chart being open */}
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            
            {/* pH History Report */}
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold">pH History</AccordionTrigger>
                <AccordionContent>
                    {/* The original CardContent is now inside the AccordionContent */}
                    <CardDescription>Tracks the acidity of the water over the last 30 readings.</CardDescription>
                    <div className="h-80 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vitals} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="recorded_at" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis domain={[4.5, 7.5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                <Legend />
                                <ReferenceArea y1={5.2} y2={5.8} fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeOpacity={0.3} label={{ value: 'Ideal', position: 'insideTopRight', fill: 'hsl(var(--primary))', fontSize: 10 }}/>
                                <Line type="monotone" dataKey="ph" name="pH" stroke="hsl(var(--primary))" connectNulls dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* EC History Report */}
            <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold">EC History (mS/cm)</AccordionTrigger>
                <AccordionContent>
                    <CardDescription>Tracks the nutrient concentration in the water.</CardDescription>
                    <div className="h-80 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vitals} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="recorded_at" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis domain={[0.5, 2.5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Legend />
                                <ReferenceArea y1={1.2} y2={2.0} fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeOpacity={0.3} label={{ value: 'Ideal', position: 'insideTopRight', fill: 'hsl(var(--primary))', fontSize: 10 }} />
                                <Line type="monotone" dataKey="ec" name="EC" stroke="hsl(var(--primary))" connectNulls dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
}
