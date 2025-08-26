// src/components/modals/PestIdentificationModal.tsx - UPGRADED AND FINAL VERSION

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, Bug, Leaf, Droplets, Sun, Video as VideoIcon, AlertTriangle, Shield, 
  Microscope, Eye, Target, Loader2, PlayCircle, ClipboardList
} from 'lucide-react';

// =======================
// Types
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

interface PestIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pest: PestCatalogItem | null) => void;
  towerLocation?: string;
}

// =======================
// Video Player Component (Self-contained)
// =======================
const guessMimeFromUrl = (url: string) => {
  const u = url.split("?")[0].toLowerCase();
  if (u.endsWith(".mp4")) return "video/mp4";
  if (u.endsWith(".webm")) return "video/webm";
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
export function PestIdentificationModal({ isOpen, onClose, onSelect, towerLocation = "classroom" }: PestIdentificationModalProps) {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPest, setSelectedPest] = useState<PestCatalogItem | null>(null);
  const [contentTab, setContentTab] = useState('identification');
  const [pestCatalog, setPestCatalog] = useState<PestCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { /* fetch logic is unchanged */ }, [isOpen]);
  const filteredPests = pestCatalog.filter(pest => { /* filter logic is unchanged */ });
  const handlePestSelect = (pest: PestCatalogItem) => { setSelectedPest(pest); setActiveTab('details'); setContentTab('identification'); };
  const handleUseCustom = () => { onSelect(null); onClose(); };
  const handleUsePest = () => { if (selectedPest) onSelect(selectedPest); onClose(); };
  const resetModal = () => { /* reset logic is unchanged */ };
  useEffect(() => { if (!isOpen) resetModal(); }, [isOpen]);

  const getTypeIcon = (type: string) => { /* unchanged */ };
  const getTypeColor = (type: string) => { /* unchanged */ };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Issue Identification
          </DialogTitle>
          <DialogDescription>
            Search and select an issue from our database or enter a custom observation.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Catalog</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedPest}>{selectedPest ? selectedPest.name : "Issue Details"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
              <div className="flex gap-2 flex-wrap">{['all', 'pest', 'disease', 'nutrient', 'environmental'].map((type) => (<Button key={type} variant={selectedType === type ? 'default' : 'outline'} size="sm" onClick={() => setSelectedType(type)}>{getTypeIcon(type)}<span className="ml-1 capitalize">{type}</span></Button>))}</div>
            </div>
            {loading && <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {!loading && (
              <div className="flex flex-col flex-1 min-h-0 mt-4 gap-4">
                <ScrollArea className="flex-1 pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    {filteredPests.map((pest) => (
                      <Card key={pest.id} className="cursor-pointer" onClick={() => handlePestSelect(pest)}>{/* ... Card content ... */}</Card>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex justify-between pt-4 border-t shrink-0">
                  <Button variant="outline" onClick={handleUseCustom}>Use Custom</Button>
                  <div className="space-x-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleUsePest} disabled={!selectedPest}>Use Selected</Button></div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-4 flex flex-col flex-1 overflow-hidden">
            {selectedPest && (
              <div className="flex flex-col flex-1 min-h-0 gap-4">
                <div className="shrink-0">{/* Details Header */}</div>
                <Tabs value={contentTab} onValueChange={setContentTab} className="flex flex-col flex-1 overflow-hidden">
                  <TabsList className="grid w-full grid-cols-6">{/* Detail Tabs */}</TabsList>
                  <div className="flex-1 relative mt-4">
                    <ScrollArea className="absolute inset-0 pr-4">
                      {/* ... All detail TabsContent ... */}
                      <TabsContent value="video">
                        {selectedPest.video_url ? (
                          <VideoPlayer src={selectedPest.video_url} title="Video Guide" />
                        ) : (
                          <div className="text-center py-8">Video coming soon.</div>
                        )}
                      </TabsContent>
                    </ScrollArea>
                  </div>
                </Tabs>
                <div className="flex justify-between pt-4 border-t shrink-0">
                  <Button variant="outline" onClick={() => setActiveTab('browse')}>Back</Button>
                  <div className="space-x-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleUsePest}>Use Issue</Button></div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}