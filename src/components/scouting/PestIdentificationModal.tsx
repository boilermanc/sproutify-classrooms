// src/components/scouting/PestIdentificationModal.tsx

import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Bug, 
  Leaf, 
  Droplets, 
  Thermometer,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface PestCatalogItem {
  id: string;
  name: string;
  scientific_name?: string;
  type: 'insect' | 'disease' | 'nutrient' | 'environmental';
  description: string;
  identification_tips: string[];
  symptoms: string[];
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
  prevention_tips: string[];
  seasonal_info?: string;
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

  const handlePestSelect = (pest: PestCatalogItem) => {
    setSelectedPest(pest);
    setActiveTab("details");
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
    }
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Pest & Issue Identification Guide
          </DialogTitle>
          <DialogDescription>
            Use this visual guide to identify common hydroponic issues. 
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

          <TabsContent value="browse" className="space-y-4 h-[500px]">
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
            <ScrollArea className="h-[400px] pr-4">
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
                        <Badge className={getTypeColor(pest.type)}>
                          {getTypeIcon(pest.type)}
                          <span className="ml-1 capitalize">{pest.type}</span>
                        </Badge>
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

          <TabsContent value="details" className="space-y-4 h-[500px]">
            {selectedPest && (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPest.name}</h2>
                      {selectedPest.scientific_name && (
                        <p className="text-muted-foreground italic">
                          {selectedPest.scientific_name}
                        </p>
                      )}
                      <Badge className={`mt-2 ${getTypeColor(selectedPest.type)}`}>
                        {getTypeIcon(selectedPest.type)}
                        <span className="ml-1 capitalize">{selectedPest.type}</span>
                      </Badge>
                    </div>
                    <Button onClick={() => setActiveTab("browse")} variant="ghost" size="sm">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Browse
                    </Button>
                  </div>

                  {/* Image Carousel */}
                  {pestImages.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium">Visual Identification</h3>
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
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedPest.description}</p>
                  </div>

                  {/* Identification Tips */}
                  <div>
                    <h3 className="font-medium mb-2">How to Identify</h3>
                    <ul className="space-y-2">
                      {selectedPest.identification_tips.map((tip, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <h3 className="font-medium mb-2">Symptoms to Look For</h3>
                    <ul className="space-y-2">
                      {selectedPest.symptoms.map((symptom, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Severity Levels */}
                  {selectedPest.severity_levels.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Severity Assessment</h3>
                      <div className="space-y-2">
                        {selectedPest.severity_levels.map((level) => (
                          <div key={level.level} className="flex items-center p-3 border rounded-lg">
                            <div className={`w-3 h-3 rounded-full mr-3 bg-${level.color}-500`}></div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                Level {level.level}: {level.description}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Action: {level.action}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prevention Tips */}
                  <div>
                    <h3 className="font-medium mb-2">Prevention Tips</h3>
                    <ul className="space-y-2">
                      {selectedPest.prevention_tips.map((tip, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Seasonal Info */}
                  {selectedPest.seasonal_info && (
                    <div>
                      <h3 className="font-medium mb-2">Seasonal Information</h3>
                      <p className="text-sm text-muted-foreground">{selectedPest.seasonal_info}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-4 border-t">
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
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}