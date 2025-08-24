// src/pages/catalog/PlantCatalog.tsx - Complete Enhanced Version
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
import { AlertCircle, Globe, Settings, Plus, Leaf, Clock, Calendar, MapPin } from "lucide-react";
import { useActiveClassroomPlants, usePlantStats } from "@/hooks/usePlantCatalog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PlantType = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  germination_days?: number;
  harvest_days?: number;
  image_url?: string;
  is_global?: boolean;
};

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
  const [expectedHarvestDate, setExpectedHarvestDate] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [portNumber, setPortNumber] = useState<number | undefined>();
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

  // Auto-calculate expected harvest date when seeded date and harvest days are available
  const calculateExpectedHarvest = (seededDate: string, harvestDays?: number) => {
    if (!seededDate || !harvestDays) return "";
    
    const seeded = new Date(seededDate);
    const harvest = new Date(seeded.getTime() + (harvestDays * 24 * 60 * 60 * 1000));
    return harvest.toISOString().split('T')[0];
  };

  // Update expected harvest when seeded date changes
  const handleSeededAtChange = (value: string, plant: PlantType) => {
    setSeededAt(value);
    if (value && plant.harvest_days) {
      const expectedDate = calculateExpectedHarvest(value, plant.harvest_days);
      setExpectedHarvestDate(expectedDate);
    } else {
      setExpectedHarvestDate("");
    }
  };

  // Handle adding plant to tower
  const onConfirm = async (plant: PlantType) => {
    if (!selectedTower) {
      toast({
        title: "Tower Required",
        description: "Please select a tower first.",
        variant: "destructive"
      });
      return;
    }

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

      // Prepare the planting data
      const plantingData = {
        tower_id: selectedTower,
        teacher_id: user.id,
        catalog_id: plant.id,
        name: plant.name,
        quantity: quantity,
        seeded_at: seededAt || null,
        planted_at: plantedAt || null,
        expected_harvest_date: expectedHarvestDate || null,
        port_number: portNumber || null,
      };

      const { error } = await supabase.from("plantings").insert(plantingData);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Reset form state
      setOpenFor(null);
      setSeededAt("");
      setPlantedAt("");
      setExpectedHarvestDate("");
      setQuantity(1);
      setPortNumber(undefined);

      toast({
        title: "Plant Added Successfully",
        description: `${plant.name} has been added to your tower${portNumber ? ` at port ${portNumber}` : ""}.`
      });

      // Navigate to tower with plants tab selected
      navigate(`/app/towers/${selectedTower}?tab=plants`);
    } catch (error: any) {
      console.error("Error adding plant:", error);
      
      // More specific error handling
      let errorMessage = "Failed to add plant. Please try again.";
      if (error.message?.includes("foreign key")) {
        errorMessage = "Invalid tower selected. Please refresh and try again.";
      } else if (error.message?.includes("duplicate")) {
        errorMessage = "This plant may already exist at this port number.";
      }

      toast({
        title: "Error Adding Plant",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form when dialog closes
  const handleDialogClose = (open: boolean, plantId: string) => {
    setOpenFor(open ? plantId : null);
    if (!open) {
      setSeededAt("");
      setPlantedAt("");
      setExpectedHarvestDate("");
      setQuantity(1);
      setPortNumber(undefined);
      setSelectedTower(addToTowerId); // Reset to URL param if available
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
                  <div className="flex gap-1">
                    {plant.category && (
                      <Badge variant="outline" className="text-xs">
                        {plant.category}
                      </Badge>
                    )}
                    {plant.is_global && (
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        Global
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                {plant.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{plant.description}</p>
                )}
              </CardHeader>
              <CardContent>
                {/* Growing Info */}
                {(plant.germination_days || plant.harvest_days) && (
                  <div className="flex gap-3 mb-4 text-sm text-muted-foreground">
                    {plant.germination_days && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{plant.germination_days}d germination</span>
                      </div>
                    )}
                    {plant.harvest_days && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{plant.harvest_days}d harvest</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Add to Tower Button */}
                <Dialog 
                  open={openFor === plant.id} 
                  onOpenChange={(open) => handleDialogClose(open, plant.id)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full">
                      Add to Tower
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add {plant.name} to Tower</DialogTitle>
                      <DialogDescription>
                        Configure the planting details for this {plant.category?.toLowerCase() || 'plant'}.
                        {plant.harvest_days && " Expected harvest will be calculated automatically."}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {/* Tower Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="tower-select">Select Tower</Label>
                        <Select 
                          value={selectedTower} 
                          onValueChange={setSelectedTower}
                        >
                          <SelectTrigger id="tower-select">
                            <SelectValue
                              placeholder={towersLoading ? "Loading towers..." : "Choose a tower"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {towersLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading towers...
                              </SelectItem>
                            ) : towers.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No towers available
                              </SelectItem>
                            ) : (
                              towers.map((tower) => (
                                <SelectItem key={tower.id} value={tower.id}>
                                  {tower.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Quantity and Port */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max="50"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="port">Port # (Optional)</Label>
                          <Input
                            id="port"
                            type="number"
                            min="1"
                            max="32"
                            value={portNumber || ""}
                            onChange={(e) => setPortNumber(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="1-32"
                          />
                        </div>
                      </div>
                      
                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="seeded">Seeded Date</Label>
                          <Input
                            id="seeded"
                            type="date"
                            value={seededAt}
                            onChange={(e) => handleSeededAtChange(e.target.value, plant)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="planted">Planted Date</Label>
                          <Input
                            id="planted"
                            type="date"
                            value={plantedAt}
                            onChange={(e) => setPlantedAt(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Expected Harvest (Auto-calculated) */}
                      {expectedHarvestDate && (
                        <div className="space-y-2">
                          <Label htmlFor="expected">Expected Harvest (Auto-calculated)</Label>
                          <Input
                            id="expected"
                            type="date"
                            value={expectedHarvestDate}
                            onChange={(e) => setExpectedHarvestDate(e.target.value)}
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            Based on {plant.harvest_days} day growing period
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => handleDialogClose(false, plant.id)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => onConfirm(plant)} 
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
                Plants marked as "Global" are available to all teachers.
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