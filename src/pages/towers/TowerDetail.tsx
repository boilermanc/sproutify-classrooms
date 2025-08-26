// TowerDetail.tsx — FINAL VERSION WITH VIDEO BADGE FIXX

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
  Building, Leaf, Sun, Calendar, Clock, MapPin, AlertTriangle, CheckCircle, Plus, Edit,
  Trash2, Globe, Loader2, Bug, Search, Eye, Shield, Target, Video as VideoIcon,
  Microscope, Droplets, PlayCircle, ClipboardList,
} from "lucide-react";

// Import existing components
import { TowerVitalsForm } from "@/components/towers/TowerVitalsForm";
import { TowerHarvestForm } from "@/components/towers/TowerHarvestForm";
import { TowerWasteForm } from "@/components/towers/TowerWasteForm";
import { TowerPhotosTab } from "@/components/towers/TowerPhotosTab";
import { TowerHistory } from "@/components/towers/TowerHistory";

/* =========================
   Types
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

interface PestCatalogItem {
  id: string;
  name: string;
  scientific_name: string | null;
  type: 'pest' | 'disease' | 'nutrient' | 'environmental';
  description: string;
  appearance_details: string | null;
  damage_caused: string[] | null;
  omri_remedies: string[] | null;
  management_strategies: string[] | null;
  prevention_methods: string[] | null;
  video_url: string | null;
  safe_for_schools: boolean;
}

/* =========================
   Self-Contained VideoPlayer
   ========================= */

const guessMimeFromUrl = (url: string) => {
  const u = url.split("?")[0].toLowerCase();
  if (u.endsWith(".mp4")) return "video/mp4";
  if (u.endsWith(".webm")) return "video/webm";
  if (u.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
};

function VideoPlayer({ src, title }: { src: string; title?: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setLoading(true); setError(null); }, [src]);
  const handleCanPlay = () => setLoading(false);
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setLoading(false);
    const code = e.currentTarget.error?.code;
    const msg =
      code === MediaError.MEDIA_ERR_ABORTED ? "Video loading aborted." :
      code === MediaError.MEDIA_ERR_NETWORK ? "A network error occurred." :
      code === MediaError.MEDIA_ERR_DECODE ? "Video cannot be decoded." :
      "An unknown error occurred.";
    setError(msg);
  };

  return (
    <div className="space-y-3">
      {title && <h4 className="font-semibold">{title}</h4>}
      <div className="relative aspect-video w-full rounded-lg bg-black">
        {(loading || error) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 p-4">
            {loading && <Loader2 className="h-8 w-8 animate-spin text-white" />}
            {error && <div className="text-center"><AlertTriangle className="mx-auto h-6 w-6 text-red-400" /><p className="mt-2 text-sm text-red-300">{error}</p></div>}
          </div>
        )}
        <video key={src} className={`h-full w-full rounded-lg transition-opacity ${loading || error ? "opacity-0" : "opacity-100"}`} controls playsInline preload="metadata" onCanPlay={handleCanPlay} onError={handleError}>
          <source src={src} type={guessMimeFromUrl(src)} />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

/* =========================
   Self-Contained PestIdentificationModal
   ========================= */

interface PestIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pest: PestCatalogItem | null) => void;
  towerLocation?: string;
}

