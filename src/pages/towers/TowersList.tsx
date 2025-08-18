import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAppStore } from "@/context/AppStore";
import { supabase } from "@/integrations/supabase/client";

type Tower = {
  id: string;
  name: string;
  ports: number;
  plants: any[]; // You might want to type this properly based on your plant structure
};

export default function TowersList() {
  const { state, dispatch } = useAppStore();
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch towers from Supabase
  useEffect(() => {
    const fetchTowers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error("Authentication required");
        }

        if (!user) {
          throw new Error("You must be logged in to view towers");
        }

        // Fetch towers for this user
        const { data: towersData, error: fetchError } = await supabase
          .from('towers')
          .select('id, name, ports, created_at')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // Transform data and add plants (you might want to fetch plants separately)
        const transformedTowers: Tower[] = (towersData || []).map(tower => ({
          id: tower.id,
          name: tower.name,
          ports: tower.ports,
          plants: [], // TODO: Fetch plants for each tower if needed
        }));

        setTowers(transformedTowers);

        // Update local state to keep other parts of the app working
        // Clear existing towers and add the ones from Supabase
        dispatch({ type: "CLEAR_TOWERS" }); // You might need to add this action
        transformedTowers.forEach(tower => {
          dispatch({ 
            type: "SET_TOWER", // You might need this action too
            payload: tower 
          });
        });

      } catch (err) {
        console.error('Error fetching towers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load towers');
      } finally {
        setLoading(false);
      }
    };

    fetchTowers();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Towers</h1>
          <Button asChild>
            <Link to="/app/towers/new">Add Tower</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Towers</h1>
          <Button asChild>
            <Link to="/app/towers/new">Add Tower</Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Towers</h1>
        <Button asChild>
          <Link to="/app/towers/new">Add Tower</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {towers.map((t) => (
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
        {towers.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">No towers yet. Create your first one.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
