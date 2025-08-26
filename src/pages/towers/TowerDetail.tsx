// Fixed TowerDetail.tsx with Working Video Player and Corrected Messages
import { useState, useEffect, useRef } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building, Leaf, Sun, Calendar, Clock, MapPin, AlertTriangle, CheckCircle, Plus, Edit, Trash2, Globe, Loader2, Bug, Search, Eye, Shield, Target, Video, Microscope, Droplets, Play, Pause, Volume2, VolumeX, PlayCircle } from "lucide-react";

// Import existing components
import { TowerVitalsForm } from "@/components/towers/TowerVitalsForm";
import { TowerHarvestForm } from "@/components/towers/TowerHarvestForm";
import { TowerWasteForm } from "@/components/towers/TowerWasteForm";
import { TowerPhotosTab } from "@/components/towers/TowerPhotosTab";
import { TowerHistory } from "@/components/towers/TowerHistory";

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

// Debug Video Player Component with Enhanced Logging
interface VideoPlayerProps {
  src: string;
  title?: string;
}

function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Enhanced URL handling with debugging
  const getVideoUrl = (src: string) => {
    const info = [`Original URL: ${src}`];
    
    try {
      // If it's already a complete URL, return as is
      if (src.startsWith('http://') || src.startsWith('https://')) {
        info.push('URL type: Complete HTTPS URL');
        info.push(`Final URL: ${src}`);
        setDebugInfo(info);
        return src;
      }
      
      // If it's a Supabase storage path, construct the proper URL
      if (src.startsWith('pest-videos/')) {
        const { data } = supabase.storage.from('pest-videos').getPublicUrl(src);
        info.push('URL type: Supabase storage path');
        info.push(`Final URL: ${data.publicUrl}`);
        setDebugInfo(info);
        return data.publicUrl;
      }
      
      // Default case - assume it's a storage path without the bucket prefix
      const { data } = supabase.storage.from('pest-videos').getPublicUrl(`pest-videos/${src}`);
      info.push('URL type: Assumed storage path');
      info.push(`Final URL: ${data.publicUrl}`);
      setDebugInfo(info);
      return data.publicUrl;
    } catch (err) {
      console.error('Error constructing video URL:', err);
      info.push(`Error: ${err}`);
      setDebugInfo(info);
      return src; // Fallback to original URL
    }
  };

  const videoUrl = getVideoUrl(src);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset states when source changes
    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setProgress(0);

    // Add debug logging
    console.log('Video component initializing with URL:', videoUrl);

    const updateTime = () => {
      if (video) {
        setCurrentTime(video.currentTime);
        if (video.duration) {
          setProgress((video.currentTime / video.duration) * 100);
        }
      }
    };

    const updateDuration = () => {
      if (video && video.duration) {
        console.log('Video duration loaded:', video.duration);
        setDuration(video.duration);
        setLoading(false);
      }
    };

    const handleError = (e: Event) => {
      console.error('Video error event:', e);
      console.error('Video error details:', video.error);
      
      let errorMessage = "Unable to load video";
      if (video.error) {
        switch (video.error.code) {
          case 1:
            errorMessage = "Video loading aborted";
            break;
          case 2:
            errorMessage = "Network error loading video";
            break;
          case 3:
            errorMessage = "Video format not supported";
            break;
          case 4:
            errorMessage = "Video source not found";
            break;
          default:
            errorMessage = `Video error (code ${video.error.code})`;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    };

    const handleCanPlay = () => {
      console.log('Video can play');
      setLoading(false);
      setError(null);
    };

    const handleLoadStart = () => {
      console.log('Video load started');
    };

    const handleLoadedData = () => {
      console.log('Video data loaded');
    };

    const handlePlay = () => {
      console.log('Video playing');
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('Video paused');
      setIsPlaying(false);
    };

    // Add event listeners with more comprehensive logging
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      // Clean up event listeners
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      // Handle play promise for newer browsers
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Play failed:', error);
          setError("Unable to play video. Please try again.");
        });
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading educational video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-medium text-red-700">Video Loading Error</p>
          <p className="text-xs text-red-600">{error}</p>
          
          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-left text-xs">
              <p className="font-semibold mb-2">Debug Info:</p>
              {debugInfo.map((info, index) => (
                <p key={index} className="text-gray-600">{info}</p>
              ))}
              <p className="mt-2 text-blue-600">
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  Test URL directly
                </a>
              </p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setError(null);
              setLoading(true);
              // Trigger reload by forcing video to reload
              const video = videoRef.current;
              if (video) {
                video.load();
              }
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h4 className="font-semibold">{title}</h4>}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          playsInline
          preload="metadata"
        />
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
            {/* Progress Bar */}
            <div 
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-white text-xs bg-black/40 px-2 py-1 rounded">
                  Educational Content
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Play Button Overlay (when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={togglePlay}
              className="bg-white/90 hover:bg-white text-black shadow-lg"
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>
          </div>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Use this educational video to learn proper identification and management techniques.
      </p>
    </div>
  );
}

