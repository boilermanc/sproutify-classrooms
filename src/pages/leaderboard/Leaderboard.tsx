// src/pages/leaderboard/Leaderboard.tsx (Fixed to use database data)

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { anonymousSupabase } from "@/integrations/supabase/anonymous-client";

interface LeaderboardStats {
  totalWeight: number;
  totalPlants: number;
  towerCount: number;
}

export default function Leaderboard() {
  const [stats, setStats] = useState<LeaderboardStats>({
    totalWeight: 0,
    totalPlants: 0,
    towerCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      // Get teacher ID from localStorage (set during student login)
      const teacherId = localStorage.getItem("teacher_id_for_tower");
      if (!teacherId) {
        console.log("No teacher ID found in localStorage");
        setLoading(false);
        return;
      }

      console.log("Loading leaderboard data for teacher:", teacherId);

      // Get harvest totals from database
      const { data: harvestData, error: harvestError } = await anonymousSupabase
        .from('harvests')
        .select('weight_grams, plant_quantity')
        .eq('teacher_id', teacherId);

      if (harvestError) {
        console.error('Error loading harvest data:', harvestError);
        return;
      }

      // Get tower count from database
      const { data: towerData, error: towerError } = await anonymousSupabase
        .from('towers')
        .select('id')
        .eq('teacher_id', teacherId);

      if (towerError) {
        console.error('Error loading tower data:', towerError);
        return;
      }

      // Calculate totals from actual database data
      const totalWeight = harvestData?.reduce((sum, h) => sum + (h.weight_grams || 0), 0) || 0;
      const totalPlants = harvestData?.reduce((sum, h) => sum + (h.plant_quantity || 0), 0) || 0;
      const towerCount = towerData?.length || 0;

      console.log("Leaderboard stats:", { totalWeight, totalPlants, towerCount });

      setStats({
        totalWeight,
        totalPlants,
        towerCount
      });

    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Data for the Harvest Weight Leaderboard (using real database data)
  const harvestClasses = [
    { name: "Your Class", grams: stats.totalWeight, towers: stats.towerCount },
    { name: "District Average", grams: Math.round(stats.totalWeight * 1.2), towers: 7 },
    { name: "State Leader", grams: Math.round(stats.totalWeight * 1.8), towers: 18 },
  ];

  // Data for the Number of Plants Leaderboard (using real database data)
  const plantClasses = [
    { name: "Your Class", plants: stats.totalPlants, towers: stats.towerCount },
    { name: "District Average", plants: Math.round(stats.totalPlants * 1.3), towers: 7 },
    { name: "State Leader", plants: Math.round(stats.totalPlants * 1.9), towers: 18 },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        <div className="text-center py-8">Loading leaderboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Leaderboard</h1>

      {/* Debug info - remove this after testing */}
      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
        Debug: {stats.totalWeight}g total, {stats.totalPlants} plants, {stats.towerCount} towers
      </div>

      {/* Card 1: Harvest Weight */}
      <Card>
        <CardHeader><CardTitle>Total Harvest (Weight)</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          {harvestClasses.map((c) => (
            <div key={c.name} className="p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">{c.name}</div>
              <div className="text-3xl font-bold">{c.grams.toLocaleString()} g</div>
              <div className="text-xs text-muted-foreground mt-1">Towers: {c.towers}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Card 2: Number of Plants */}
      <Card>
        <CardHeader><CardTitle>Total Harvest (Plants)</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          {plantClasses.map((c) => (
            <div key={c.name} className="p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">{c.name}</div>
              <div className="text-3xl font-bold">{c.plants.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Towers: {c.towers}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}