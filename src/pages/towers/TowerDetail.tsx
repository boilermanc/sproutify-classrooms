import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import TowerPhotosTab from "./TowerPhotosTab";
import { ColorNumberInput } from "@/components/ui/color-number-input";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TowerHarvestForm from "@/pages/towers/TowerHarvestForm";
import TowerWasteForm from "@/pages/towers/TowerWasteForm"; // 1. IMPORT new component

type Tower = {
  id: string;
  name: string;
  ports: number;
  teacher_id: string;
};

type Planting = {
  id: string;
  name: string;
  quantity: number;
  seeded_at: string | null;
  planted_at: string | null;
  growth_rate: string | null;
  expected_harvest_date: string | null;
  outcome: string | null;
  port_number: number | null;
  status: string;
};

export default function TowerDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [tower, setTower] = useState<Tower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ph, setPh] = useState<number | undefined>();
  const [ec, setEc] = useState<number | undefined>();
  const [light, setLight] = useState<number | undefined>();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "vitals";

  const [refreshKey, setRefreshKey] = useState(0);
  const refreshData = () => setRefreshKey(key => key + 1);

  // Fetch tower data
  useEffect(() => {
    const fetchTower = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Authentication required");
        }
        const { data: towerData, error: fetchError } = await supabase
          .from('towers')
          .select('id, name, ports, teacher_id')
          .eq('id', id)
          .eq('teacher_id', user.id)
          .single();
        if (fetchError) {
          throw fetchError;
        }
        setTower(towerData);
      } catch (err) {
        console.error('Error fetching tower:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tower');
      } finally {
        setLoading(false);
      }
    };
    fetchTower();
  }, [id]);

  const saveVitals = async () => {
    if (!tower || !id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication required", description: "Please log in to save tower vitals.", variant: "destructive" });
        return;
      }
      const { error } = await supabase.from('tower_vitals').insert({
        tower_id: id,
        teacher_id: user.id,
        ph: ph || null,
        ec: ec || null,
        light_lux: light ? Math.round(light * 1000) : null
      });
      if (error) throw error;
      toast({ title: "Vitals saved", description: "Tower vitals have been recorded successfully." });
      // Clear the form
      setPh(undefined);
      setEc(undefined);
      setLight(undefined);
    } catch (error) {
      console.error('Error saving vitals:', error);
      toast({ title: "Error saving vitals", description: "Failed to save tower vitals. Please try again.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !tower) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Tower not found"}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const towerId = tower.id;
  const teacherId = tower.teacher_id;

  return (
    <>
      <SEO
        title={`${tower.name} - Tower Details`}
        description={`Monitor vitals, plants, and harvests for ${tower.name}. Track pH, EC, lighting, and manage your hydroponic tower garden.`}
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{tower.name}</h1>
          <div className="text-sm text-muted-foreground">{tower.ports} ports</div>
        </div>
        <Tabs defaultValue={initialTab}>
          <TabsList>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="plants">Plants</TabsTrigger>
            <TabsTrigger value="pests">Pests</TabsTrigger>
            <TabsTrigger value="harvests">Harvests</TabsTrigger>
            <TabsTrigger value="waste">Waste</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="vitals" className="mt-4">
            <Card>
              <CardHeader><CardTitle>pH / EC / Lighting</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <ColorNumberInput type="ph" label="pH" value={ph} onChange={setPh} placeholder="e.g. 6.5" />
                <ColorNumberInput type="ec" label="EC (mS/cm)" value={ec} onChange={setEc} placeholder="e.g. 1.6" />
                <div className="space-y-2">
                  <Label>Light hours/day</Label>
                  <Input inputMode="numeric" value={light ?? ""} onChange={(e) => setLight(Number(e.target.value))} placeholder="e.g. 12" />
                </div>
                <div className="md:col-span-3">
                  <Button onClick={saveVitals}> Save vitals </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="plants" className="mt-4">
            <PlantsTab towerId={tower.id} refreshKey={refreshKey} />
          </TabsContent>
          <TabsContent value="pests" className="mt-4">
            <PestsTab towerId={tower.id} />
          </TabsContent>
          <TabsContent value="harvests" className="mt-4">
            <TowerHarvestForm
              towerId={towerId}
              teacherId={teacherId}
              onHarvested={refreshData}
            />
          </TabsContent>
          <TabsContent value="waste" className="mt-4">
            {/* 3. REPLACE old tab with new component */}
            <TowerWasteForm
              towerId={towerId}
              teacherId={teacherId}
              onWasteLogged={refreshData}
            />
          </TabsContent>
          <TabsContent value="photos" className="mt-4">
            <TowerPhotosTab towerId={tower.id} />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <HistoryTab towerId={tower.id} refreshKey={refreshKey} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function PlantsTab({ towerId, refreshKey }: { towerId: string; refreshKey: number }) {
  const { toast } = useToast();
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [seededAt, setSeededAt] = useState("");
  const [plantedAt, setPlantedAt] = useState("");
  const [growthRate, setGrowthRate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [outcome, setOutcome] = useState("");
  const [portNumber, setPortNumber] = useState<number | undefined>();

  // Fetch plantings
  useEffect(() => {
    const fetchPlantings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('plantings')
          .select('*')
          .eq('tower_id', towerId)
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPlantings(data || []);
      } catch (error) {
        console.error('Error fetching plantings:', error);
        toast({ title: "Error loading plants", description: "Failed to load plantings data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPlantings();
  }, [towerId, toast, refreshKey]);

  const addPlanting = async () => {
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication required", description: "Please log in to add plants.", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase
        .from('plantings')
        .insert({
          tower_id: towerId,
          teacher_id: user.id,
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
      // Clear form
      setName("");
      setQuantity(1);
      setSeededAt("");
      setPlantedAt("");
      setGrowthRate("");
      setHarvestDate("");
      setOutcome("");
      setPortNumber(undefined);
      toast({ title: "Plant added", description: "Plant has been added to the tower successfully." });
    } catch (error) {
      console.error('Error adding planting:', error);
      toast({ title: "Error adding plant", description: "Failed to add plant. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add Plant</CardTitle>
            <Button asChild variant="link" size="sm">
              <Link to={`/app/catalog?addTo=${towerId}`}>Add from catalog</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lettuce" />
          </div>
          <div className="space-y-2">
            <Label>Port number</Label>
            <Input inputMode="numeric" value={portNumber ?? ""} onChange={(e) => setPortNumber(Number(e.target.value) || undefined)} placeholder="1-32" />
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input inputMode="numeric" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Seeded at</Label>
            <Input type="date" value={seededAt} onChange={(e) => setSeededAt(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Planted at</Label>
            <Input type="date" value={plantedAt} onChange={(e) => setPlantedAt(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Expected harvest</Label>
            <Input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Growth rate</Label>
            <Input value={growthRate} onChange={(e) => setGrowthRate(e.target.value)} placeholder="e.g. 2cm/week" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Outcome</Label>
            <Input value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="Eaten in class, donated, etc" />
          </div>
          <div className="md:col-span-3">
            <Button onClick={addPlanting} disabled={submitting || !name.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add plant"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Plants</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plantings.length === 0 && <div className="text-sm text-muted-foreground">No plants yet.</div>}
            {plantings.map((p) => (
              <div key={p.id} className="grid md:grid-cols-8 gap-2 p-3 border rounded-md">
                <div><span className="text-xs text-muted-foreground">Name</span><div>{p.name}</div></div>
                <div><span className="text-xs text-muted-foreground">Port</span><div>{p.port_number ?? "-"}</div></div>
                <div><span className="text-xs text-muted-foreground">Qty</span><div>{p.quantity}</div></div>
                <div><span className="text-xs text-muted-foreground">Seeded</span><div>{p.seeded_at ?? "-"}</div></div>
                <div><span className="text-xs text-muted-foreground">Planted</span><div>{p.planted_at ?? "-"}</div></div>
                <div><span className="text-xs text-muted-foreground">Harvest</span><div>{p.expected_harvest_date ?? "-"}</div></div>
                <div><span className="text-xs text-muted-foreground">Growth</span><div>{p.growth_rate ?? "-"}</div></div>
                <div><span className="text-xs text-muted-foreground">Outcome</span><div>{p.outcome ?? "-"}</div></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PestsTab({ towerId }: { towerId: string }) {
  const { toast } = useToast();
  const [pestLogs, setPestLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pest, setPest] = useState("");
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchPestLogs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('pest_logs')
          .select('*')
          .eq('tower_id', towerId)
          .eq('teacher_id', user.id)
          .order('observed_at', { ascending: false });
        if (error) throw error;
        setPestLogs(data || []);
      } catch (error) {
        console.error('Error fetching pest logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPestLogs();
  }, [towerId]);

  const addPestLog = async () => {
    if (!pest.trim()) return;
    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('pest_logs')
        .insert({
          tower_id: towerId,
          teacher_id: user.id,
          pest: pest.trim(),
          action: action || null,
          notes: notes || null,
        })
        .select()
        .single();
      if (error) throw error;
      setPestLogs(prev => [data, ...prev]);
      setPest("");
      setAction("");
      setNotes("");
      toast({ title: "Pest log added", description: "Pest observation has been recorded successfully." });
    } catch (error) {
      console.error('Error adding pest log:', error);
      toast({ title: "Error adding pest log", description: "Failed to add pest log. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Log pest/scouting</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Pest/Observation</Label>
            <Textarea value={pest} onChange={(e) => setPest(e.target.value)} placeholder="Aphids on row 2" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Action</Label>
            <Textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="Released ladybugs" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes" />
          </div>
          <div className="md:col-span-2">
            <Button onClick={addPestLog} disabled={submitting || !pest.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save entry"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pestLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No entries yet.</div>
          ) : (
            pestLogs.map((p) => (
              <div key={p.id} className="p-3 border rounded-md">
                <div className="text-xs text-muted-foreground">{new Date(p.observed_at).toLocaleString()}</div>
                <div className="font-medium">{p.pest}</div>
                {p.action && <div className="text-sm">Action: {p.action}</div>}
                {p.notes && <div className="text-sm text-muted-foreground">{p.notes}</div>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 2. REMOVE the entire `WasteTab` function from here.

function HistoryTab({ towerId, refreshKey }: { towerId: string; refreshKey: number }) {
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [harvestsData, setHarvestsData] = useState<any[]>([]);
  const [wasteData, setWasteData] = useState<any[]>([]); // Add state for waste data
  const [pestsData, setPestsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all data concurrently
        const [vitals, harvests, waste, pests] = await Promise.all([
          supabase.from('tower_vitals').select('*').eq('tower_id', towerId).eq('teacher_id', user.id).order('recorded_at', { ascending: false }).limit(50),
          supabase.from('harvests').select('*').eq('tower_id', towerId).eq('teacher_id', user.id).order('harvested_at', { ascending: false }).limit(50),
          supabase.from('waste_logs').select('*').eq('tower_id', towerId).eq('teacher_id', user.id).order('logged_at', { ascending: false }).limit(50),
          supabase.from('pest_logs').select('*').eq('tower_id', towerId).eq('teacher_id', user.id).order('observed_at', { ascending: false }).limit(50),
        ]);
        
        setVitalsData(vitals.data || []);
        setHarvestsData(harvests.data || []);
        setWasteData(waste.data || []);
        setPestsData(pests.data || []);

      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoricalData();
  }, [towerId, refreshKey]); // 5. Add refreshKey to dependency array

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading historical data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vitals History */}
      <Card>
        <CardHeader><CardTitle>Vitals History</CardTitle></CardHeader>
        <CardContent>
          {vitalsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No vitals data recorded yet.</div>
          ) : ( /* ... Vitals map ... */ )}
        </CardContent>
      </Card>

      {/* Harvests History */}
      <Card>
        <CardHeader><CardTitle>Harvest History</CardTitle></CardHeader>
        <CardContent>
          {harvestsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No harvests recorded yet.</div>
          ) : ( /* ... Harvests map ... */ )}
        </CardContent>
      </Card>

      {/* Waste History */}
      <Card>
        <CardHeader><CardTitle>Waste History</CardTitle></CardHeader>
        <CardContent>
          {wasteData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No waste recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {wasteData.map((waste) => (
                <div key={waste.id} className="grid grid-cols-4 gap-4 p-3 border rounded-md">
                  <div> <div className="text-xs text-muted-foreground">Date</div> <div>{waste.logged_at}</div> </div>
                  <div> <div className="text-xs text-muted-foreground">Plant</div> <div>{waste.plant_name || "-"}</div> </div>
                  <div> <div className="text-xs text-muted-foreground">Weight</div> <div>{waste.grams} g</div> </div>
                  <div> <div className="text-xs text-muted-foreground">Notes</div> <div>{waste.notes || "-"}</div> </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pest Logs History */}
      <Card>
        <CardHeader><CardTitle>Pest Log History</CardTitle></CardHeader>
        <CardContent>
          {pestsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pest observations recorded yet.</div>
          ) : ( /* ... Pests map ... */ )}
        </CardContent>
      </Card>
    </div>
  );
}
