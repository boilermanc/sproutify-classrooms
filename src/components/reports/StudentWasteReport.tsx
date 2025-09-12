// src/components/reports/StudentWasteReport.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, Scale, MapPin, AlertTriangle } from "lucide-react";

interface StudentWasteReportProps {
  towerId: string;
  teacherId: string;
}

type WasteLog = {
  id: string;
  plant_name: string | null;
  logged_at: string;
  grams: number;
  notes: string | null;
};

export default function StudentWasteReport({ towerId, teacherId }: StudentWasteReportProps) {
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWasteLogs = async () => {
      if (!towerId || !teacherId) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("waste_logs")
        .select("id, plant_name, logged_at, grams, notes")
        .eq("tower_id", towerId)
        .eq("teacher_id", teacherId)
        .order("logged_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching waste logs:", error);
      } else {
        setWasteLogs(data || []);
      }
      setLoading(false);
    };

    fetchWasteLogs();
  }, [towerId, teacherId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalWaste = () => {
    return wasteLogs.reduce((total, waste) => total + waste.grams, 0);
  };

  const getAverageWaste = () => {
    if (wasteLogs.length === 0) return 0;
    return Math.round(getTotalWaste() / wasteLogs.length);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Waste History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (wasteLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Waste History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-2">No waste recorded yet</h3>
            <p className="text-sm text-muted-foreground">
              Great! No plants have been discarded yet.
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
          <Trash2 className="h-5 w-5 text-red-600" />
          Waste History ({wasteLogs.length} entries)
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Scale className="h-4 w-4" />
            <span>Total: {getTotalWaste()}g</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Average: {getAverageWaste()}g</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {wasteLogs.map((waste) => (
            <div key={waste.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗑️</span>
                  <h3 className="font-semibold text-lg">
                    {waste.plant_name || "Unknown Plant"}
                  </h3>
                  <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                    Waste
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{waste.grams}g</div>
                  <div className="text-xs text-muted-foreground">by Teacher</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Discarded:</span>
                  <span className="font-medium">{formatDate(waste.logged_at)}</span>
                </div>
                
                {waste.notes && (
                  <div className="md:col-span-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="font-medium">{waste.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