function PestIdentificationModal({ isOpen, onClose, onSelect, towerLocation = "classroom" }: PestIdentificationModalProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pest': return <Bug className="h-4 w-4" />;
      case 'disease': return <Microscope className="h-4 w-4" />;
      case 'nutrient': return <Droplets className="h-4 w-4" />;
      case 'environmental': return <Sun className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pest': return 'bg-red-100 text-red-800';
      case 'disease': return 'bg-purple-100 text-purple-800';
      case 'nutrient': return 'bg-blue-100 text-blue-800';
      case 'environmental': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPest, setSelectedPest] = useState<PestCatalogItem | null>(null);
  const [contentTab, setContentTab] = useState('identification');
  const [pestCatalog, setPestCatalog] = useState<PestCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPestCatalog = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.from('pest_catalog').select('*').eq('safe_for_schools', true).order('name', { ascending: true });
        if (error) throw error;
        setPestCatalog(data || []);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchPestCatalog();
  }, [isOpen]);

  const filteredPests = pestCatalog.filter(pest => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = pest.name.toLowerCase().includes(q) || pest.description.toLowerCase().includes(q) || (pest.scientific_name && pest.scientific_name.toLowerCase().includes(q));
    const matchesType = selectedType === 'all' || pest.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handlePestSelect = (pest: PestCatalogItem) => {
    setSelectedPest(pest);
    setActiveTab('details');
    setContentTab('identification');
  };

  const handleUseCustom = () => { onSelect?.(null); onClose(); };
  const handleUsePest = () => { if (selectedPest) onSelect?.(selectedPest); onClose(); };

  const resetModal = () => {
    setActiveTab('browse'); setSearchTerm(''); setSelectedType('all'); setSelectedPest(null); setContentTab('identification'); setError(null);
  };

  useEffect(() => { if (!isOpen) resetModal(); }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg max-h-[90vh] overflow-hidden">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 z-10 hover:opacity-100 text-2xl">&times;</button>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold flex items-center gap-2"><ClipboardList className="h-5 w-5" />Issue Identification</h2>
          <p className="text-sm text-muted-foreground">Search and select an issue from our database or enter a custom observation.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Catalog</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedPest}>{selectedPest ? selectedPest.name : "Issue Details"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by name, symptoms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
              <div className="flex gap-2 flex-wrap">{['all', 'pest', 'disease', 'nutrient', 'environmental'].map((type) => (<Button key={type} variant={selectedType === type ? "default" : "outline"} size="sm" onClick={() => setSelectedType(type)} className="capitalize">{type !== 'all' && getTypeIcon(type)}<span className="ml-1">{type}</span></Button>))}</div>
            </div>
            {loading && <div className="flex items-center justify-center pt-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {error && <div className="flex items-center justify-center pt-12 text-red-600">{error}</div>}

            {!loading && !error && (
              <>
                <ScrollArea className="pr-4" style={{ height: 'calc(90vh - 300px)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    {filteredPests.map((pest) => (
                      <Card key={pest.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedPest?.id === pest.id ? 'ring-2 ring-primary' : ''}`} onClick={() => handlePestSelect(pest)}>
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base">{pest.name}</CardTitle>
                                    {pest.scientific_name && <p className="text-sm text-muted-foreground italic">{pest.scientific_name}</p>}
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <Badge variant="secondary" className={getTypeColor(pest.type)}>
                                        {getTypeIcon(pest.type)}
                                        <span className="ml-1 capitalize">{pest.type}</span>
                                    </Badge>
                                    {pest.video_url && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            <VideoIcon className="h-3 w-3 mr-1" />
                                            Video
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground line-clamp-2">{pest.description}</p></CardContent>
                      </Card>
                    ))}
                  </div>
                  {filteredPests.length === 0 && <div className="text-center py-8 text-muted-foreground">No matches found.</div>}
                </ScrollArea>
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={handleUseCustom}>Use Custom</Button>
                  <div className="space-x-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleUsePest} disabled={!selectedPest}>Use Selected</Button></div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            {selectedPest && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><h3 className="text-xl font-bold">{selectedPest.name}</h3>{selectedPest.scientific_name && <p className="text-muted-foreground italic">{selectedPest.scientific_name}</p>}</div>
                  <Badge className={getTypeColor(selectedPest.type)}>{getTypeIcon(selectedPest.type)}<span className="ml-1 capitalize">{selectedPest.type}</span></Badge>
                </div>
                <Tabs value={contentTab} onValueChange={setContentTab}>
                  <TabsList className="grid w-full grid-cols-6"><TabsTrigger value="identification"><Eye className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">ID</span></TabsTrigger><TabsTrigger value="damage"><AlertTriangle className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Damage</span></TabsTrigger><TabsTrigger value="remedies"><Shield className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Remedies</span></TabsTrigger><TabsTrigger value="management"><Target className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Manage</span></TabsTrigger><TabsTrigger value="prevention"><Shield className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Prevent</span></TabsTrigger><TabsTrigger value="video"><VideoIcon className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Video</span></TabsTrigger></TabsList>
                  <ScrollArea className="pr-4 mt-4" style={{ height: 'calc(90vh - 400px)' }}>
                    <TabsContent value="identification" className="space-y-4 pb-4"><div><h4 className="font-semibold mb-2">Description</h4><p className="text-muted-foreground">{selectedPest.description}</p></div>{selectedPest.appearance_details && <div><h4 className="font-semibold mb-2">Appearance</h4><p className="text-muted-foreground">{selectedPest.appearance_details}</p></div>}</TabsContent>
                    <TabsContent value="damage" className="space-y-4 pb-4"><div><h4 className="font-semibold mb-2">Damage Caused</h4>{selectedPest.damage_caused?.length ? <ul className="list-disc list-inside space-y-1">{selectedPest.damage_caused.map((d, i) => <li key={i}>{d}</li>)}</ul> : <p>N/A</p>}</div></TabsContent>
                    <TabsContent value="remedies" className="space-y-4 pb-4"><div><h4 className="font-semibold mb-2">School-Safe Remedies</h4>{selectedPest.omri_remedies?.length ? <ul className="list-disc list-inside space-y-1">{selectedPest.omri_remedies.map((r, i) => <li key={i}>{r}</li>)}</ul> : <p>N/A</p>}</div></TabsContent>
                    <TabsContent value="management" className="space-y-4 pb-4"><div><h4 className="font-semibold mb-2">Management</h4>{selectedPest.management_strategies?.length ? <ul className="list-disc list-inside space-y-1">{selectedPest.management_strategies.map((s, i) => <li key={i}>{s}</li>)}</ul> : <p>N/A</p>}</div></TabsContent>
                    <TabsContent value="prevention" className="space-y-4 pb-4"><div><h4 className="font-semibold mb-2">Prevention</h4>{selectedPest.prevention_methods?.length ? <ul className="list-disc list-inside space-y-1">{selectedPest.prevention_methods.map((p, i) => <li key={i}>{p}</li>)}</ul> : <p>N/A</p>}</div></TabsContent>
                    <TabsContent value="video" className="space-y-4 pb-4">{selectedPest.video_url ? <VideoPlayer src={selectedPest.video_url} title="Video Guide" /> : <div className="text-center py-8">Video coming soon.</div>}</TabsContent>
                  </ScrollArea>
                </Tabs>
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setActiveTab('browse')}>Back to Browse</Button>
                  <div className="space-x-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleUsePest}>Use This Issue</Button></div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

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

  const fetchTower = async () => { /* ... fetch logic ... */ };
  const refreshData = () => setRefreshKey(prev => prev + 1);
  const getLocationIcon = (location?: string) => { /* ... */ };
  const getLocationLabel = (location?: string) => { /* ... */ };

  if (loading) { return ( <div className="container ...">...</div> ); }
  if (error || !tower) { return ( <div className="container ...">...</div> ); }

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

interface ScoutingTabProps { /* ... */ }

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

  const loadActiveEntries = async () => { /* ... */ };
  const handlePestSelection = (selectedPest: PestCatalogItem | null) => { /* ... */ };
  const addPestLog = async () => { /* ... */ };
  const clearSelection = () => { /* ... */ };
  const getTypeIcon = (type: string) => { /* ... */ };
  const getTypeColor = (type: string) => { /* ... */ };

  return (
    <div className="space-y-6">
      <PestIdentificationModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={handlePestSelection} towerLocation={towerLocation} />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bug className="h-5 w-5" />Log Scouting Observation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* ... Scouting Form JSX ... */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Observation History</CardTitle></CardHeader>
        <CardContent>
          {/* ... History JSX ... */}
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================
   PlantsTab (full)
   ========================= */

interface PlantsTabProps { /* ... */ }

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
    const fetchPlantings = async () => { /* ... */ };
    fetchPlantings();
  }, [towerId, teacherId, toast, refreshKey]);

  const addPlanting = async () => { /* ... */ };
  const getHarvestStatus = (expectedDate?: string) => { /* ... */ };

  if (loading) { return <Skeleton className="h-96 w-full" />; }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Add Plant Manually</CardTitle>
            <Button asChild variant="outline" size="sm"><Link to={`/app/catalog?addTo=${towerId}`}><Leaf className="h-4 w-4 mr-2" />Add from Catalog</Link></Button>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          {/* ... Add Plant Form JSX ... */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5 text-green-600" />Tower Plants ({plantings.length})</CardTitle></CardHeader>
        <CardContent>
          {plantings.length === 0 ? (
            <div className="text-center py-8">
              {/* ... Empty state JSX ... */}
            </div>
          ) : (
            <div className="space-y-4">
              {plantings.map((plant) => {
                const harvest = getHarvestStatus(plant.expected_harvest_date);
                return (<Card key={plant.id} className="p-4">{/* ... Plant Card JSX ... */}</Card>);
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}