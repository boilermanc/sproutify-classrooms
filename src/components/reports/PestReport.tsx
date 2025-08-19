// src/components/reports/PestReport.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "../ui/skeleton";
import { Bug } from "lucide-react";

interface PestReportProps {
  towerId: string;
  teacherId: string;
}

type PestLog = {
  id: string;
  observed_at: string;
  pest: string;
  action: string | null;
  notes: string | null;
};

export default function PestReport({ towerId, teacherId }: PestReportProps) {
  const [pestLogs, setPestLogs] = useState<PestLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPestLogs = async () => {
      if (!towerId || !teacherId) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("pest_logs")
        .select("id, observed_at, pest, action, notes")
        .eq("tower_id", towerId)
        .eq("teacher_id", teacherId)
        .order("observed_at", { ascending: false }) // Show most recent first
        .limit(20);

      if (error) {
        console.error("Error fetching pest logs:", error);
      } else {
        setPestLogs(data || []);
      }
      setLoading(false);
    };

    fetchPestLogs();
  }, [towerId, teacherId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  
  if (pestLogs.length === 0) {
    return <p className="text-sm text-muted-foreground p-4">Great news! No pests have been observed.</p>
  }

  return (
    <div className="space-y-4">
      {pestLogs.map((log) => (
        <div key={log.id} className="p-4 border-l-4 border-yellow-400 bg-muted/20 rounded-r-md">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <div className="flex items-center gap-1">
                    <Bug className="h-3 w-3" />
                    <span>Observation</span>
                </div>
                <span>{new Date(log.observed_at).toLocaleDateString()}</span>
            </div>
            <p className="font-semibold text-primary">{log.pest}</p>
            {log.action && (
                <p className="text-sm mt-1">
                    <span className="font-medium">Action Taken:</span> {log.action}
                </p>
            )}
             {log.notes && (
                <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
            )}
        </div>
      ))}
    </div>
  );
}