export default function TowerDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { state } = useAppStore();
  
  const [tower, setTower] = useState<Tower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const initialTab = searchParams.get("tab") || "vitals";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null;
      setTeacherId(userId);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id ?? null;
      setTeacherId(userId);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id && teacherId) {
      fetchTower();
    }
  }, [id, teacherId]);

  const fetchTower = async () => {
    if (!id || !teacherId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("towers")
        .select("*")
        .eq("id", id)
        .eq("teacher_id", teacherId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError("Tower not found or you do not have permission to view it.");
        } else {
          throw fetchError;
        }
        return;
      }

      setTower(data);
    } catch (error: any) {
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

// Enhanced Pest Identification Modal with Fixed Messages
interface PestIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pest: PestCatalogItem | null) => void;
  towerLocation?: string;
}

function PestIdentificationModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  towerLocation = "classroom" 
}: PestIdentificationModalProps) {
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
    const fetchPestCatalog = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('pest_catalog')
          .select('*')
          .eq('safe_for_schools', true)
          .order('name', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setPestCatalog(data || []);
      } catch (err) {
        console.error('Error fetching pest catalog:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pest catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchPestCatalog();
  }, [isOpen]);

  const filteredPests = pestCatalog.filter(pest => {
    const matchesSearch = pest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pest.scientific_name && pest.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || pest.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handlePestSelect = (pest: PestCatalogItem) => {
    setSelectedPest(pest);
    setActiveTab('details');
    setContentTab('identification');
  };

  const handleUseCustom = () => {
    if (onSelect) {
      onSelect(null);
    }
    onClose();
  };

  const handleUsePest = () => {
    if (onSelect && selectedPest) {
      onSelect(selectedPest);
    }
    onClose();
  };

  const resetModal = () => {
    setActiveTab('browse');
    setSearchTerm('');
    setSelectedType('all');
    setSelectedPest(null);
    setContentTab('identification');
    setError(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-xl"
        >
          <span className="sr-only">Close</span>
          ✕
        </button>
        
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Pest Identification
          </h2>
          <p className="text-sm text-muted-foreground">
            Search and select a pest from our database or enter a custom observation.
            Showing recommendations suitable for {towerLocation} growing.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <div className="grid w-full grid-cols-2 mb-4">
            <button
              onClick={() => setActiveTab('browse')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === 'browse' ? 'bg-background text-foreground shadow-sm' : ''
              }`}
            >
              Browse Catalog
            </button>
            <button
              onClick={() => setActiveTab('details')}
              disabled={!selectedPest}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === 'details' ? 'bg-background text-foreground shadow-sm' : ''
              }`}
            >
              {selectedPest ? selectedPest.name : "Issue Details"}
            </button>
          </div>

          {activeTab === 'browse' && (
            <div className="space-y-4 flex-1 overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, symptoms, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pest', 'disease', 'nutrient', 'environmental'].map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                      className="capitalize"
                    >
                      {type !== 'all' && getTypeIcon(type)}
                      <span className="ml-1">
                        {type === 'all' ? 'All' : 
                         type === 'pest' ? 'Pests' : 
                         type === 'disease' ? 'Diseases' : 
                         type === 'nutrient' ? 'Nutrients' :
                         'Environmental'}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3 mt-2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Error Loading Catalog</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              )}

              {!loading && !error && (
                <>
                  <ScrollArea className="flex-1 pr-4" style={{ height: 'calc(90vh - 300px)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                      {filteredPests.map((pest) => (
                        <Card 
                          key={pest.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedPest?.id === pest.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handlePestSelect(pest)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{pest.name}</CardTitle>
                                {pest.scientific_name && (
                                  <p className="text-sm text-muted-foreground italic">
                                    {pest.scientific_name}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <Badge variant="secondary" className={getTypeColor(pest.type)}>
                                  {getTypeIcon(pest.type)}
                                  <span className="ml-1 capitalize">{pest.type}</span>
                                </Badge>
                                {pest.video_url && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    <Video className="h-3 w-3 mr-1" />
                                    Video
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {pest.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {filteredPests.length === 0 && !loading && (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No matches found</h3>
                        <p className="text-muted-foreground mb-4">
                          Try adjusting your search terms or use a custom observation.
                        </p>
                        <Button onClick={handleUseCustom}>
                          Enter Custom Observation
                        </Button>
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={handleUseCustom}>
                      Use Custom
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUsePest} 
                        disabled={!selectedPest}
                      >
                        Use Selected
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'details' && selectedPest && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{selectedPest.name}</h3>
                  {selectedPest.scientific_name && (
                    <p className="text-muted-foreground italic">{selectedPest.scientific_name}</p>
                  )}
                </div>
                <Badge className={getTypeColor(selectedPest.type)}>
                  {getTypeIcon(selectedPest.type)}
                  <span className="ml-1 capitalize">{selectedPest.type}</span>
                </Badge>
              </div>

              <Tabs value={contentTab} onValueChange={setContentTab} className="flex-1 overflow-hidden">
                <div className="grid w-full grid-cols-6 mb-4">
                  <button
                    onClick={() => setContentTab('identification')}
                    className={`flex items-center gap-1 justify-center whitespace-nowrap rounded-sm px-2 py-1.5 text-xs font-medium ${
                      contentTab === 'identification' ? 'bg-background text-foreground shadow-sm' : ''
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">ID</span>
                  </button>
                  <button
                    onClick={() => setContentTab('damage')}
                    className={`flex items-center gap-1 justify-center whitespace-nowrap rounded-sm px-2 py-1.5 text-xs font-medium ${
                      contentTab === 'damage' ? 'bg-background text-foreground shadow-sm' : ''
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span className="hidden sm:inline">Damage</span>
                  </button>
                  <button
                    onClick={() => setContentTab('remedies')}
                    className={`flex items-center gap-1 justify-center whitespace-nowrap rounded-sm px-2 py-1.5 text-xs font-medium ${
                      contentTab === 'remedies' ? 'bg-background text-foreground shadow-sm' : ''
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    <span className="hidden sm:inline">Remedies</span>
                  </button>
                  <button
                    onClick={() => setContentTab('management')}
                    className={`flex items-center gap-1 justify-center whitespace-nowrap rounded-sm px-2 py-1.5 text-xs font-medium ${
                      contentTab === 'management' ? 'bg-background text-foreground shadow-sm' : ''
                    }`}
                  >
                    <Target className="h-3 w-3" />
                    <span className="hidden sm:inline">Manage</span>
                  </button>
                  <button
                    onClick={() => setContentTab('prevention')}
                    className={`flex items-center gap-1 justify-center whitespace-nowrap rounded-sm px-2 py-1.5 text-xs font-medium ${
                      contentTab === 'prevention' ? 'bg-background text-foreground shadow-sm' : ''
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    <span className="hidden sm:inline">Prevent</span>
                  </button>
                  <button
                    onClick={() => setContentTab('video')}
                    className={`flex items-center gap-1 justify-center whitespace-nowrap rounded-sm px-2 py-1.5 text-xs font-medium ${
                      contentTab === 'video' ? 'bg-background text-foreground shadow-sm' : ''
                    }`}
                  >
                    <Video className="h-3 w-3" />
                    <span className="hidden sm:inline">Video</span>
                  </button>
                </div>

                <ScrollArea className="flex-1 pr-4" style={{ height: 'calc(90vh - 400px)' }}>
                  {contentTab === 'identification' && (
                    <div className="space-y-4 pb-4">
                      <div>
                        <h4 className="font-semibold mb-2">What are {selectedPest.name}?</h4>
                        <p className="text-muted-foreground">{selectedPest.description}</p>
                      </div>
                      {selectedPest.appearance_details && (
                        <div>
                          <h4 className="font-semibold mb-2">What do {selectedPest.name} look like?</h4>
                          <p className="text-muted-foreground">{selectedPest.appearance_details}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {contentTab === 'damage' && (
                    <div className="space-y-4 pb-4">
                      <div>
                        <h4 className="font-semibold mb-2">Damage Caused</h4>
                        {selectedPest.damage_caused && selectedPest.damage_caused.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {selectedPest.damage_caused.map((damage, index) => (
                              <li key={index} className="text-muted-foreground">{damage}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No specific damage information available.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {contentTab === 'remedies' && (
                    <div className="space-y-4 pb-4">
                      <div>
                        <h4 className="font-semibold mb-2">School-Safe Treatment Options</h4>
                        {selectedPest.omri_remedies && selectedPest.omri_remedies.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {selectedPest.omri_remedies.map((remedy, index) => (
                              <li key={index} className="text-muted-foreground">{remedy}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No specific remedy information available.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {contentTab === 'management' && (
                    <div className="space-y-4 pb-4">
                      <div>
                        <h4 className="font-semibold mb-2">Management Strategies</h4>
                        {selectedPest.management_strategies && selectedPest.management_strategies.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {selectedPest.management_strategies.map((strategy, index) => (
                              <li key={index} className="text-muted-foreground">{strategy}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No specific management information available.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {contentTab === 'prevention' && (
                    <div className="space-y-4 pb-4">
                      <div>
                        <h4 className="font-semibold mb-2">Prevention Methods</h4>
                        {selectedPest.prevention_methods && selectedPest.prevention_methods.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {selectedPest.prevention_methods.map((method, index) => (
                              <li key={index} className="text-muted-foreground">{method}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No specific prevention information available.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {contentTab === 'video' && (
                    <div className="space-y-4 pb-4">
                      {selectedPest.video_url ? (
                        <VideoPlayer 
                          src={selectedPest.video_url} 
                          title={`${selectedPest.name} - Identification & Management`}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-blue-50 rounded-full">
                              <PlayCircle className="h-12 w-12 text-blue-500" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium mb-2">Overview Video Coming Soon!</h3>
                              <p className="text-muted-foreground text-center max-w-md">
                                We're working on creating educational videos for all pest identification guides. 
                                Check back soon for visual learning resources.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </Tabs>

              <div className="flex justify-between pt-4 border-t mt-4">
                <Button variant="outline" onClick={() => setActiveTab('browse')}>
                  Back to Browse
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleUsePest}>
                    Use This Issue
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}

// Scouting Tab Component
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

  useEffect(() => {
    loadActiveEntries();
  }, [towerId, teacherId]);

  const loadActiveEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('pest_logs')
        .select('*')
        .eq('tower_id', towerId)
        .eq('teacher_id', teacherId)
        .order('observed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActiveEntries(data || []);
    } catch (error) {
      console.error('Error loading active scouting entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePestSelection = (selectedPest: PestCatalogItem | null) => {
    if (selectedPest) {
      setPest(selectedPest.name);
      setSelectedFromCatalog(selectedPest);
      toast({
        title: "Pest selected",
        description: `Selected ${selectedPest.name} from catalog.`,
      });
    } else {
      setPest("");
      setSelectedFromCatalog(null);
      toast({
        title: "Custom entry",
        description: "You can now enter a custom observation.",
      });
    }
    setShowModal(false);
  };

  const addPestLog = async () => {
    if (!pest.trim()) {
      toast({
        title: "Observation required",
        description: "Please enter an observation or select from catalog.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('pest_logs')
        .insert({
          tower_id: towerId,
          teacher_id: teacherId,
          pest: pest.trim(),
          action: action || null,
          notes: notes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setActiveEntries(prev => [data, ...prev]);
      
      setPest("");
      setAction("");
      setNotes("");
      setSelectedFromCatalog(null);
      
      toast({
        title: "Observation logged",
        description: "Scouting observation has been recorded successfully.",
      });
      
      onScoutingSaved();
    } catch (error) {
      console.error('Error adding pest log:', error);
      toast({
        title: "Error logging observation",
        description: "Failed to log observation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const clearSelection = () => {
    setPest("");
    setSelectedFromCatalog(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pest': return <Bug className="h-3 w-3" />;
      case 'disease': return <Microscope className="h-3 w-3" />;
      case 'nutrient': return <Droplets className="h-3 w-3" />;
      case 'environmental': return <Sun className="h-3 w-3" />;
      default: return <Bug className="h-3 w-3" />;
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

  return (
    <div className="space-y-6">
      <PestIdentificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handlePestSelection}
        towerLocation={towerLocation}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Log Scouting Observation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Observation/Issue</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                {selectedFromCatalog ? (
                  <div className="p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(selectedFromCatalog.type)}>
                            {getTypeIcon(selectedFromCatalog.type)}
                            <span className="ml-1 capitalize">{selectedFromCatalog.type}</span>
                          </Badge>
                          <span className="font-medium">{selectedFromCatalog.name}</span>
                        </div>
                        {selectedFromCatalog.scientific_name && (
                          <p className="text-sm text-muted-foreground italic">
                            {selectedFromCatalog.scientific_name}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedFromCatalog.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Textarea 
                    value={pest} 
                    onChange={(e) => setPest(e.target.value)} 
                    placeholder="Enter custom observation (e.g., Small white flies on kale leaves)" 
                    className="min-h-[80px]"
                  />
                )}
              </div>
              {!selectedFromCatalog && (
                <Button
                  variant="outline"
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Browse Catalog
                </Button>
              )}
            </div>
            {!selectedFromCatalog && (
              <p className="text-xs text-muted-foreground">
                Tip: Use "Browse Catalog" for detailed identification help and treatment recommendations.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Action Taken (Optional)</Label>
            <Textarea 
              value={action} 
              onChange={(e) => setAction(e.target.value)} 
              placeholder="What action did you take? (e.g., Applied insecticidal soap, Released beneficial insects)" 
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Any additional observations or details..." 
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Browse Catalog
            </Button>
            <Button 
              onClick={addPestLog} 
              disabled={submitting || !pest.trim()}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Observation"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observation History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : activeEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No observations yet.</p>
              <p className="text-sm">Great news! Your tower appears healthy.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeEntries.map((entry) => (
                <div key={entry.id} className="p-4 border rounded-md hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Bug className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{entry.pest}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.observed_at).toLocaleDateString()} at {' '}
                          {new Date(entry.observed_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      {entry.action && (
                        <div className="text-sm mt-2">
                          <span className="font-medium text-green-700">Action taken:</span>
                          <span className="ml-2">{entry.action}</span>
                        </div>
                      )}
                      
                      {entry.notes && (
                        <div className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium">Notes:</span>
                          <span className="ml-2">{entry.notes}</span>
                        </div>
                      )}
                    </div>
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

// Plants Tab Component (keeping existing implementation)
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