// src/pages/catalog/PlantCatalog.tsx - Fixed to use React Query hooks
import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Globe, Settings, Plus, Leaf, Clock, Calendar } from "lucide-react";
import { useActiveClassroomPlants, usePlantStats } from "@/hooks/usePlantCatalog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function PlantCatalog() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const addToTowerId = params.get("addTo") || undefined;

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [selectedTower, setSelectedTower] = useState<string | undefined>(addToTowerId);
  const [seededAt, setSeededAt] = useState<string>("");
  const [plantedAt, setPlantedAt] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [towers, setTowers] = useState<{ id: string; name: string }[]>([]);
  const [towersLoading, setTowersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canonical = typeof window !== "undefined" ? `${window.location.origin}/app/catalog` : "/app/catalog";

  // Get current teacher ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setTeacherId(user?.id ?? null);
    });
  }, []);

  // Use our React Query hooks
  const { activePlants, isLoading, error } = useActiveClassroomPlants(teacherId);
  const { stats, isLoading: isStatsLoading } = usePlantStats(teacherId);

  // Fetch towers for the "Add to Tower" functionality
  useEffect(() => {
    const fetchTowers = async () => {
      try {
        setTowersLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("towers")
            .select("id, name")
            .eq("teacher_id", user.id)
            .order("name", { ascending: true });

          if (error) throw error;
          setTowers(data || []);
        }
      } catch (err) {
        console.error("Error fetching towers:", err);
        setTowers([]);
      } finally {
        setTowersLoading(false);
      }
    };

    fetchTowers();
  }, []);

  // Handle adding plant to tower
  const onConfirm = async (plantName: string, catalogId: string) => {
    if (!selectedTower) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to add plants.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.from("plantings").insert({
        tower_id: selectedTower,
        teacher_id: user.id,
        catalog_id: catalogId,
        name: plantName,
        quantity: quantity,
        seeded_at: seededAt || null,
        planted_at: plantedAt || null,
      });

      if (error) throw error;

      setOpenFor(null);
      setSeededAt("");
      setPlantedAt("");
      setQuantity(1);

      toast({
        title: "Plant Added",
        description: `${plantName} has been added to your tower.`
      });

      navigate(`/app/towers/${selectedTower}?tab=plants`);
    } catch (error) {
      console.error("Error adding plant:", error);
      toast({
        title: "Error",
        description: "Failed to add plant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!teacherId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access your plant catalog.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="space-y-6">
        <SEO
          title="Plant Catalog – Sproutify School"
          description="Browse your classroom plant catalog and add plants to towers."
          canonical={canonical}
        />
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Plant Catalog</h1>
        </header>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your plant catalog. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <SEO
        title="Plant Catalog – Sproutify School"
        description="Browse your classroom plant catalog and add plants to towers."
        canonical={canonical}
      />
      
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            My Plant Catalog
          </h1>
          <p className="text-muted-foreground">Plants available for your classroom towers</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/app/catalog/global">
              <Globe className="h-4 w-4 mr-2" />
              Browse Global
            </Link>
          </Button>
          <Button asChild>
            <Link to="/app/catalog/manage">
              <Settings className="h-4 w-4 mr-2" />
              Manage Plants
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && !isStatsLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xl font-bold">{stats.activePlants}</p>
                  <p className="text-xs text-muted-foreground">Active Plants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xl font-bold">{stats.globalPlants}</p>
                  <p className="text-xs text-muted-foreground">From Global</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xl font-bold">{stats.customPlants}</p>
                  <p className="text-xs text-muted-foreground">Custom Plants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plants Grid */}
      {isLoading ? (
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
      ) : activePlants.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No active plants in your catalog</h3>
            <p className="text-muted-foreground mb-6">
              Get started by adding plants from our global catalog or creating your own custom varieties.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link to="/app/catalog/global">
                  <Globe className="h-4 w-4 mr-2" />
                  Browse Global Catalog
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/app/catalog/manage">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Plant
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activePlants.map((plant) => (
            <Card key={plant.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{plant.name}</span>
                  {plant.category && (
                    <Badge variant="outline" className="text-xs">
                      {plant.category}
                    </Badge>
                  )}
                </CardTitle>
                {plant.description && (
                  <p className="text-xs text-muted-foreground">{plant.description}</p>
                )}
              </CardHeader>
              <CardContent>
                {/* Growing Info */}
                {(plant.germination_days || plant.harvest_days) && (
                  <div className="flex gap-3 mb-4 text-sm text-muted-foreground">
                    {plant.germination_days && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Germination: {plant.germination_days}d
                      </div>
                    )}
                    {plant.harvest_days && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Harvest: {plant.harvest_days}d
                      </div>
                    )}
                  </div>
                )}

                {/* Add to Tower Button */}
                <Dialog open={openFor === plant.id} onOpenChange={(o) => setOpenFor(o ? plant.id : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full">Add to Tower</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add {plant.name} to a tower</DialogTitle>
                      <DialogDescription>
                        Choose a tower and planting details for this plant.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select tower</Label>
                        <Select value={selectedTower} onValueChange={setSelectedTower}>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={towersLoading ? "Loading towers..." : "Choose tower"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {towersLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading towers...
                              </SelectItem>
                            ) : towers.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No towers yet
                              </SelectItem>
                            ) : (
                              towers.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Seeded at</Label>
                          <Input
                            type="date"
                            value={seededAt}
                            onChange={(e) => setSeededAt(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Planted at</Label>
                          <Input
                            type="date"
                            value={plantedAt}
                            onChange={(e) => setPlantedAt(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOpenFor(null);
                          setSeededAt("");
                          setPlantedAt("");
                          setQuantity(1);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => onConfirm(plant.name, plant.id)} 
                        disabled={!selectedTower || submitting}
                      >
                        {submitting ? "Adding..." : "Add to Tower"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Help Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Leaf className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Your Classroom Plant Catalog</h4>
              <p className="text-sm text-muted-foreground mb-3">
                This shows only the <strong>active plants</strong> in your classroom catalog - the ones students can select when logging activities.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/catalog/global">
                    <Globe className="h-4 w-4 mr-2" />
                    Add More Plants
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/catalog/manage">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Catalog
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}