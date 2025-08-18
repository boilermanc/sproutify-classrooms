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
        toast({
          title: "Authentication required",
          description: "Please log in to save tower vitals.",
          variant: "destructive"
        });
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
      
      toast({
        title: "Vitals saved",
        description: "Tower vitals have been recorded successfully."
      });

      // Clear the form
      setPh(undefined);
      setEc(undefined);
      setLight(undefined);
      
    } catch (error) {
      console.error('Error saving vitals:', error);
      toast({
        title: "Error saving vitals",
        description: "Failed to save tower vitals. Please try again.",
        variant: "destructive"
      });
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

  return (
    <>
      <SEO 
        title={${tower.name} - Tower Details}
        description={Monitor vitals, plants, and harvests for ${tower.name}. Track pH, EC, lighting, and manage your hydroponic tower garden.}
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
                <ColorNumberInput
                  type="ph"
                  label="pH"
                  value={ph}
                  onChange={setPh}
                  placeholder="e.g. 6.5"
                />
                <ColorNumberInput
                  type="ec"
                  label="EC (mS/cm)"
                  value={ec}
                  onChange={setEc}
                  placeholder="e.g. 1.6"
                />
                <div className="space-y-2">
                  <Label>Light hours/day</Label>
                  <Input inputMode="numeric" value={light ?? ""} onChange={(e)=>setLight(Number(e.target.value))} placeholder="e.g. 12" />
                </div>
                <div className="md:col-span-3">
                  <Button onClick={saveVitals}>
                    Save vitals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plants" className="mt-4">
            <PlantsTab towerId={tower.id} />
          </TabsContent>

          <TabsContent value="pests" className="mt-4">
            <PestsTab towerId={tower.id} />
          </TabsContent>

          <TabsContent value="harvests" className="mt-4">
            <HarvestsTab towerId={tower.id} />
          </TabsContent>

          <TabsContent value="waste" className="mt-4">
            <WasteTab towerId={tower.id} />
          </TabsContent>

          <TabsContent value="photos" className="mt-4">
            <TowerPhotosTab towerId={tower.id} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <HistoryTab towerId={tower.id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function PlantsTab({ towerId }: { towerId: string }) {
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
  }, [towerId, toast]);

  const addPlanting = async () => {
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add plants.",
          variant: "destructive"
        });
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
              <Link to={/app/catalog?addTo=${towerId}}>Add from catalog</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Lettuce" />
          </div>
          <div className="space-y-2">
            <Label>Port number</Label>
            <Input inputMode="numeric" value={portNumber ?? ""} onChange={(e)=>setPortNumber(Number(e.target.value) || undefined)} placeholder="1-32" />
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input inputMode="numeric" value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Seeded at</Label>
            <Input type="date" value={seededAt} onChange={(e)=>setSeededAt(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Planted at</Label>
            <Input type="date" value={plantedAt} onChange={(e)=>setPlantedAt(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Expected harvest</Label>
            <Input type="date" value={harvestDate} onChange={(e)=>setHarvestDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Growth rate</Label>
            <Input value={growthRate} onChange={(e)=>setGrowthRate(e.target.value)} placeholder="e.g. 2cm/week" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Outcome</Label>
            <Input value={outcome} onChange={(e)=>setOutcome(e.target.value)} placeholder="Eaten in class, donated, etc" />
          </div>
          <div className="md:col-span-3">
            <Button onClick={addPlanting} disabled={submitting || !name.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
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
            {plantings.map((p)=> (
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

      toast({
        title: "Pest log added",
        description: "Pest observation has been recorded successfully."
      });
    } catch (error) {
      console.error('Error adding pest log:', error);
      toast({
        title: "Error adding pest log",
        description: "Failed to add pest log. Please try again.",
        variant: "destructive"
      });
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
            <Textarea value={pest} onChange={(e)=>setPest(e.target.value)} placeholder="Aphids on row 2" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Action</Label>
            <Textarea value={action} onChange={(e)=>setAction(e.target.value)} placeholder="Released ladybugs" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Additional notes" />
          </div>
          <div className="md:col-span-2">
            <Button onClick={addPestLog} disabled={submitting || !pest.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
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
            pestLogs.map((p)=> (
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

function HarvestsTab({ towerId }: { towerId: string }) {
  const { toast } = useToast();
  const [harvests, setHarvests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [weight, setWeight] = useState<number>(0);
  const [destination, setDestination] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    const fetchHarvests = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('harvests')
          .select('*')
          .eq('tower_id', towerId)
          .eq('teacher_id', user.id)
          .order('harvested_at', { ascending: false });

        if (error) throw error;
        setHarvests(data || []);
      } catch (error) {
        console.error('Error fetching harvests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHarvests();
  }, [towerId]);

  const addHarvest = async () => {
    if (weight <= 0) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('harvests')
        .insert({
          tower_id: towerId,
          teacher_id: user.id,
          harvested_at: date,
          weight_grams: weight,
          destination: destination || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      setHarvests(prev => [data, ...prev]);
      setWeight(0);
      setDestination("");
      setNotes("");

      toast({
        title: "Harvest added",
        description: "Harvest has been recorded successfully."
      });
    } catch (error) {
      console.error('Error adding harvest:', error);
      toast({
        title: "Error adding harvest",
        description: "Failed to add harvest. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add Harvest</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Weight (g)</Label>
            <Input inputMode="decimal" value={weight} onChange={(e)=>setWeight(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Destination</Label>
            <Input value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="Cafeteria, donation, etc" />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Additional notes" />
          </div>
          <div className="md:col-span-3">
            <Button onClick={addHarvest} disabled={submitting || weight <= 0}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add harvest"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Harvests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : harvests.length === 0 ? (
            <div className="text-sm text-muted-foreground">No harvests yet.</div>
          ) : (
            harvests.map((h)=> (
              <div key={h.id} className="grid md:grid-cols-4 gap-2 p-3 border rounded-md">
                <div><span className="text-xs text-muted-foreground">Date</span><div>{h.harvested_at}</div></div>
                <div><span className="text-xs text-muted-foreground">Weight</span><div>{h.weight_grams} g</div></div>
                <div><span className="text-xs text-muted-foreground">Destination</span><div>{h.destination || "-"}</div></div>
                <div><span className="text-xs text-muted-foreground">Notes</span><div>{h.notes || "-"}</div></div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WasteTab({ towerId }: { towerId: string }) {
  const { toast } = useToast();
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [grams, setGrams] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    const fetchWasteLogs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('waste_logs')
          .select('*')
          .eq('tower_id', towerId)
          .eq('teacher_id', user.id)
          .order('logged_at', { ascending: false });

        if (error) throw error;
        setWasteLogs(data || []);
      } catch (error) {
        console.error('Error fetching waste logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWasteLogs();
  }, [towerId]);

  const addWasteLog = async () => {
    if (grams <= 0) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('waste_logs')
        .insert({
          tower_id: towerId,
          teacher_id: user.id,
          logged_at: date,
          grams: grams,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      setWasteLogs(prev => [data, ...prev]);
      setGrams(0);
      setNotes("");

      toast({
        title: "Waste logged",
        description: "Waste has been recorded successfully."
      });
    } catch (error) {
      console.error('Error adding waste log:', error);
      toast({
        title: "Error logging waste",
        description: "Failed to log waste. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Log Waste</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Waste (g)</Label>
            <Input inputMode="decimal" value={grams} onChange={(e)=>setGrams(Number(e.target.value))} />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Reason for waste, etc." />
          </div>
          <div className="md:col-span-3">
            <Button onClick={addWasteLog} disabled={submitting || grams <= 0}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                "Log waste"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Waste History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : wasteLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No waste logs yet.</div>
          ) : (
            wasteLogs.map((w)=> (
              <div key={w.id} className="grid md:grid-cols-3 gap-2 p-3 border rounded-md">
                <div><span className="text-xs text-muted-foreground">Date</span><div>{w.logged_at}</div></div>
                <div><span className="text-xs text-muted-foreground">Weight</span><div>{w.grams} g</div></div>
                <div><span className="text-xs text-muted-foreground">Notes</span><div>{w.notes || "-"}</div></div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryTab({ towerId }: { towerId: string }) {
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [harvestsData, setHarvestsData] = useState<any[]>([]);
  const [pestsData, setPestsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch vitals data
        const { data: vitals } = await supabase
          .from('tower_vitals')
          .select('*')
          .eq('tower_id', towerId)
          .eq('teacher_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(50);

        // Fetch harvests data
        const { data: harvests } = await supabase
          .from('harvests')
          .select('*')
          .eq('tower_id', towerId)
          .eq('teacher_id', user.id)
          .order('harvested_at', { ascending: false })
          .limit(50);

        // Fetch pest logs
        const { data: pests } = await supabase
          .from('pest_logs')
          .select('*')
          .eq('tower_id', towerId)
          .eq('teacher_id', user.id)
          .order('observed_at', { ascending: false })
          .limit(50);

        setVitalsData(vitals || []);
        setHarvestsData(harvests || []);
        setPestsData(pests || []);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [towerId]);

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
        <CardHeader>
          <CardTitle>Vitals History</CardTitle>
        </CardHeader>
        <CardContent>
          {vitalsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No vitals data recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {vitalsData.map((vital) => (
                <div key={vital.id} className="grid grid-cols-4 gap-4 p-3 border rounded-md">
                  <div>
                    <div className="text-xs text-muted-foreground">Date</div>
                    <div>{new Date(vital.recorded_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">pH</div>
                    <div>{vital.ph || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">EC</div>
                    <div>{vital.ec || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Light (lux)</div>
                    <div>{vital.light_lux || "-"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Harvests History */}
      <Card>
        <CardHeader>
          <CardTitle>Harvest History</CardTitle>
        </CardHeader>
        <CardContent>
          {harvestsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No harvests recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {harvestsData.map((harvest) => (
                <div key={harvest.id} className="grid grid-cols-3 gap-4 p-3 border rounded-md">
                  <div>
                    <div className="text-xs text-muted-foreground">Date</div>
                    <div>{harvest.harvested_at}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Weight</div>
                    <div>{harvest.weight_grams} g</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Destination</div>
                    <div>{harvest.destination || "-"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pest Logs History */}
      <Card>
        <CardHeader>
          <CardTitle>Pest Log History</CardTitle>
        </CardHeader>
        <CardContent>
          {pestsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pest observations recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {pestsData.map((pest) => (
                <div key={pest.id} className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">
                    {new Date(pest.observed_at).toLocaleDateString()}
                  </div>
                  <div className="font-medium">{pest.pest}</div>
                  {pest.notes && <div className="text-sm text-muted-foreground">{pest.notes}</div>}
                  {pest.action && <div className="text-sm">Action: {pest.action}</div>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
