// TowerDetail.tsx — FINAL REFACTORED FILE
// This version now imports and uses the shared PestIdentificationModal.

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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building,
  Leaf,
  Sun,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Globe,
  Loader2,
  Bug,
  Search,
  Microscope,
  Droplets,
} from "lucide-react";

// Import existing components
import { TowerVitalsForm } from "@/components/towers/TowerVitalsForm";
import { TowerHarvestForm } from "@/components/towers/TowerHarvestForm";
import { TowerWasteForm } from "@/components/towers/TowerWasteForm";
import { TowerPhotosTab } from "@/components/towers/TowerPhotosTab";
import { TowerHistory } from "@/components/towers/TowerHistory";

// NEW: Import the shared modal component and its type
import { PestIdentificationModal, PestCatalogItem } from "@/components/modals/PestIdentificationModal";

/* =========================
   Types (Local to this file)
   ========================= */

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

/* =========================
   TowerDetail Component
   ========================= */

export default function TowerDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const [tower, setTower] = useState<Tower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const initialTab = searchParams.get("tab") || "vitals";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTeacherId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setTeacherId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id && teacherId) {
      fetchTower();
    }
  }, [id, teacherId, refreshKey]);

  const fetchTower = async () => {
    if (!id || !teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.from("towers").select("*").eq("id", id).eq("teacher_id", teacherId).single();
      if (fetchError) {
        if ((fetchError as any).code === 'PGRST116') setError("Tower not found or you do not have permission to view it.");
        else throw fetchError;
        return;
      }
      setTower(data);
    } catch (error: any) {
      setError("Failed to load tower details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => setRefreshKey(prev => prev + 1);

  const getLocationIcon = (location?: string) => {
    switch (location) {
      case 'greenhouse': return <Leaf className="h-4 w-4 text-green-600" />;
      case 'outdoor': return <Sun className="h-4 w-4 text-yellow-600" />;
      default: return <Building className="h-4 w-4 text-blue-600" />;
    }
  };

  const getLocationLabel = (location?: string) => {
    switch (location) {
      case 'greenhouse': return 'Greenhouse';
      case 'outdoor': return 'Outdoor';
      default: return 'Indoor';
    }
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-4">
        <div className="flex items-center justify-between"><Skeleton className="h-8 w-64" /><Skeleton className="h-6 w-20" /></div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !tower) {
    return (
      <div className="container py-8">
        <Alert variant="destructive"><AlertDescription>{error || "Tower not found."}</AlertDescription></Alert>
      </div>
    );
  }

  return (
    <>
      <SEO title={`${tower.name} - Tower Details`} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{tower.name}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-2">{getLocationIcon(tower.location)}{getLocationLabel(tower.location)}</Badge>
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
          <TabsContent value="vitals" className="mt-4"><TowerVitalsForm towerId={tower.id} teacherId={teacherId} onVitalsSaved={refreshData} /></TabsContent>
          <TabsContent value="plants" className="mt-4"><PlantsTab towerId={tower.id} teacherId={teacherId} refreshKey={refreshKey} /></TabsContent>
          <TabsContent value="scouting" className="mt-4"><ScoutingTab towerId={tower.id} teacherId={teacherId} towerLocation={tower.location || 'indoor'} onScoutingSaved={refreshData} /></TabsContent>
          <TabsContent value="harvests" className="mt-4"><TowerHarvestForm towerId={tower.id} teacherId={teacherId} onHarvested={refreshData} /></TabsContent>
          <TabsContent value="waste" className="mt-4"><TowerWasteForm towerId={tower.id} teacherId={teacherId} onWasteLogged={refreshData} /></TabsContent>
          <TabsContent value="photos" className="mt-4"><TowerPhotosTab towerId={tower.id} /></TabsContent>
          <TabsContent value="history" className="mt-4"><TowerHistory towerId={tower.id} teacherId={teacherId} refreshKey={refreshKey} /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}

/* =========================
   ScoutingTab Component
   ========================= */

interface ScoutingTabProps {
  towerId: string;
  teacherId: string;
  towerLocation: 'indoor' | 'greenhouse' | 'outdoor';
  onScoutingSaved: () => void;
}

function ScoutingTab({ towerId, teacherId, towerLocation, onScoutingSaved }: ScoutingTabProps) {
  const { toast } = useToast();
  const [activeEntries, setActiveEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pest, setPest] = useState("");
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFromCatalog, setSelectedFromCatalog] = useState<PestCatalogItem | null>(null);

  useEffect(() => { loadActiveEntries(); }, [towerId, teacherId]);

  const loadActiveEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('pest_logs').select('*').eq('tower_id', towerId).eq('teacher_id', teacherId).order('observed_at', { ascending: false }).limit(10);
      if (error) throw error;
      setActiveEntries(data || []);
    } catch (error) { console.error('Error loading scouting entries:', error); }
    finally { setLoading(false); }
  };

  const handlePestSelection = (selectedPest: PestCatalogItem | null) => {
    if (selectedPest) {
      setPest(selectedPest.name);
      setSelectedFromCatalog(selectedPest);
      toast({ title: "Issue selected", description: `Selected ${selectedPest.name}.` });
    } else {
      setPest("");
      setSelectedFromCatalog(null);
      toast({ title: "Custom entry selected" });
    }
    setShowModal(false);
  };

  const addPestLog = async () => {
    if (!pest.trim()) { toast({ title: "Observation is required", variant: "destructive" }); return; }
    try {
      setSubmitting(true);
      const { data, error } = await supabase.from('pest_logs').insert({ tower_id: towerId, teacher_id: teacherId, pest: pest.trim(), action: action || null, notes: notes || null }).select().single();
      if (error) throw error;
      setActiveEntries(prev => [data, ...prev]);
      setPest(""); setAction(""); setNotes(""); setSelectedFromCatalog(null);
      toast({ title: "Observation logged successfully" });
      onScoutingSaved();
    } catch (error) { toast({ title: "Error logging observation", variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const clearSelection = () => { setPest(""); setSelectedFromCatalog(null); };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pest': return <Bug className="h-3 w-3" />;
      case 'disease': return <Microscope className="h-3 w-3" />;
      case 'nutrient': return <Droplets className="h-3 w-3" />;
      default: return <Sun className="h-3 w-3" />;
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pest': return 'bg-red-100 text-red-800';
      case 'disease': return 'bg-purple-100 text-purple-800';
      case 'nutrient': return 'bg-blue-100 text-blue-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="space-y-6">
      <PestIdentificationModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={handlePestSelection} towerLocation={towerLocation} />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bug className="h-5 w-5" />Log Scouting Observation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Observation/Issue</Label>
            <div className="flex gap-2 items-start">
              <div className="flex-1">{selectedFromCatalog ? (<div className="p-3 border rounded-md bg-muted/20 flex items-center justify-between"><div><div className="flex items-center gap-2"><Badge className={getTypeColor(selectedFromCatalog.type)}>{getTypeIcon(selectedFromCatalog.type)}<span className="ml-1 capitalize">{selectedFromCatalog.type}</span></Badge><span className="font-medium">{selectedFromCatalog.name}</span></div></div><Button variant="outline" size="sm" onClick={clearSelection}>Change</Button></div>) : (<Textarea value={pest} onChange={(e) => setPest(e.target.value)} placeholder="e.g., Small white flies on kale leaves" className="min-h-[80px]" />)}</div>
              <Button variant="outline" onClick={() => setShowModal(true)} className="flex items-center gap-2 shrink-0"><Search className="h-4 w-4" />Browse Catalog</Button>
            </div>
          </div>
          <div className="space-y-2"><Label>Action Taken (Optional)</Label><Textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g., Applied insecticidal soap" /></div>
          <div className="space-y-2"><Label>Additional Notes (Optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional details..." /></div>
          <div className="flex justify-end"><Button onClick={addPestLog} disabled={submitting || !pest.trim()}>{submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save Observation"}</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Observation History</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            : activeEntries.length === 0 ? <div className="text-center py-8 text-muted-foreground"><Bug className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No observations yet.</p></div>
            : <div className="space-y-4">{activeEntries.map((entry) => (<div key={entry.id} className="p-4 border rounded-md"><div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><Bug className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{entry.pest}</span><span className="text-xs text-muted-foreground">{new Date(entry.observed_at).toLocaleDateString()}</span></div>{entry.action && <div className="text-sm mt-2"><span className="font-medium text-green-700">Action:</span><span className="ml-2">{entry.action}</span></div>}{entry.notes && <div className="text-sm text-muted-foreground mt-2"><span className="font-medium">Notes:</span><span className="ml-2">{entry.notes}</span></div>}</div></div></div>))}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================
   PlantsTab (full)
   ========================= */

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
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [seededAt, setSeededAt] = useState("");
  const [plantedAt, setPlantedAt] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [portNumber, setPortNumber] = useState<number | undefined>();

  useEffect(() => {
    const fetchPlantings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('plantings').select(`*, plant_catalog (*)`).eq('tower_id', towerId).eq('teacher_id', teacherId).order('created_at', { ascending: false });
        if (error) throw error;
        setPlantings(data || []);
      } catch (error) { toast({ title: "Error loading plants", variant: "destructive" }); }
      finally { setLoading(false); }
    };
    fetchPlantings();
  }, [towerId, teacherId, toast, refreshKey]);

  const addPlanting = async () => {
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      const { data, error } = await supabase.from('plantings').insert({ tower_id: towerId, teacher_id: teacherId, name: name.trim(), quantity, seeded_at: seededAt || null, planted_at: plantedAt || null, expected_harvest_date: harvestDate || null, port_number: portNumber || null }).select('*, plant_catalog (*)').single();
      if (error) throw error;
      setPlantings(prev => [data, ...prev]);
      setName(""); setQuantity(1); setSeededAt(""); setPlantedAt(""); setHarvestDate(""); setPortNumber(undefined);
      toast({ title: "Plant added successfully" });
    } catch (error) { toast({ title: "Error adding plant", variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const getHarvestStatus = (expectedDate?: string) => {
    if (!expectedDate) return { status: 'unknown' };
    const today = new Date(); today.setHours(0,0,0,0);
    const harvest = new Date(expectedDate);
    const diffTime = harvest.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (days < 0) return { status: 'overdue', days: Math.abs(days) };
    if (days === 0) return { status: 'today', days: 0 };
    return { status: 'upcoming', days };
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Add Plant Manually</CardTitle><Button asChild variant="outline" size="sm"><Link to={`/app/catalog?addTo=${towerId}`}><Leaf className="h-4 w-4 mr-2" />Add from Catalog</Link></Button></div></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Plant Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Lettuce" /></div>
          <div className="space-y-2"><Label>Port #</Label><Input type="number" min="1" max="32" value={portNumber ?? ""} onChange={(e) => setPortNumber(Number(e.target.value) || undefined)} placeholder="1-32" /></div>
          <div className="space-y-2"><Label>Quantity</Label><Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} /></div>
          <div className="space-y-2"><Label>Seeded Date</Label><Input type="date" value={seededAt} onChange={(e) => setSeededAt(e.target.value)} /></div>
          <div className="space-y-2"><Label>Planted Date</Label><Input type="date" value={plantedAt} onChange={(e) => setPlantedAt(e.target.value)} /></div>
          <div className="space-y-2"><Label>Expected Harvest</Label><Input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} /></div>
          <div className="md:col-span-3"><Button onClick={addPlanting} disabled={submitting || !name.trim()}>{submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : <><Plus className="mr-2 h-4 w-4" />Add Plant</>}</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5 text-green-600" />Tower Plants ({plantings.length})</CardTitle></CardHeader>
        <CardContent>
          {plantings.length === 0 ? <div className="text-center py-8"><Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground mb-4">No plants added yet.</p><Button asChild><Link to={`/app/catalog?addTo=${towerId}`}><Plus className="h-4 w-4 mr-2" />Add First Plant</Link></Button></div>
            : <div className="space-y-4">{plantings.map((plant) => {
              const harvest = getHarvestStatus(plant.expected_harvest_date);
              return (<Card key={plant.id} className="p-4"><div className="flex items-start justify-between"><div className="space-y-3 flex-1"><div className="flex items-center gap-2"><h4 className="font-medium text-lg">{plant.name}</h4>{plant.plant_catalog && <Badge variant="outline">{plant.plant_catalog.category}</Badge>}</div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>Port: {plant.port_number || "N/A"}</span></div><div>Qty: {plant.quantity}</div>{plant.seeded_at && <div>Seeded: {new Date(plant.seeded_at).toLocaleDateString()}</div>}{plant.planted_at && <div>Planted: {new Date(plant.planted_at).toLocaleDateString()}</div>}</div>{plant.expected_harvest_date && <Badge variant={harvest.status === 'overdue' ? 'destructive' : 'secondary'}>{harvest.status === 'today' ? 'Ready Today!' : `${harvest.days} days ${harvest.status === 'overdue' ? 'overdue' : 'left'}`}</Badge>}</div><div className="flex gap-2 ml-4"><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div></div></Card>);})}</div>}
        </CardContent>
      </Card>
    </div>
  );
}