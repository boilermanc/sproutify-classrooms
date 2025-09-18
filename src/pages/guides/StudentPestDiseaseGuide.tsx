// src/pages/guides/StudentPestDiseaseGuide.tsx - COMPLETE STUDENT VERSION

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Users, TrendingUp, Download, Share2, CheckCircle, Bug, PlayCircle, ArrowRight,
  ClipboardList, Search, Microscope, Droplets, Sun, Loader2, AlertTriangle, Eye, Shield,
  Target, Video as VideoIcon, GraduationCap, Leaf, Lightbulb, Camera, Award, Plus
} from "lucide-react";

/* =========================
   COPY THE EXACT SAME COMPONENTS FROM TEACHER VERSION
   (This assumes you'll extract them to a shared file)
   ========================= */
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

interface PestIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pest: PestCatalogItem | null) => void;
  towerLocation?: string;
  returnUrl?: string;
}

function PestIdentificationModal({ isOpen, onClose, onSelect, towerLocation = "classroom", returnUrl }: PestIdentificationModalProps) {
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
            <h2 className="text-lg font-semibold flex items-center gap-2"><GraduationCap className="h-5 w-5" />Garden Learning Guide</h2>
            <p className="text-sm text-muted-foreground">Explore and learn about garden pests and diseases to become a better observer!</p>
          </div>
  
          <Tabs value={activeTab} onValueChange={setActiveTab} className="overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse & Learn</TabsTrigger>
              <TabsTrigger value="details" disabled={!selectedPest}>{selectedPest ? selectedPest.name : "Learning Details"}</TabsTrigger>
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
                  <div className="flex justify-end pt-4 border-t">
                    <div className="space-x-2"><Button variant="outline" onClick={onClose}>Close</Button></div>
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
                    <TabsList className="grid w-full grid-cols-6"><TabsTrigger value="identification"><Eye className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Look For</span></TabsTrigger><TabsTrigger value="damage"><AlertTriangle className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Effects</span></TabsTrigger><TabsTrigger value="remedies"><Shield className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Treatments</span></TabsTrigger><TabsTrigger value="management"><Target className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Manage</span></TabsTrigger><TabsTrigger value="prevention"><Shield className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Prevent</span></TabsTrigger><TabsTrigger value="video"><VideoIcon className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Video</span></TabsTrigger></TabsList>
                    <ScrollArea className="pr-4 mt-4" style={{ height: 'calc(90vh - 400px)' }}>
                      <TabsContent value="identification" className="space-y-4 pb-4"><div><h4 className="font-semibold mb-2">What Is This?</h4><p className="text-muted-foreground">{selectedPest.description}</p></div>{selectedPest.appearance_details && <div><h4 className="font-semibold mb-2">What to Look For</h4><p className="text-muted-foreground">{selectedPest.appearance_details}</p></div>}</TabsContent>
                      <TabsContent value="damage" className="space-y-4 pb-4"><div><h4 className="font-semibold mb-2">How It Affects Plants</h4>{selectedPest.damage_caused?.length ? <ul className="list-disc list-inside space-y-1">{selectedPest.damage_caused.map((d, i) => <li key={i} className="text-muted-foreground">{d}</li>)}</ul> : <p className="text-muted-foreground">Ask your teacher about how this affects plants</p>}</div></TabsContent>
                      <TabsContent value="remedies" className="space-y-4 pb-4"><div><h4 className="font-semibold mb-2">Safe Treatment Options</h4>{selectedPest.omri_remedies?.length ? <ul className="list-disc list-inside space-y-1">{selectedPest.omri_remedies.map((r, i) => <li key={i} className="text-muted-foreground">{r}</li>)}</ul> : <p className="text-muted-foreground">Always ask your teacher about treatment options</p>}<div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-sm text-yellow-800"><strong>Remember:</strong> Never apply treatments yourself - always ask your teacher first!</p></div></div></TabsContent>
                      <TabsContent value="management" className="space-y-4 pb-4"><div><h4 className="font-semibold mb-2">How to Manage This Problem</h4>{selectedPest.management_strategies?.length ? <ul className="list-disc list-inside space-y-1">{selectedPest.management_strategies.map((s, i) => <li key={i} className="text-muted-foreground">{s}</li>)}</ul> : <p className="text-muted-foreground">Discuss management strategies with your teacher</p>}</div></TabsContent>
                      <TabsContent value="prevention" className="space-y-4 pb-4"><div><h4 className="font-semibold mb-2">How to Prevent This Problem</h4>{selectedPest.prevention_methods?.length ? <ul className="list-disc list-inside space-y-1">{selectedPest.prevention_methods.map((p, i) => <li key={i} className="text-muted-foreground">{p}</li>)}</ul> : <p className="text-muted-foreground">Learn prevention methods from your teacher</p>}</div></TabsContent>
                      <TabsContent value="video" className="space-y-4 pb-4">{selectedPest.video_url ? <VideoPlayer src={selectedPest.video_url} title="Educational Video" /> : <div className="text-center py-8 text-muted-foreground">Educational video coming soon!</div>}</TabsContent>
                    </ScrollArea>
                  </Tabs>
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={() => setActiveTab('browse')}>Back to Browse</Button>
                    <div className="space-x-2">
                      {returnUrl && (
                        <Button 
                          onClick={() => {
                            const url = new URL(returnUrl);
                            url.searchParams.set('selectedPestId', selectedPest.id);
                            url.searchParams.set('selectedPestName', selectedPest.name);
                            window.location.href = url.toString();
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Form
                        </Button>
                      )}
                      <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
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
   Student-Focused Main Component
   ========================= */
export default function StudentPestDiseaseGuide() {
  const [searchParams] = useSearchParams();
  const [showGuideModal, setShowGuideModal] = useState(false);
  
  const returnUrl = searchParams.get('returnUrl');
  const towerId = searchParams.get('towerId');

  const learningGoals = [
    {
      icon: Eye,
      title: "Sharp Observation Skills",
      description: "Learn to notice tiny details and describe what you see using scientific language"
    },
    {
      icon: Bug,
      title: "Pest Detective Skills",
      description: "Become an expert at spotting different insects and knowing which ones help or hurt plants"
    },
    {
      icon: Leaf,
      title: "Plant Health Expert",
      description: "Understand how different problems affect plant growth and what healthy plants should look like"
    },
    {
      icon: Shield,
      title: "Safe Solutions",
      description: "Learn about organic, school-safe ways to help plants stay healthy and strong"
    }
  ];

  const studentTips = [
    {
      title: "Before You Start Observing",
      tips: [
        "Wash your hands and get your observation tools ready",
        "Look at this guide first to know what to search for",
        "Work with a partner - two sets of eyes are better than one!",
        "Take pictures if you can for closer examination later"
      ]
    },
    {
      title: "While Observing Your Tower",
      tips: [
        "Check both the tops and undersides of leaves carefully",
        "Look for tiny insects, spots, holes, or unusual colors",
        "Use a magnifying glass or your phone camera to zoom in",
        "Check multiple plants, not just one - problems can spread"
      ]
    },
    {
      title: "After Your Observations",
      tips: [
        "Use this guide to identify what you found",
        "Write detailed descriptions using proper scientific terms",
        "Discuss your findings with classmates and your teacher",
        "Always ask your teacher before taking any action"
      ]
    }
  ];

  return (
    <div className="container py-8 space-y-8">
      <SEO title="Garden Learning Guide | Sproutify School" />
      
      {/* Student-Friendly Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-xl">
            <GraduationCap className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-green-900">Garden Learning Guide</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Become a plant detective! Learn to spot and identify common garden visitors and plant problems.
        </p>
        <Button onClick={() => setShowGuideModal(true)} size="lg" className="mt-6">
          <Search className="mr-2 h-5 w-5" />
          Start Learning Adventure
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Learning Goals - Student Focused */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Award className="h-5 w-5" />
            What You'll Master
          </CardTitle>
          <CardDescription className="text-green-700">
            Skills you'll develop to become an expert plant observer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {learningGoals.map((goal, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-green-200 p-3 rounded-lg">
                  <goal.icon className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">{goal.title}</h3>
                  <p className="text-sm text-green-700 mt-1">
                    {goal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Tips for Success
          </CardTitle>
          <CardDescription>
            How to be the best plant detective in your class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {studentTips.map((section, index) => (
              <div key={index}>
                <h3 className="font-medium mb-3 text-blue-800">{section.title}</h3>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Activities */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Bug className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="font-semibold mb-2">Insect Explorer</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discover different insects and learn which ones help or hurt your plants
            </p>
            <Button variant="outline" onClick={() => setShowGuideModal(true)}>
              Explore Insects
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Microscope className="h-12 w-12 mx-auto mb-4 text-purple-500" />
            <h3 className="font-semibold mb-2">Disease Detective</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn to spot plant diseases and understand how they spread
            </p>
            <Button variant="outline" onClick={() => setShowGuideModal(true)}>
              Investigate Diseases
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <VideoIcon className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="font-semibold mb-2">Video Lessons</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Watch cool videos to see pests and diseases up close
            </p>
            <Button variant="outline" onClick={() => setShowGuideModal(true)}>
              Watch & Learn
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Safety Reminder for Students */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-8 w-8 text-yellow-600 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-3">Important Safety Reminders</h3>
              <div className="space-y-2 text-sm text-yellow-800">
                <p><strong>🔍 Observe Only:</strong> This guide is for learning and identifying - never touch or try to remove pests yourself.</p>
                <p><strong>👩‍🏫 Ask Your Teacher:</strong> Always discuss what you find with your teacher before taking any action.</p>
                <p><strong>🧼 Stay Clean:</strong> Wash your hands before and after observing plants.</p>
                <p><strong>📝 Keep Records:</strong> Write down what you see - good scientists keep detailed notes!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Use Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            How to Use This Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="bg-blue-500 text-white rounded-full p-2 text-sm font-bold w-8 h-8 flex items-center justify-center">1</div>
                <div>
                  <h4 className="font-medium">Browse & Search</h4>
                  <p className="text-sm text-muted-foreground">Look through different categories or search for specific things</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="bg-purple-500 text-white rounded-full p-2 text-sm font-bold w-8 h-8 flex items-center justify-center">2</div>
                <div>
                  <h4 className="font-medium">Learn the Details</h4>
                  <p className="text-sm text-muted-foreground">Click on items to learn what to look for and how they affect plants</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="bg-green-500 text-white rounded-full p-2 text-sm font-bold w-8 h-8 flex items-center justify-center">3</div>
                <div>
                  <h4 className="font-medium">Watch Videos</h4>
                  <p className="text-sm text-muted-foreground">See real examples through educational videos</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="bg-orange-500 text-white rounded-full p-2 text-sm font-bold w-8 h-8 flex items-center justify-center">4</div>
                <div>
                  <h4 className="font-medium">Apply Your Knowledge</h4>
                  <p className="text-sm text-muted-foreground">Use what you learned when observing your tower plants</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Modal - Same functionality as teacher, student-friendly labels */}
      <PestIdentificationModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onSelect={() => setShowGuideModal(false)}
        towerLocation="classroom"
        returnUrl={returnUrl || undefined}
      />
    </div>
  );
}