// src/components/reports/StudentHarvestReport.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wheat, Calendar, Scale, MapPin } from "lucide-react";

interface StudentHarvestReportProps {
  towerId: string;
  teacherId: string;
}

type HarvestLog = {
  id: string;
  plant_name: string | null;
  harvested_at: string;
  plant_quantity: number | null;
  weight_grams: number;
  destination: string | null;
  tower_id: string;
};

export default function StudentHarvestReport({ towerId, teacherId }: StudentHarvestReportProps) {
  const [harvests, setHarvests] = useState<HarvestLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHarvests = async () => {
      if (!towerId || !teacherId) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("harvests")
        .select("id, plant_name, harvested_at, plant_quantity, weight_grams, destination, tower_id")
        .eq("tower_id", towerId)
        .eq("teacher_id", teacherId)
        .order("harvested_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching harvests:", error);
      } else {
        setHarvests(data || []);
      }
      setLoading(false);
    };

    fetchHarvests();
  }, [towerId, teacherId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalWeight = () => {
    return harvests.reduce((total, harvest) => total + (harvest.weight_grams || harvest.plant_quantity || 0), 0);
  };

  const getAverageWeight = () => {
    if (harvests.length === 0) return 0;
    return Math.round(getTotalWeight() / harvests.length);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-green-600" />
            Harvest History
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

  if (harvests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-green-600" />
            Harvest History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wheat className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-2">No harvests recorded yet</h3>
            <p className="text-sm text-muted-foreground">
              Harvest history will appear here once plants are harvested!
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
          <Wheat className="h-5 w-5 text-green-600" />
          Harvest History ({harvests.length} harvests)
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Scale className="h-4 w-4" />
            <span>Total: {getTotalWeight()}g</span>
          </div>
          <div className="flex items-center gap-1">
            <Wheat className="h-4 w-4" />
            <span>Average: {getAverageWeight()}g</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {harvests.map((harvest) => (
            <div key={harvest.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥗</span>
                  <h3 className="font-semibold text-lg">{harvest.plant_name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{harvest.weight_grams || harvest.plant_quantity || 0}g</div>
                  <div className="text-xs text-muted-foreground">by Teacher</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Harvested:</span>
                  <span className="font-medium">{formatDate(harvest.harvested_at)}</span>
                </div>
                
                {harvest.destination && (
                  <div className="flex items-center gap-2">
                    <Wheat className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Destination:</span>
                    <span className="font-medium">{harvest.destination}</span>
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
