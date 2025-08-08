import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/context/AppStore";

export default function Leaderboard() {
  const { state } = useAppStore();
  const classes = [
    { name: "Your Class", grams: total(state), towers: state.towers.length },
    { name: "District Average", grams: Math.round(total(state) * 1.2), towers: 7 },
    { name: "State Leader", grams: Math.round(total(state) * 1.8), towers: 18 },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Leaderboard</h1>
      <Card>
        <CardHeader><CardTitle>Harvest (g)</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          {classes.map((c)=> (
            <div key={c.name} className="p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">{c.name}</div>
              <div className="text-3xl font-bold">{c.grams.toLocaleString()} g</div>
              <div className="text-xs text-muted-foreground mt-1">Towers: {c.towers}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function total(state: ReturnType<typeof useAppStore>["state"]) {
  return state.towers.reduce((sum, t) => sum + t.harvests.reduce((s,h)=> s + h.weightGrams, 0), 0);
}
