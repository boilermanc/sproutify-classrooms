import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/context/AppStore";

export default function DashboardHome() {
  const { state } = useAppStore();
  const towers = state.towers.length;
  const plants = state.towers.reduce((sum, t) => sum + t.plants.length, 0);
  const harvests = state.towers.reduce((sum, t) => sum + t.harvests.length, 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle>Total Towers</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{towers}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Plants</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{plants}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Harvests</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{harvests}</CardContent>
      </Card>
    </div>
  );
}
