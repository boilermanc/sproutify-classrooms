// src/pages/kiosk/StudentPestDiseaseForm.tsx

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Bug, Microscope, Droplets, Sun, Search, 
  ExternalLink, Plus, CheckCircle, AlertTriangle, Shield,
  Target, Video as VideoIcon, GraduationCap, Leaf, Eye
} from "lucide-react";
import { SEO } from "@/components/SEO";

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

export default function StudentPestDiseaseForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const towerId = searchParams.get("towerId");
  const teacherId = localStorage.getItem("teacher_id_for_tower");

  // Form state
  const [selectedPest, setSelectedPest] = useState<PestCatalogItem | null>(null);
  const [customPest, setCustomPest] = useState("");
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  // UI state
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [pestCatalog, setPestCatalog] = useState<PestCatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("catalog");

  // Load pest catalog on mount
  useEffect(() => {
    loadPestCatalog();
    
    // Check for URL parameters from learning guide
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPestId = urlParams.get('selectedPestId');
    const selectedPestName = urlParams.get('selectedPestName');
    
    if (selectedPestId && selectedPestName) {
      // Find the pest in the catalog and select it
      const pest = pestCatalog.find(p => p.id === selectedPestId);
      if (pest) {
        setSelectedPest(pest);
        setCustomPest(pest.name);
        setActiveTab("form");
      } else {
        // If not found in catalog, set as custom entry
        setCustomPest(selectedPestName);
        setActiveTab("form");
      }
      
      // Clean up URL parameters
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('selectedPestId');
      newUrl.searchParams.delete('selectedPestName');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [pestCatalog]);

  const loadPestCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from('pest_catalog')
        .select('*')
        .eq('safe_for_schools', true)
        .order('name');
      
      if (error) throw error;
      setPestCatalog(data || []);
    } catch (error) {
      console.error('Error loading pest catalog:', error);
      toast({
        title: "Error loading pest database",
        description: "Could not load pest identification data.",
        variant: "destructive"
      });
    }
  };

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

  const filteredPests = pestCatalog.filter(pest => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = pest.name.toLowerCase().includes(q) || 
                         pest.description.toLowerCase().includes(q) || 
                         (pest.scientific_name && pest.scientific_name.toLowerCase().includes(q));
    const matchesType = filterType === 'all' || pest.type === filterType;
    return matchesSearch && matchesType;
  });

  const handlePestSelect = (pest: PestCatalogItem) => {
    setSelectedPest(pest);
    setCustomPest(pest.name);
    setActiveTab("form");
  };

  const handleSave = async () => {
    if (!towerId || !teacherId || (!selectedPest && !customPest.trim())) {
      toast({ 
        title: "Error", 
        description: "Please select a pest/disease from the catalog or enter a custom observation.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      // Call the Edge Function to save the pest observation
      const { error } = await supabase.functions.invoke('student-log-pest', {
        body: { 
          towerId, 
          teacherId, 
          pest: selectedPest ? `${selectedPest.name}${selectedPest.scientific_name ? ` (${selectedPest.scientific_name})` : ''}` : customPest,
          action, 
          notes,
          pestId: selectedPest?.id || null
        },
      });
      
      if (error) throw error;
      
      toast({ 
        title: "Success!", 
        description: "Pest and disease observation has been logged." 
      }); 
      navigate(towerId ? `/student/tower/${towerId}` : "/student/dashboard");
    } catch (error: any) {
      toast({ 
        title: "Save Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const openLearningGuide = () => {
    const guideUrl = `http://100.96.83.5:8081/student/pest-disease-guide?returnUrl=${encodeURIComponent(window.location.href)}&towerId=${towerId}`;
    window.open(guideUrl, '_blank');
  };

  return (
    <div className="container py-8">
      <SEO title="Pest and Disease Observation | Sproutify School" />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Pest and Disease Observation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="catalog">Browse Catalog</TabsTrigger>
              <TabsTrigger value="form">Log Observation</TabsTrigger>
            </TabsList>

            <TabsContent value="catalog" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, symptoms..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pest', 'disease', 'nutrient', 'environmental'].map((type) => (
                    <Button 
                      key={type} 
                      variant={filterType === type ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setFilterType(type)}
                      className="capitalize"
                    >
                      {type !== 'all' && getTypeIcon(type)}
                      <span className="ml-1">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Select a pest or disease from the catalog, or use the learning guide for more information.
                </p>
                <Button variant="outline" onClick={openLearningGuide} size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learning Guide
                </Button>
              </div>

              <ScrollArea className="h-96 border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pest.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredPests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No matches found.
                  </div>
                )}
              </ScrollArea>

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("form")}
                  disabled={!selectedPest && !customPest.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Continue to Form
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="form" className="space-y-4">
              {selectedPest && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-green-900">{selectedPest.name}</h3>
                        {selectedPest.scientific_name && (
                          <p className="text-sm text-green-700 italic">
                            {selectedPest.scientific_name}
                          </p>
                        )}
                      </div>
                      <Badge className={getTypeColor(selectedPest.type)}>
                        {getTypeIcon(selectedPest.type)}
                        <span className="ml-1 capitalize">{selectedPest.type}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700 mt-2">{selectedPest.description}</p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label>Observation Description</Label>
                <Textarea 
                  value={customPest} 
                  onChange={(e) => setCustomPest(e.target.value)} 
                  required 
                  placeholder="Describe what you observed (e.g., Small white flies on the kale leaves, yellow spots on tomato leaves, etc.)" 
                />
              </div>

              <div className="space-y-2">
                <Label>Action Taken (Optional)</Label>
                <Textarea 
                  value={action} 
                  onChange={(e) => setAction(e.target.value)} 
                  placeholder="Describe any actions taken (e.g., Washed leaves with soapy water, removed affected leaves, etc.)" 
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Any extra details, questions, or observations..." 
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Observation"}
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("catalog")}>
                  Back to Catalog
                </Button>
                <Button variant="outline" asChild>
                  <Link to={towerId ? `/student/tower/${towerId}` : "/student/dashboard"}>
                    Cancel
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
