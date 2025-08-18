// src/pages/leaderboard/Leaderboard.tsx (Fully Updated)

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/context/AppStore";

export default function Leaderboard() {
  const { state } = useAppStore();

  // Data for the Harvest Weight Leaderboard
  const harvestClasses = [
    { name: "Your Class", grams: totalWeight(state), towers: state.towers.length },
    { name: "District Average", grams: Math.round(totalWeight(state) * 1.2), towers: 7 },
    { name: "State Leader", grams: Math.round(totalWeight(state) * 1.8), towers: 18 },
  ];

  // Data for the Number of Plants Leaderboard
  const plantClasses = [
    { name: "Your Class", plants: totalPlants(state), towers: state.towers.length },
    { name: "District Average", plants: Math.round(totalPlants(state) * 1.3), towers: 7 },
    { name: "State Leader", plants: Math.round(totalPlants(state) * 1.9), towers: 18 },
  ];


  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Leaderboard</h1>

      {/* Card 1: Harvest Weight */}
      <Card>
        <CardHeader><CardTitle>Total Harvest (Weight)</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          {harvestClasses.map((c)=> (
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
          {plantClasses.map((c)=> (
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

// This function calculates the total weight from all harvests
function totalWeight(state: ReturnType<typeof useAppStore>["state"]) {
  // Assuming 'weightGrams' exists on your harvest objects in the store
  return state.towers.reduce((sum, t) => sum + t.harvests.reduce((s,h)=> s + (h.weight_grams || 0), 0), 0);
}

// This NEW function calculates the total number of plants from all harvests
function totalPlants(state: ReturnType<typeof useAppStore>["state"]) {
  // Assuming 'plant_quantity' exists on your harvest objects in the store
  return state.towers.reduce((sum, t) => sum + t.harvests.reduce((s,h)=> s + (h.plant_quantity || 0), 0), 0);
}
