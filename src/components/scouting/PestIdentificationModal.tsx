// src/components/scouting/PestIdentificationModal.tsx

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Bug, 
  Leaf, 
  Droplets, 
  Thermometer,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Eye,
  AlertTriangle,
  Shield,
  Zap,
  PlayCircle
} from "lucide-react";

interface PestCatalogItem {
  id: string;
  name: string;
  scientific_name?: string;
  type: 'insect' | 'disease' | 'nutrient' | 'environmental';
  description: string;
  identification_tips: string[];
  appearance_details?: string; // Detailed appearance description
  symptoms: string[];
  damage_caused?: string[]; // What damage this pest causes
  severity_levels: Array<{
    level: number;
    description: string;
    color: string;
    action: string;
  }>;
  treatment_options: Array<{
    method: string;
    safe_for_schools: boolean;
    effectiveness: 'low' | 'medium' | 'high';
    location_suitable: string[];
    instructions: string;
    materials?: string[];
    precautions?: string[];
  }>;
  omri_remedies?: string[]; // OMRI-approved specific treatments
  management_strategies?: string[]; // General management approaches
  prevention_methods?: string[]; // How to prevent this pest
  prevention_tips: string[];
  seasonal_info?: string;
  video_url?: string; // URL to educational video
}

interface PestCatalogImage {
  id: string;
  image_url: string;
  caption?: string;
  image_type: 'symptom' | 'pest' | 'treatment' | 'lifecycle';
}

interface PestIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPest: (pest: PestCatalogItem) => void;
  pestCatalog: PestCatalogItem[];
  towerLocation: 'indoor' | 'greenhouse' | 'outdoor';
}

