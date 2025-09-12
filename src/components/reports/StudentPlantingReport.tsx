// src/components/reports/StudentPlantingReport.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Leaf, Calendar, MapPin } from "lucide-react";

interface StudentPlantingReportProps {
  towerId: string;
  teacherId: string;
}

type Planting = {
  id: string;
  name: string;
  planted_at: string;
  port_number: number | null;
  quantity: number;
  status: string;
  expected_harvest_date: string | null;
};

export default function StudentPlantingReport({ towerId, teacherId }: StudentPlantingReportProps) {
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlantings = async () => {
      if (!towerId || !teacherId) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("plantings")
        .select("id, name, planted_at, port_number, quantity, status, expected_harvest_date")
        .eq("tower_id", towerId)
        .eq("teacher_id", teacherId)
        .order("planted_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching plantings:", error);
      } else {
        setPlantings(data || []);
      }
      setLoading(false);
    };

    fetchPlantings();
  }, [towerId, teacherId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'harvested': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'wasted': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🌱';
      case 'harvested': return '✅';
      case 'wasted': return '❌';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysSincePlanted = (plantedAt: string) => {
    const planted = new Date(plantedAt);
    const today = new Date();
    const diffTime = today.getTime() - planted.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilHarvest = (harvestDate: string | null) => {
    if (!harvestDate) return null;
    const harvest = new Date(harvestDate);
    const today = new Date();
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Planting History
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

  if (plantings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Planting History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-2">No plants logged yet</h3>
            <p className="text-sm text-muted-foreground">
              Planting history will appear here once plants are added!
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
          <Leaf className="h-5 w-5 text-green-600" />
          Planting History ({plantings.length} plants)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plantings.map((planting) => {
            const daysSincePlanted = getDaysSincePlanted(planting.planted_at);
            const daysUntilHarvest = getDaysUntilHarvest(planting.expected_harvest_date);
            
            return (
              <div key={planting.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(planting.status)}</span>
                    <h3 className="font-semibold text-lg">{planting.name}</h3>
                    <Badge className={getStatusColor(planting.status)}>
                      {planting.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {planting.quantity} {planting.quantity === 1 ? 'plant' : 'plants'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Planted:</span>
                    <span className="font-medium">{formatDate(planting.planted_at)}</span>
                    <span className="text-muted-foreground">({daysSincePlanted} days ago)</span>
                  </div>
                  
                  {planting.port_number && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Port:</span>
                      <span className="font-medium">{planting.port_number}</span>
                    </div>
                  )}
                  
                  {planting.expected_harvest_date && (
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Harvest:</span>
                      <span className="font-medium">{formatDate(planting.expected_harvest_date)}</span>
                      {daysUntilHarvest !== null && (
                        <span className="text-muted-foreground">
                          ({daysUntilHarvest > 0 ? `${daysUntilHarvest} days left` : `${Math.abs(daysUntilHarvest)} days overdue`})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
