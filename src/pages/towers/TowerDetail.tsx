// Complete TowerDetail.tsx with Enhanced PlantsTab and Scouting
import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/context/AppStore";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Leaf, Sun, Calendar, Clock, MapPin, AlertTriangle, CheckCircle, Plus, Edit, Trash2, Globe, Loader2 } from "lucide-react";

// Import existing components
import { TowerVitalsForm } from "@/components/towers/TowerVitalsForm";
import { TowerHarvestForm } from "@/components/towers/TowerHarvestForm";
import { TowerWasteForm } from "@/components/towers/TowerWasteForm";
import { TowerPhotosTab } from "@/components/towers/TowerPhotosTab";
import { TowerHistory } from "@/components/towers/TowerHistory";

// Import enhanced scouting components
import { EnhancedScoutingForm } from "@/components/scouting/EnhancedScoutingForm";

interface Tower {
  id: string;
  name: string;
  ports: number;
  location?: 'indoor' | 'greenhouse' | 'outdoor';
  created_at: string;
  updated_at: string;
  teacher_id: string;
}

type PlantingWithCatalog = {
  id: string;
  name: string;
  quantity: number;
  port_number?: number;
  seeded_at?: string;
  planted_at?: string;
  expected_harvest_date?: string;
  growth_rate?: string;
  outcome?: string;
  status: string;
  created_at: string;
  catalog_id?: string;
  plant_catalog?: {
    id: string;
    name: string;
    category?: string;
    harvest_days?: number;
    germination_days?: number;
    description?: string;
    is_global?: boolean;
  };
};

