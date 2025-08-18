import { useMemo, useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppStore, newPlant } from "@/context/AppStore";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // Adjust import path as needed

type PlantCatalogItem = {
  id: string;
  name: string;
  category: "Leafy Green" | "Herb";
  days?: number;
  description?: string;
  image_url?: string;
};

export default function PlantCatalog() {
  const { state, dispatch } = useAppStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const addToTowerId = params.get("addTo") || undefined;

  const [openFor, setOpenFor] = useState<string | null>(null);
  const [selectedTower, setSelectedTower] = useState<string | undefined>(addToTowerId);
  const [seededAt, setSeededAt] = useState<string>("");
  const [plantedAt, setPlantedAt] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Supabase data state
  const [plantCatalog, setPlantCatalog] = useState<PlantCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canonical = typeof window !== "undefined" ? `${window.location.origin}/app/catalog` : "/app/catalog";

  const towers = useMemo(() => state.towers, [state.towers]);

  // Fetch plant catalog from Supabase
  useEffect(() => {
    const fetchPlantCatalog = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user to fetch both global and user-specific plants
        const { data: { user } } = await supabase.auth.getUser();
        
        let query = supabase
          .from('plant_catalog')
          .select('id, name, description, germination_days, harvest_days, image_url, is_global, teacher_id, category')
          .order('name', { ascending: true });

        // Fetch global plants and user's custom plants
        if (user) {
          query = query.or(`is_global.eq.true,teacher_id.eq.${user.id}`);
        } else {
          query = query.eq('is_global', true);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        // Transform data to match component expectations
        const transformedData: PlantCatalogItem[] = (data || []).map(plant => ({
          id: plant.id,
          name: plant.name,
          category: plant.category || "Leafy Green", // Default to Leafy Green if null
          days: plant.harvest_days || undefined,
          description: plant.description || undefined,
          image_url: plant.image_url || undefined,
        }));

        setPlantCatalog(transformedData);
      } catch (err) {
        console.error('Error fetching plant catalog:', err);
        setError(err instanceof Error ? err.message : 'Failed to load plant catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchPlantCatalog();
  }, []);

  const onConfirm = (plantName: string) => {
    if (!selectedTower) return;
    dispatch({ 
      type: "ADD_PLANT", 
      payload: { 
        towerId: selectedTower, 
        plant: newPlant({ name: plantName, seededAt, plantedAt, quantity }) 
      } 
    });
    setOpenFor(null);
    setSeededAt("");
    setPlantedAt("");
    setQuantity(1);
    navigate(`/app/towers/${selectedTower}?tab=plants`);
  };

  if (loading) {
    return (
      <main className="space-y-6">
        <SEO title="Plant Catalog – Sproutify School" description="Browse the plant catalog and add plants to classroom towers." canonical={canonical} />
        
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Plant Catalog</h1>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-6">
        <SEO title="Plant Catalog – Sproutify School" description="Browse the plant catalog and add plants to classroom towers." canonical={canonical} />
        
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Plant Catalog</h1>
        </header>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <SEO title="Plant Catalog – Sproutify School" description="Browse the plant catalog and add plants to classroom towers." canonical={canonical} />

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plant Catalog</h1>
      </header>

      {plantCatalog.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No plants found in the catalog. Contact your administrator to add plants.
          </AlertDescription>
        </Alert>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plantCatalog.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.category}</span>
                </CardTitle>
                {p.description && (
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                )}
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {p.days ? `${p.days} days` : ""}
                </div>
                <Dialog open={openFor === p.id} onOpenChange={(o) => setOpenFor(o ? p.id : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm">Add to Tower</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add {p.name} to a tower</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <label className="text-sm">Select tower</label>
                      <Select value={selectedTower} onValueChange={setSelectedTower}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose tower" />
                        </SelectTrigger>
                        <SelectContent>
                          {towers.length === 0 && (
                            <SelectItem value="none" disabled>
                              No towers yet
                            </SelectItem>
                          )}
                          {towers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label>Seeded at</Label>
                        <Input type="date" value={seededAt} onChange={(e) => setSeededAt(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Planted at</Label>
                        <Input type="date" value={plantedAt} onChange={(e) => setPlantedAt(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input inputMode="numeric" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => { setOpenFor(null); setSeededAt(""); setPlantedAt(""); setQuantity(1); }}>Cancel</Button>
                      <Button onClick={() => onConfirm(p.name)} disabled={!selectedTower}>Add</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