export function PestIdentificationModal({
  isOpen,
  onClose,
  onSelectPest,
  pestCatalog,
  towerLocation
}: PestIdentificationModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPest, setSelectedPest] = useState<PestCatalogItem | null>(null);
  const [pestImages, setPestImages] = useState<PestCatalogImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("browse");
  const [detailsTab, setDetailsTab] = useState("identification");
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filter pest catalog based on search and type
  const filteredPests = pestCatalog.filter(pest => {
    const matchesSearch = searchTerm === "" || 
      pest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pest.identification_tips.some(tip => tip.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pest.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "all" || pest.type === selectedType;
    
    // Only show pests with treatments suitable for this tower location
    const hasAppropriateTreatment = pest.treatment_options.some(treatment => 
      treatment.safe_for_schools && treatment.location_suitable.includes(towerLocation)
    );
    
    return matchesSearch && matchesType && hasAppropriateTreatment;
  });

  // Load images for selected pest
  useEffect(() => {
    if (selectedPest) {
      loadPestImages(selectedPest.id);
      resetVideoPlayer();
    }
  }, [selectedPest]);

  const loadPestImages = async (pestId: string) => {
    try {
      const { data, error } = await supabase
        .from('pest_catalog_images')
        .select('*')
        .eq('pest_catalog_id', pestId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setPestImages(data || []);
      setCurrentImageIndex(0);
    } catch (error) {
      console.error('Error loading pest images:', error);
      setPestImages([]);
    }
  };

  const resetVideoPlayer = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handlePestSelect = (pest: PestCatalogItem) => {
    setSelectedPest(pest);
    setActiveTab("details");
    setDetailsTab("identification");
  };

  const handleConfirmSelection = () => {
    if (selectedPest) {
      onSelectPest(selectedPest);
      onClose();
      // Reset state
      setSelectedPest(null);
      setSearchTerm("");
      setSelectedType("all");
      setActiveTab("browse");
      setDetailsTab("identification");
    }
  };

  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const nextImage = () => {
    if (pestImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % pestImages.length);
    }
  };

  const prevImage = () => {
    if (pestImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + pestImages.length) % pestImages.length);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'insect': return <Bug className="h-4 w-4" />;
      case 'disease': return <Leaf className="h-4 w-4" />;
      case 'nutrient': return <Droplets className="h-4 w-4" />;
      case 'environmental': return <Thermometer className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insect': return 'bg-red-100 text-red-800';
      case 'disease': return 'bg-orange-100 text-orange-800';
      case 'nutrient': return 'bg-blue-100 text-blue-800';
      case 'environmental': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Pest & Disease Identification Guide
          </DialogTitle>
          <DialogDescription>
            Comprehensive guide for identifying and managing hydroponic pests and diseases. 
            Showing recommendations suitable for {towerLocation} growing.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Catalog</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedPest}>
              {selectedPest ? selectedPest.name : "Issue Details"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4 h-[600px]">
            {/* Search and Filter Controls */}
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
              <div className="flex gap-2">
                {['all', 'insect', 'disease', 'nutrient', 'environmental'].map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="capitalize"
                  >
                    {type !== 'all' && getTypeIcon(type)}
                    <span className="ml-1">{type}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Pest Grid */}
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPests.map((pest) => (
                  <Card 
                    key={pest.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPest?.id === pest.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handlePestSelect(pest)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{pest.name}</h3>
                        <div className="flex gap-2">
                          <Badge className={getTypeColor(pest.type)}>
                            {getTypeIcon(pest.type)}
                            <span className="ml-1 capitalize">{pest.type}</span>
                          </Badge>
                          {pest.video_url && (
                            <Badge variant="outline" className="text-blue-600">
                              <PlayCircle className="h-3 w-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {pest.scientific_name && (
                        <p className="text-sm text-muted-foreground italic mb-2">
                          {pest.scientific_name}
                        </p>
                      )}
                      
                      <p className="text-sm mb-3">{pest.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Key Signs
                          </h4>
                          <ul className="text-xs space-y-1 mt-1">
                            {pest.identification_tips.slice(0, 2).map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-1 h-1 bg-muted-foreground rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {pest.identification_tips.length > 2 && (
                          <p className="text-xs text-primary">
                            +{pest.identification_tips.length - 2} more signs...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredPests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No issues found matching your search.</p>
                  <p className="text-sm mt-2">Try different keywords or browse all categories.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 h-[600px]">
            {selectedPest && (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPest.name}</h2>
                    {selectedPest.scientific_name && (
                      <p className="text-muted-foreground italic">
                        {selectedPest.scientific_name}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge className={getTypeColor(selectedPest.type)}>
                        {getTypeIcon(selectedPest.type)}
                        <span className="ml-1 capitalize">{selectedPest.type}</span>
                      </Badge>
                      {selectedPest.video_url && (
                        <Badge variant="outline" className="text-blue-600">
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Educational Video Available
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab("browse")} variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Browse
                  </Button>
                </div>

                {/* Details Tabs */}
                <Tabs value={detailsTab} onValueChange={setDetailsTab} className="flex-1">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="identification" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Identification</span>
                    </TabsTrigger>
                    <TabsTrigger value="damage" className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="hidden sm:inline">Damage</span>
                    </TabsTrigger>
                    <TabsTrigger value="remedies" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Remedies</span>
                    </TabsTrigger>
                    <TabsTrigger value="management" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">Management</span>
                    </TabsTrigger>
                    <TabsTrigger value="prevention" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Prevention</span>
                    </TabsTrigger>
                    <TabsTrigger value="video" disabled={!selectedPest.video_url} className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Video</span>
                    </TabsTrigger>
                  </TabsList>

                  <ScrollArea className="flex-1 mt-4">
                    <TabsContent value="identification" className="mt-0 space-y-4">
                      {/* Image Carousel */}
                      {pestImages.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Visual Identification</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="relative">
                              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={pestImages[currentImageIndex].image_url}
                                  alt={pestImages[currentImageIndex].caption || `${selectedPest.name} identification`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {pestImages.length > 1 && (
                                <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between">
                                  <Button
                                    onClick={prevImage}
                                    variant="secondary"
                                    size="icon"
                                    className="opacity-80 hover:opacity-100"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={nextImage}
                                    variant="secondary"
                                    size="icon"
                                    className="opacity-80 hover:opacity-100"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              {pestImages[currentImageIndex].caption && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {pestImages[currentImageIndex].caption}
                                </p>
                              )}
                              {pestImages.length > 1 && (
                                <div className="flex justify-center mt-2 space-x-1">
                                  {pestImages.map((_, index) => (
                                    <button
                                      key={index}
                                      onClick={() => setCurrentImageIndex(index)}
                                      className={`w-2 h-2 rounded-full transition-colors ${
                                        index === currentImageIndex ? 'bg-primary' : 'bg-muted'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Description */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">What are {selectedPest.name}?</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed">{selectedPest.description}</p>
                        </CardContent>
                      </Card>

                      {/* Appearance Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">What do {selectedPest.name} Look Like?</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed mb-4">
                            {selectedPest.appearance_details || "Detailed appearance information not available."}
                          </p>
                          
                          <h4 className="font-medium mb-2">Key Identification Features:</h4>
                          <ul className="space-y-2">
                            {selectedPest.identification_tips.map((tip, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <span className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Symptoms */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Symptoms to Look For</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedPest.symptoms.map((symptom, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="damage" className="mt-0 space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Damage Caused by {selectedPest.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedPest.damage_caused && selectedPest.damage_caused.length > 0 ? (
                            <ul className="space-y-3">
                              {selectedPest.damage_caused.map((damage, index) => (
                                <li key={index} className="flex items-start">
                                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                                  <span className="text-sm">{damage}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Specific damage information is not available for this issue.
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Severity Assessment */}
                      {selectedPest.severity_levels.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Severity Assessment</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedPest.severity_levels.map((level) => (
                                <div key={level.level} className="flex items-center p-3 border rounded-lg">
                                  <div className={`w-4 h-4 rounded-full mr-3 bg-${level.color}-500`}></div>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      Level {level.level}: {level.description}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Recommended Action: {level.action}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="remedies" className="mt-0 space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">OMRI Rated Remedies for {selectedPest.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Safe, organic treatments approved by the Organic Materials Review Institute
                          </p>
                        </CardHeader>
                        <CardContent>
                          {selectedPest.omri_remedies && selectedPest.omri_remedies.length > 0 ? (
                            <div className="space-y-3">
                              {selectedPest.omri_remedies.map((remedy, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
                                  <span className="text-sm flex-1">{remedy}</span>
                                  <Badge variant="secondary">OMRI</Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {selectedPest.treatment_options.filter(t => t.safe_for_schools).map((treatment, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{treatment.method}</div>
                                    <div className="text-xs text-muted-foreground">{treatment.instructions}</div>
                                  </div>
                                  <Badge className={
                                    treatment.effectiveness === 'high' ? 'bg-green-100 text-green-800' :
                                    treatment.effectiveness === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }>
                                    {treatment.effectiveness}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}

                          <Alert className="mt-4">
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Safety Reminder:</strong> Always read and follow label instructions. 
                              Even organic treatments should be applied with proper supervision and safety measures.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="management" className="mt-0 space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">How to Manage {selectedPest.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Integrated pest management approaches for effective control
                          </p>
                        </CardHeader>
                        <CardContent>
                          {selectedPest.management_strategies && selectedPest.management_strategies.length > 0 ? (
                            <div className="space-y-3">
                              <h4 className="font-medium">Management Strategies:</h4>
                              <ul className="space-y-3">
                                {selectedPest.management_strategies.map((strategy, index) => (
                                  <li key={index} className="flex items-start">
                                    <Zap className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-sm">{strategy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <h4 className="font-medium">Available Treatment Options:</h4>
                              <ul className="space-y-3">
                                {selectedPest.treatment_options.map((treatment, index) => (
                                  <li key={index} className="flex items-start">
                                    <Zap className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{treatment.method}</div>
                                      <div className="text-sm text-muted-foreground">{treatment.instructions}</div>
                                      {treatment.materials && treatment.materials.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {treatment.materials.map((material, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                              {material}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="prevention" className="mt-0 space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Prevention & Control Strategies</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Proactive measures to prevent {selectedPest.name} infestations
                          </p>
                        </CardHeader>
                        <CardContent>
                          {selectedPest.prevention_methods && selectedPest.prevention_methods.length > 0 ? (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Prevention Methods:</h4>
                                <ul className="space-y-2">
                                  {selectedPest.prevention_methods.map((method, index) => (
                                    <li key={index} className="flex items-start text-sm">
                                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                      {method}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <Separator />
                            </div>
                          ) : null}

                          <div>
                            <h4 className="font-medium mb-2">General Prevention Tips:</h4>
                            <ul className="space-y-2">
                              {selectedPest.prevention_tips.map((tip, index) => (
                                <li key={index} className="flex items-start text-sm">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {selectedPest.seasonal_info && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-medium mb-2">Seasonal Information:</h4>
                                <p className="text-sm text-muted-foreground">{selectedPest.seasonal_info}</p>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="video" className="mt-0 space-y-4">
                      {selectedPest.video_url ? (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Educational Video: {selectedPest.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Learn about identification, damage, and management through video demonstration
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Video Player */}
                              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                <video
                                  ref={videoRef}
                                  className="w-full h-full"
                                  onTimeUpdate={handleTimeUpdate}
                                  onLoadedMetadata={handleTimeUpdate}
                                  onEnded={() => setIsPlaying(false)}
                                >
                                  <source src={selectedPest.video_url} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                                
                                {/* Play/Pause Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Button
                                    onClick={togglePlay}
                                    size="lg"
                                    className="bg-black/50 hover:bg-black/70 text-white"
                                  >
                                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                  </Button>
                                </div>
                              </div>

                              {/* Video Controls */}
                              <div className="space-y-2">
                                {/* Progress Bar */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground w-12">
                                    {formatTime(currentTime)}
                                  </span>
                                  <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                  />
                                  <span className="text-xs text-muted-foreground w-12">
                                    {formatTime(duration)}
                                  </span>
                                </div>

                                {/* Control Buttons */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Button onClick={togglePlay} size="sm" variant="outline">
                                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>
                                    <Button onClick={toggleMute} size="sm" variant="outline">
                                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                  <Button size="sm" variant="outline">
                                    <Maximize className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Video Description */}
                              <Alert>
                                <PlayCircle className="h-4 w-4" />
                                <AlertDescription>
                                  This educational video demonstrates how to identify {selectedPest.name}, 
                                  recognize the damage they cause, and apply appropriate management techniques 
                                  suitable for hydroponic systems.
                                </AlertDescription>
                              </Alert>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <PlayCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              No educational video is currently available for {selectedPest.name}.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t mt-4">
                  <Button onClick={() => setActiveTab("browse")} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Choose Different Issue
                  </Button>
                  <Button onClick={handleConfirmSelection} className="bg-primary">
                    Select This Issue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}