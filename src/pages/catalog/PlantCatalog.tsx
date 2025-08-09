import { useMemo, useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore, newPlant } from "@/context/AppStore";
import { useSearchParams, useNavigate } from "react-router-dom";

// Simple starter catalog (15 items)
const PLANT_CATALOG: { id: string; name: string; category: "Leafy Green" | "Herb"; days?: number }[] = [
  { id: "butterhead", name: "Butterhead Lettuce", category: "Leafy Green", days: 45 },
  { id: "romaine", name: "Romaine Lettuce", category: "Leafy Green", days: 55 },
  { id: "kale", name: "Kale", category: "Leafy Green", days: 60 },
  { id: "chard", name: "Swiss Chard", category: "Leafy Green", days: 50 },
  { id: "spinach", name: "Spinach", category: "Leafy Green", days: 40 },
  { id: "arugula", name: "Arugula", category: "Leafy Green", days: 35 },
  { id: "basil", name: "Basil", category: "Herb", days: 65 },
  { id: "mint", name: "Mint", category: "Herb", days: 60 },
  { id: "cilantro", name: "Cilantro", category: "Herb", days: 45 },
  { id: "parsley", name: "Parsley", category: "Herb", days: 75 },
  { id: "thyme", name: "Thyme", category: "Herb", days: 85 },
  { id: "oregano", name: "Oregano", category: "Herb", days: 80 },
  { id: "dill", name: "Dill", category: "Herb", days: 50 },
  { id: "green_onion", name: "Green Onion", category: "Leafy Green", days: 60 },
  { id: "watercress", name: "Watercress", category: "Leafy Green", days: 35 },
];

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

  const canonical = typeof window !== "undefined" ? `${window.location.origin}/app/catalog` : "/app/catalog";

  const towers = useMemo(() => state.towers, [state.towers]);

  const onConfirm = (plantName: string) => {
    if (!selectedTower) return;
    dispatch({ type: "ADD_PLANT", payload: { towerId: selectedTower, plant: newPlant({ name: plantName, seededAt, plantedAt, quantity }) } });
    setOpenFor(null);
    setSeededAt("");
    setPlantedAt("");
    setQuantity(1);
    navigate(`/app/towers/${selectedTower}?tab=plants`);
  };

  return (
    <main className="space-y-6">
      <SEO title="Plant Catalog – Sproutify School" description="Browse the plant catalog and add plants to classroom towers." canonical={canonical} />

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plant Catalog</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLANT_CATALOG.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.category}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {p.days ? `${p.days} days` : ""}
              </div>
              <Dialog open={openFor === p.id} onOpenChange={(o)=> setOpenFor(o ? p.id : null)}>
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
                        {towers.map((t)=> (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label>Seeded at</Label>
                      <Input type="date" value={seededAt} onChange={(e)=> setSeededAt(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Planted at</Label>
                      <Input type="date" value={plantedAt} onChange={(e)=> setPlantedAt(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input inputMode="numeric" value={quantity} onChange={(e)=> setQuantity(Number(e.target.value))} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={()=> { setOpenFor(null); setSeededAt(""); setPlantedAt(""); setQuantity(1); }}>Cancel</Button>
                    <Button onClick={()=> onConfirm(p.name)} disabled={!selectedTower}>Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
