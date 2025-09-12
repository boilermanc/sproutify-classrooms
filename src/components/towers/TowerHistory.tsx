import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface TowerHistoryProps {
  towerId: string;
  teacherId: string; // 1. Make teacherId a required prop
  refreshKey?: number;
}

export function TowerHistory({ towerId, teacherId, refreshKey }: TowerHistoryProps) {
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [harvestsData, setHarvestsData] = useState<any[]>([]);
  const [wasteData, setWasteData] = useState<any[]>([]);
  const [pestsData, setPestsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      // Guard against running if the teacherId prop isn't available yet
      if (!teacherId) return; 

      try {
        setLoading(true);
        
        // 2. REMOVE the local call to supabase.auth.getUser()
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) return;

        // 3. USE the teacherId prop in all queries
        const [vitals, harvests, waste, pests] = await Promise.all([
          supabase.from('tower_vitals').select('*').eq('tower_id', towerId).eq('teacher_id', teacherId).order('recorded_at', { ascending: false }).limit(50),
          supabase.from('harvests').select('id, plant_name, harvested_at, plant_quantity, weight_grams, destination, tower_id').eq('tower_id', towerId).eq('teacher_id', teacherId).order('harvested_at', { ascending: false }).limit(50),
          supabase.from('waste_logs').select('id, plant_name, logged_at, grams, notes, tower_id').eq('tower_id', towerId).eq('teacher_id', teacherId).order('logged_at', { ascending: false }).limit(50),
          supabase.from('pest_logs').select('*').eq('tower_id', towerId).eq('teacher_id', teacherId).order('observed_at', { ascending: false }).limit(50),
        ]);
        
        setVitalsData(vitals.data || []);
        setHarvestsData(harvests.data || []);
        setWasteData(waste.data || []);
        setPestsData(pests.data || []);

      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoricalData();
  }, [towerId, teacherId, refreshKey]); // 4. Add teacherId to the dependency array

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vitals History */}
      <Card>
        <CardHeader><CardTitle>Vitals History</CardTitle></CardHeader>
        <CardContent>
          {vitalsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No vitals data recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {vitalsData.map((vital) => (
                <div key={vital.id} className="grid grid-cols-4 gap-4 p-3 border rounded-md">
                  <div> <div className="text-xs text-muted-foreground">Date</div> <div>{new Date(vital.recorded_at).toLocaleDateString()}</div> </div>
                  <div> <div className="text-xs text-muted-foreground">pH</div> <div>{vital.ph || "-"}</div> </div>
                  <div> <div className="text-xs text-muted-foreground">EC</div> <div>{vital.ec || "-"}</div> </div>
                  <div> <div className="text-xs text-muted-foreground">Light (lux)</div> <div>{vital.light_lux || "-"}</div> </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pest Logs History */}
      <Card>
        <CardHeader><CardTitle>Pest Log History</CardTitle></CardHeader>
        <CardContent>
          {pestsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pest observations recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {pestsData.map((pest) => (
                <div key={pest.id} className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground mb-1"> {new Date(pest.observed_at).toLocaleDateString()} </div>
                  <div className="font-medium">{pest.pest}</div>
                  {pest.notes && <div className="text-sm text-muted-foreground">{pest.notes}</div>}
                  {pest.action && <div className="text-sm">Action: {pest.action}</div>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Harvests History */}
      <Card>
        <CardHeader><CardTitle>Harvest History</CardTitle></CardHeader>
        <CardContent>
          {harvestsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No harvests recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {harvestsData.map((harvest) => (
                <div key={harvest.id} className="grid grid-cols-4 gap-4 p-3 border rounded-md">
                  <div> <div className="text-xs text-muted-foreground">Date</div> <div>{harvest.harvested_at}</div> </div>
                  <div> <div className="text-xs text-muted-foreground">Plant</div> <div>{harvest.plant_name || "-"}</div> </div>
                  <div> <div className="text-xs text-muted-foreground">Weight</div> <div>{harvest.weight_grams} g</div> </div>
                  <div> <div className="text-xs text-muted-foreground">Destination</div> <div>{harvest.destination || "-"}</div> </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Waste History */}
      <Card>
        <CardHeader><CardTitle>Waste History</CardTitle></CardHeader>
        <CardContent>
          {wasteData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No waste recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {wasteData.map((waste) => (
                <div key={waste.id} className="grid grid-cols-4 gap-4 p-3 border rounded-md">
                  <div> <div className="text-xs text-muted-foreground">Date</div> <div>{waste.logged_at}</div> </div>
                  <div> <div className="text-xs text-muted-foreground">Plant</div> <div>{waste.plant_name || "-"}</div> </div>
                  <div> <div className="text-xs text-muted-foreground">Weight</div> <div>{waste.grams} g</div> </div>
                  <div> <div className="text-xs text-muted-foreground">Notes</div> <div>{waste.notes || "-"}</div> </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
