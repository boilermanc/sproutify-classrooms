// src/components/modals/PestIdentificationModal.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Bug, 
  Leaf, 
  Droplets, 
  Sun, 
  Video,
  AlertTriangle,
  Shield,
  Microscope,
  Eye,
  Target
} from 'lucide-react';

// Types
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

interface PestIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pest: PestCatalogItem | null) => void;
  towerLocation?: string;
}

// Helper functions
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

export function PestIdentificationModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  towerLocation = "classroom" 
}: PestIdentificationModalProps) {
  // State
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPest, setSelectedPest] = useState<PestCatalogItem | null>(null);
  const [contentTab, setContentTab] = useState('identification');
  const [pestCatalog, setPestCatalog] = useState<PestCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load pest catalog from database
  useEffect(() => {
    const fetchPestCatalog = async () => {
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
        
        console.log('Loaded pest catalog:', data); // Debug log
        setPestCatalog(data || []);
      } catch (err) {
        console.error('Error fetching pest catalog:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pest catalog');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPestCatalog();
    }
  }, [isOpen]);

  // Filter pests based on search and type
  const filteredPests = pestCatalog.filter(pest => {
    const matchesSearch = pest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pest.scientific_name && pest.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || pest.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Event handlers
  const handlePestSelect = (pest: PestCatalogItem) => {
    setSelectedPest(pest);
    setActiveTab('details');
    setContentTab('identification');
  };

  const handleUseCustom = () => {
    if (onSelect) {
      onSelect(null); // null indicates custom entry
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

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Pest Identification
          </DialogTitle>
          <DialogDescription>
            Search and select a pest from our database or enter a custom observation.
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

            {/* Loading State */}
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

            {/* Error State */}
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

            {/* Results Grid */}
            {!loading && !error && (
              <ScrollArea className="h-[450px] pr-4">
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
            )}

            {/* Action Buttons */}
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
          </TabsContent>

          <TabsContent value="details" className="h-[600px]">
            {selectedPest && (
              <div className="h-full flex flex-col">
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

                <Tabs value={contentTab} onValueChange={setContentTab} className="flex-1">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="identification" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span className="hidden sm:inline">ID</span>
                    </TabsTrigger>
                    <TabsTrigger value="damage" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="hidden sm:inline">Damage</span>
                    </TabsTrigger>
                    <TabsTrigger value="remedies" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span className="hidden sm:inline">Remedies</span>
                    </TabsTrigger>
                    <TabsTrigger value="management" className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span className="hidden sm:inline">Manage</span>
                    </TabsTrigger>
                    <TabsTrigger value="prevention" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span className="hidden sm:inline">Prevent</span>
                    </TabsTrigger>
                    <TabsTrigger value="video" disabled={!selectedPest.video_url} className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      <span className="hidden sm:inline">Video</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 mt-4">
                    <ScrollArea className="h-[400px] pr-4">
                      <TabsContent value="identification" className="space-y-4">
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
                      </TabsContent>

                      <TabsContent value="damage" className="space-y-4">
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
                      </TabsContent>

                      <TabsContent value="remedies" className="space-y-4">
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
                      </TabsContent>

                      <TabsContent value="management" className="space-y-4">
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
                      </TabsContent>

                      <TabsContent value="prevention" className="space-y-4">
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
                      </TabsContent>

                      <TabsContent value="video" className="space-y-4">
                        {selectedPest.video_url ? (
                          <div className="space-y-2">
                            <h4 className="font-semibold">Educational Video</h4>
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <p className="text-muted-foreground">Video player integration coming soon</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No video available for this issue.</p>
                          </div>
                        )}
                      </TabsContent>
                    </ScrollArea>
                  </div>
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
          </TabsContent>
        </Tabs>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-muted-foreground mt-2">
            Debug: {pestCatalog.length} items loaded, {filteredPests.length} filtered
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}