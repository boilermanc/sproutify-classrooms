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
        .or("ph.not.is.null,ec.not.is.null")
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
                <AccordionTrigger className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"></div>
                    pH History
                </AccordionTrigger>
                <AccordionContent>
                    {/* The original CardContent is now inside the AccordionContent */}
                    <CardDescription>Tracks the acidity of the water over the last 30 readings.</CardDescription>
                    <div className="h-80 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vitals} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis 
                                    dataKey="recorded_at" 
                                    stroke="#64748b" 
                                    fontSize={12}
                                    tickLine={{ stroke: '#64748b' }}
                                    axisLine={{ stroke: '#64748b' }}
                                />
                                <YAxis 
                                    domain={[4.5, 7.5]} 
                                    stroke="#64748b" 
                                    fontSize={12}
                                    tickLine={{ stroke: '#64748b' }}
                                    axisLine={{ stroke: '#64748b' }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1e293b', 
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9'
                                    }} 
                                />
                                <Legend />
                                <ReferenceArea 
                                    y1={5.2} 
                                    y2={5.8} 
                                    fill="#22c55e" 
                                    fillOpacity={0.15} 
                                    stroke="#22c55e" 
                                    strokeOpacity={0.4} 
                                    strokeDasharray="5 5"
                                    label={{ 
                                        value: 'Ideal Range', 
                                        position: 'insideTopRight', 
                                        fill: '#22c55e', 
                                        fontSize: 11,
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="ph" 
                                    name="pH Level" 
                                    stroke="#3b82f6" 
                                    connectNulls 
                                    dot={{ 
                                        fill: '#3b82f6', 
                                        strokeWidth: 2, 
                                        r: 4,
                                        stroke: '#ffffff'
                                    }} 
                                    strokeWidth={3}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* EC History Report */}
            <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-200 via-blue-500 to-purple-500"></div>
                    EC History (mS/cm)
                </AccordionTrigger>
                <AccordionContent>
                    <CardDescription>Tracks the nutrient concentration in the water.</CardDescription>
                    <div className="h-80 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vitals} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis 
                                    dataKey="recorded_at" 
                                    stroke="#64748b" 
                                    fontSize={12}
                                    tickLine={{ stroke: '#64748b' }}
                                    axisLine={{ stroke: '#64748b' }}
                                />
                                <YAxis 
                                    domain={[0.5, 2.5]} 
                                    stroke="#64748b" 
                                    fontSize={12}
                                    tickLine={{ stroke: '#64748b' }}
                                    axisLine={{ stroke: '#64748b' }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1e293b', 
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f1f5f9'
                                    }}
                                />
                                <Legend />
                                <ReferenceArea 
                                    y1={1.2} 
                                    y2={2.0} 
                                    fill="#22c55e" 
                                    fillOpacity={0.15} 
                                    stroke="#22c55e" 
                                    strokeOpacity={0.4} 
                                    strokeDasharray="5 5"
                                    label={{ 
                                        value: 'Ideal Range', 
                                        position: 'insideTopRight', 
                                        fill: '#22c55e', 
                                        fontSize: 11,
                                        fontWeight: 'bold'
                                    }} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="ec" 
                                    name="EC Level" 
                                    stroke="#22c55e" 
                                    connectNulls 
                                    dot={{ 
                                        fill: '#22c55e', 
                                        strokeWidth: 2, 
                                        r: 4,
                                        stroke: '#ffffff'
                                    }} 
                                    strokeWidth={3}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
}