export default function TowerDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { state } = useAppStore();
  
  // Debug logging
  console.log("TowerDetail - ID:", id);
  console.log("TowerDetail - AppStore state:", state);
  
  const [tower, setTower] = useState<Tower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const initialTab = searchParams.get("tab") || "vitals";

  // Enhanced authentication handling
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null;
      console.log("Auth state changed - User ID:", userId);
      setTeacherId(userId);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id ?? null;
      console.log("Initial session - User ID:", userId);
      setTeacherId(userId);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Effect triggered - ID:", id, "Teacher ID:", teacherId);
    if (id && teacherId) {
      fetchTower();
    }
  }, [id, teacherId]);

  const fetchTower = async () => {
    if (!id || !teacherId) {
      console.log("Missing ID or teacherId:", { id, teacherId });
      return;
    }

    console.log("Fetching tower with ID:", id, "Teacher ID:", teacherId);
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("towers")
        .select("*")
        .eq("id", id)
        .eq("teacher_id", teacherId)
        .single();

      console.log("Tower fetch result:", { data, error: fetchError });

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError("Tower not found or you do not have permission to view it.");
        } else {
          console.error("Supabase error:", fetchError);
          throw fetchError;
        }
        return;
      }

      setTower(data);
    } catch (error: any) {
      console.error("Error fetching tower:", error);
      setError("Failed to load tower details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    fetchTower();
  };

  const getLocationIcon = (location?: string) => {
    switch (location) {
      case 'greenhouse':
        return <Leaf className="h-4 w-4 text-green-600" />;
      case 'outdoor':
        return <Sun className="h-4 w-4 text-yellow-600" />;
      case 'indoor':
      default:
        return <Building className="h-4 w-4 text-blue-600" />;
    }
  };

  const getLocationLabel = (location?: string) => {
    switch (location) {
      case 'greenhouse':
        return 'Greenhouse';
      case 'outdoor':
        return 'Outdoor';
      case 'indoor':
      default:
        return 'Indoor';
    }
  };

  console.log("Render state:", { loading, error, tower, teacherId });

  if (loading) {
    return (
      <div className="container py-8 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !tower) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Tower not found or you do not have permission to view it."} Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${tower.name} - Tower Details`}
        description={`Monitor vitals, plants, and observations for ${tower.name}. Track pH, EC, lighting, and manage your hydroponic tower garden.`}
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{tower.name}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-2">
              {getLocationIcon(tower.location)}
              {getLocationLabel(tower.location)}
            </Badge>
            <div className="text-sm text-muted-foreground">{tower.ports} ports</div>
          </div>
        </div>
        
        <Tabs defaultValue={initialTab}>
          <TabsList>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="plants">Plants</TabsTrigger>
            <TabsTrigger value="scouting">Scouting</TabsTrigger>
            <TabsTrigger value="harvests">Harvests</TabsTrigger>
            <TabsTrigger value="waste">Waste</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vitals" className="mt-4">
            <TowerVitalsForm 
              towerId={tower.id} 
              teacherId={teacherId} 
              onVitalsSaved={refreshData} 
            />
          </TabsContent>
          
          <TabsContent value="plants" className="mt-4">
            <PlantsTab towerId={tower.id} teacherId={teacherId} refreshKey={refreshKey} />
          </TabsContent>
          
          <TabsContent value="scouting" className="mt-4">
            <ScoutingTab 
              towerId={tower.id} 
              teacherId={teacherId} 
              towerLocation={tower.location || 'indoor'}
              onScoutingSaved={refreshData}
            />
          </TabsContent>
          
          <TabsContent value="harvests" className="mt-4">
            <TowerHarvestForm
              towerId={tower.id}
              teacherId={teacherId}
              onHarvested={refreshData}
            />
          </TabsContent>
          
          <TabsContent value="waste" className="mt-4">
            <TowerWasteForm
              towerId={tower.id}
              teacherId={teacherId}
              onWasteLogged={refreshData}
            />
          </TabsContent>
          
          <TabsContent value="photos" className="mt-4">
            <TowerPhotosTab towerId={tower.id} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <TowerHistory towerId={tower.id} teacherId={teacherId} refreshKey={refreshKey} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// Enhanced Scouting Tab Component
interface ScoutingTabProps {
  towerId: string;
  teacherId: string;
  towerLocation: 'indoor' | 'greenhouse' | 'outdoor';
  onScoutingSaved: () => void;
}

function ScoutingTab({ towerId, teacherId, towerLocation, onScoutingSaved }: ScoutingTabProps) {
  const [activeEntries, setActiveEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveEntries();
  }, [towerId, teacherId]);

  const loadActiveEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('pest_logs')
        .select(`
          *,
          pest_catalog(name, type)
        `)
        .eq('tower_id', towerId)
        .eq('teacher_id', teacherId)
        .eq('resolved', false)
        .order('observed_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setActiveEntries(data || []);
    } catch (error) {
      console.error('Error loading active scouting entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoutingSaved = () => {
    loadActiveEntries();
    onScoutingSaved();
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Scouting Entry Form */}
      <EnhancedScoutingForm
        towerId={towerId}
        teacherId={teacherId}
        towerLocation={towerLocation}
        onScoutingSaved={handleScoutingSaved}
      />

      {/* Active Scouting Entries */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Recent Observations for This Tower</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : activeEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active observations for this tower.</p>
          ) : (
            <div className="space-y-4">
              {activeEntries.map((entry) => (
                <div key={entry.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{entry.pest}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.observed_at).toLocaleDateString()}
                      </div>
                      {entry.notes && (
                        <div className="text-sm mt-1 line-clamp-2">{entry.notes}</div>
                      )}
                    </div>
                    {entry.follow_up_needed && (
                      <Badge variant="outline" className="text-yellow-600">
                        Follow-up needed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced Plants Tab Component
interface PlantsTabProps {
  towerId: string;
  teacherId: string;
  refreshKey: number;
}

function PlantsTab({ towerId, teacherId, refreshKey }: PlantsTabProps) {
  const { toast } = useToast();
  const [plantings, setPlantings] = useState<PlantingWithCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state for manual plant addition
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [seededAt, setSeededAt] = useState("");
  const [plantedAt, setPlantedAt] = useState("");
  const [growthRate, setGrowthRate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [outcome, setOutcome] = useState("");
  const [portNumber, setPortNumber] = useState<number | undefined>();

  useEffect(() => {
    const fetchPlantings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('plantings')
          .select(`
            *,
            plant_catalog (
              id,
              name,
              category,
              harvest_days,
              germination_days,
              description,
              is_global
            )
          `)
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPlantings(data || []);
      } catch (error) {
        console.error('Error fetching plantings:', error);
        toast({ 
          title: "Error loading plants", 
          description: "Failed to load plantings data.", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPlantings();
  }, [towerId, teacherId, toast, refreshKey]);

  const addPlanting = async () => {
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('plantings')
        .insert({
          tower_id: towerId,
          teacher_id: teacherId,
          name: name.trim(),
          quantity,
          seeded_at: seededAt || null,
          planted_at: plantedAt || null,
          growth_rate: growthRate || null,
          expected_harvest_date: harvestDate || null,
          outcome: outcome || null,
          port_number: portNumber || null,
        })
        .select()
        .single();

      if (error) throw error;
      setPlantings(prev => [data, ...prev]);
      
      // Reset form
      setName(""); setQuantity(1); setSeededAt(""); setPlantedAt("");
      setGrowthRate(""); setHarvestDate(""); setOutcome(""); setPortNumber(undefined);
      
      toast({ 
        title: "Plant added", 
        description: "Plant has been added to the tower successfully." 
      });
    } catch (error) {
      console.error('Error adding planting:', error);
      toast({ 
        title: "Error adding plant", 
        description: "Failed to add plant. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getHarvestStatus = (expectedDate?: string) => {
    if (!expectedDate) {
      return { status: 'unknown', daysRemaining: null, color: 'default' };
    }

    const today = new Date();
    const harvest = new Date(expectedDate);
    const diffTime = harvest.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { 
        status: 'overdue', 
        daysRemaining: Math.abs(daysRemaining), 
        color: 'destructive' as const
      };
    } else if (daysRemaining === 0) {
      return { 
        status: 'today', 
        daysRemaining: 0, 
        color: 'default' as const
      };
    } else if (daysRemaining <= 7) {
      return { 
        status: 'soon', 
        daysRemaining, 
        color: 'secondary' as const
      };
    } else {
      return { 
        status: 'upcoming', 
        daysRemaining, 
        color: 'outline' as const
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'today': return <CheckCircle className="h-4 w-4" />;
      case 'soon': return <Clock className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string, daysRemaining: number | null) => {
    switch (status) {
      case 'overdue': return `${daysRemaining} days overdue`;
      case 'today': return 'Ready today!';
      case 'soon': return `${daysRemaining} days left`;
      case 'upcoming': return `${daysRemaining} days to harvest`;
      default: return 'No harvest date';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Plant Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Plant Manually
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to={`/app/catalog?addTo=${towerId}`}>
                <Leaf className="h-4 w-4 mr-2" />
                Add from Catalog
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Plant Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Lettuce" 
            />
          </div>
          <div className="space-y-2">
            <Label>Port Number</Label>
            <Input 
              type="number"
              min="1" 
              max="32"
              value={portNumber ?? ""} 
              onChange={(e) => setPortNumber(Number(e.target.value) || undefined)} 
              placeholder="1-32" 
            />
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input 
              type="number"
              min="1"
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} 
            />
          </div>
          <div className="space-y-2">
            <Label>Seeded Date</Label>
            <Input 
              type="date" 
              value={seededAt} 
              onChange={(e) => setSeededAt(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>Planted Date</Label>
            <Input 
              type="date" 
              value={plantedAt} 
              onChange={(e) => setPlantedAt(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>Expected Harvest</Label>
            <Input 
              type="date" 
              value={harvestDate} 
              onChange={(e) => setHarvestDate(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>Growth Rate</Label>
            <Input 
              value={growthRate} 
              onChange={(e) => setGrowthRate(e.target.value)} 
              placeholder="e.g., 2cm/week" 
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Expected Outcome</Label>
            <Input 
              value={outcome} 
              onChange={(e) => setOutcome(e.target.value)} 
              placeholder="Eaten in class, donated, etc" 
            />
          </div>
          <div className="md:col-span-3">
            <Button onClick={addPlanting} disabled={submitting || !name.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plant
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plants List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Tower Plants ({plantings.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {plantings.length === 0 ? (
            <div className="text-center py-8">
              <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No plants added to this tower yet.</p>
              <Button asChild>
                <Link to={`/app/catalog?addTo=${towerId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Plant
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {plantings.map((plant) => {
                const harvestInfo = getHarvestStatus(plant.expected_harvest_date);

                return (
                  <Card key={plant.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-lg">{plant.name}</h4>
                          {plant.plant_catalog && (
                            <div className="flex gap-1">
                              {plant.plant_catalog.category && (
                                <Badge variant="outline" className="text-xs">
                                  {plant.plant_catalog.category}
                                </Badge>
                              )}
                              {plant.plant_catalog.is_global && (
                                <Badge variant="secondary" className="text-xs">
                                  <Globe className="h-3 w-3 mr-1" />
                                  Global
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {plant.plant_catalog?.description && (
                          <p className="text-sm text-muted-foreground">
                            {plant.plant_catalog.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              <span className="text-muted-foreground">Port:</span>{" "}
                              {plant.port_number || "Not set"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Qty:</span>
                            <span>{plant.quantity}</span>
                          </div>
                          {plant.seeded_at && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Seeded:</span>
                              <span>{new Date(plant.seeded_at).toLocaleDateString()}</span>
                            </div>
                          )}
                          {plant.planted_at && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Planted:</span>
                              <span>{new Date(plant.planted_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {plant.expected_harvest_date && (
                          <Alert className={`border-l-4 ${
                            harvestInfo.status === 'overdue' ? 'border-l-red-500 bg-red-50' :
                            harvestInfo.status === 'today' ? 'border-l-green-500 bg-green-50' :
                            harvestInfo.status === 'soon' ? 'border-l-yellow-500 bg-yellow-50' :
                            'border-l-blue-500 bg-blue-50'
                          }`}>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(harvestInfo.status)}
                              <div>
                                <p className="font-medium">
                                  {getStatusText(harvestInfo.status, harvestInfo.daysRemaining)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Expected harvest: {new Date(plant.expected_harvest_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </Alert>
                        )}

                        {(plant.growth_rate || plant.outcome) && (
                          <div className="grid md:grid-cols-2 gap-4 text-sm pt-2 border-t">
                            {plant.growth_rate && (
                              <div>
                                <span className="text-muted-foreground">Growth Rate:</span>{" "}
                                {plant.growth_rate}
                              </div>
                            )}
                            {plant.outcome && (
                              <div>
                                <span className="text-muted-foreground">Outcome:</span>{" "}
                                {plant.outcome}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}