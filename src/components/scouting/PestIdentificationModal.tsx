// src/components/scouting/PestIdentificationModal.tsx — UPGRADED AND FINAL VERSION

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, Bug, Leaf, Droplets, Sun, Video as VideoIcon, AlertTriangle, Shield, 
  Microscope, Eye, Target, Loader2, PlayCircle, ClipboardList
} from 'lucide-react';

// =======================
// Types (Exported for reuse)
// =======================
export interface PestCatalogItem {
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

// =======================
// Video Player Component (Self-contained)
// =======================
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

// =======================
// Main Modal Component
// =======================
interface PestIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pest: PestCatalogItem | null) => void;
  towerLocation?: string;
}

export function PestIdentificationModal({ isOpen, onClose, onSelect, towerLocation = "classroom" }: PestIdentificationModalProps) {
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
        setLoading(true); setError(null);
        const { data, error } = await supabase.from('pest_catalog').select('*').eq('safe_for_schools', true).order('name', { ascending: true });
        if (error) throw error;
        setPestCatalog(data || []);
      } catch (err: any) { setError(err?.message ?? 'Failed to load catalog'); }
      finally { setLoading(false); }
    };
    fetchPestCatalog();
  }, [isOpen]);

  const filteredPests = pestCatalog.filter(pest => {
    const q = searchTerm.toLowerCase();
    return (pest.name.toLowerCase().includes(q) || pest.description.toLowerCase().includes(q)) && (selectedType === 'all' || pest.type === selectedType);
  });

  const handlePestSelect = (pest: PestCatalogItem) => { setSelectedPest(pest); setActiveTab('details'); setContentTab('identification'); };
  const handleUseCustom = () => { onSelect(null); onClose(); };
  const handleUsePest = () => { if (selectedPest) onSelect(selectedPest); onClose(); };
  const resetModal = () => { setActiveTab('browse'); setSearchTerm(''); setSelectedType('all'); setSelectedPest(null); setContentTab('identification'); setError(null); };
  useEffect(() => { if (!isOpen) resetModal(); }, [isOpen]);

  const getTypeIcon = (type: string) => { /* ... */ };
  const getTypeColor = (type: string) => { /* ... */ };

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
              <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
              <div className="flex gap-2 flex-wrap">{['all', 'pest', 'disease', 'nutrient', 'environmental'].map((type) => (<Button key={type} variant={selectedType === type ? "default" : "outline"} size="sm" onClick={() => setSelectedType(type)} className="capitalize">{type !== 'all' && getTypeIcon(type)}<span className="ml-1">{type}</span></Button>))}</div>
            </div>
            {!loading && (
              <>
                <ScrollArea className="pr-4" style={{ height: 'calc(90vh - 300px)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">{/* ...pest map... */}</div>
                </ScrollArea>
                <div className="flex justify-between pt-4 border-t">{/* ...footer buttons... */}</div>
              </>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            {selectedPest && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">{/* ...details header... */}</div>
                <Tabs value={contentTab} onValueChange={setContentTab}>
                  <TabsList className="grid w-full grid-cols-6">{/* ...details tabs... */}</TabsList>
                  <ScrollArea className="pr-4 mt-4" style={{ height: 'calc(90vh - 400px)' }}>
                    {/* ...all details content tabs... */}
                    <TabsContent value="video" className="space-y-4 pb-4">{selectedPest.video_url ? <VideoPlayer src={selectedPest.video_url} title="Video Guide" /> : <div className="text-center py-8">Video coming soon.</div>}</TabsContent>
                  </ScrollArea>
                </Tabs>
                <div className="flex justify-between pt-4 border-t">{/* ...details footer... */}</div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}