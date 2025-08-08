import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/context/AppStore";

export default function TowersList() {
  const { state } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Towers</h1>
        <Button asChild>
          <Link to="/app/towers/new">Add Tower</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {state.towers.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t.name}</span>
                <span className="text-sm text-muted-foreground">{t.ports} ports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Plants: {t.plants.length}</div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/app/towers/${t.id}`}>Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {state.towers.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">No towers yet. Create your first one.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
