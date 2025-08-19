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

interface VitalsReportProps {
  towerId: string;
  teacherId: string;
}

type VitalReading = {
  recorded_at: string;
  ph: number | null;
  ec: number | null;
};

// Component for the "Smart Recommendation"
const RecommendationCard = ({ vital }: { vital: VitalReading | null }) => {
  if (!vital) {
    return (
        <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>No Data Yet</AlertTitle>
            <AlertDescription>Log your first pH and EC readings to get a recommendation.</AlertDescription>
        </Alert>
    );
  }

  const ph = vital.ph;
  
  if (ph === null) return null; // Don't show anything if pH wasn't recorded

  if (ph >= 5.2 && ph <= 5.8) {
    return (
      <Alert variant="default" className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-700" />
        <AlertTitle className="text-green-800">pH is Optimal</AlertTitle>
        <AlertDescription className="text-green-700">
          Nutrient uptake is excellent. No action is needed for pH.
        </AlertDescription>
      </Alert>
    );
  }

  if (ph > 5.8 && ph <= 6.2) {
    return (
      <Alert variant="default" className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-700" />
        <AlertTitle className="text-yellow-800">pH is Slightly High</AlertTitle>
        <AlertDescription className="text-yellow-700">
          The water is a little too basic. Consider adding a small amount of "pH Down" solution to bring it back into the ideal range.
        </AlertDescription>
      </Alert>
    );
  }

   if (ph < 5.2 && ph >= 5.0) {
    return (
      <Alert variant="default" className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-700" />
        <AlertTitle className="text-yellow-800">pH is Slightly Low</AlertTitle>
        <AlertDescription className="text-yellow-700">
          The water is a little too acidic. Consider adding a small amount of "pH Up" solution.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>pH is Out of Range</AlertTitle>
      <AlertDescription>
        The current pH level is dangerous for most plants. Immediate action with "pH Up" or "pH Down" is recommended to prevent root damage.
      </AlertDescription>
    </Alert>
  );
};


export default function VitalsReport({ towerId, teacherId }: VitalsReportProps) {
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVitals = async () => {
      if (!towerId || !teacherId) return;
      setLoading(true);
      
      // THIS IS THE CORRECTED QUERY
      // It now filters out rows where both pH and EC are null.
      const { data, error } = await supabase
        .from("tower_vitals")
        .select("recorded_at, ph, ec")
        .eq("tower_id", towerId)
        .eq("teacher_id", teacherId)
        .or('ph.is.not.null,ec.is.not.null') // Only get rows with at least one value
        .order("recorded_at", { ascending: true })
        .limit(30);

      if (error) {
        console.error("Error fetching vitals:", error);
      } else {
        // Format the date for better chart display
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
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }
  
  // Find the most recent reading that actually has a pH value
  const latestVitalWithPh = [...vitals].reverse().find(v => v.ph !== null) || null;

  return (
    <div className="space-y-6">
        <RecommendationCard vital={latestVitalWithPh} />

        <Card>
            <CardHeader>
                <CardTitle>pH History</CardTitle>
                <CardDescription>Tracks the acidity of the water over the last 30 readings.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
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
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>EC History (mS/cm)</CardTitle>
                <CardDescription>Tracks the nutrient concentration in the water.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
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
            </CardContent>
        </Card>
    </div>
  );
}
