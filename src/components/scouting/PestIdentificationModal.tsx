import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Fixed interface to match your database schema
interface PestCatalogItem {
  id: string;
  name: string;
  scientific_name?: string | null;
  type: 'pest' | 'disease' | 'nutrient' | 'environmental'; // Fixed: now expects 'pest' not 'insect'
  description: string;
  identification_tips?: string[] | null;
  symptoms?: string[] | null;
  severity_levels: any;
  treatment_options: any;
  prevention_tips?: string[] | null;
  safe_for_schools: boolean;
  common_locations?: string[] | null;
  seasonal_info?: string | null;
  video_url?: string | null;
  appearance_details?: string | null;
  damage_caused?: string[] | null;
  omri_remedies?: string[] | null;
  management_strategies?: string[] | null;
  prevention_methods?: string[] | null;
}

interface PestIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (pest: PestCatalogItem) => void;
}

// Helper function to check if an item is safe for schools
const isSchoolSafe = (item: PestCatalogItem): boolean => {
  // Check multiple sources for school safety
  if (item.safe_for_schools === true) return true;
  
  // Check treatment_options array
  if (Array.isArray(item.treatment_options)) {
    return item.treatment_options.some((treatment: any) => 
      treatment?.safe_for_schools === true
    );
  }
  
  // Check if treatment_options is an object
  if (typeof item.treatment_options === 'object' && item.treatment_options !== null) {
    return item.treatment_options.safe_for_schools === true;
  }
  
  // Default to true for educational environment
  return true;
};

// Helper function to check location suitability
const isLocationSuitable = (item: PestCatalogItem): boolean => {
  // Check treatment_options array
  if (Array.isArray(item.treatment_options)) {
    return item.treatment_options.some((treatment: any) => 
      treatment?.location_suitable === true
    );
  }
  
  // Check if treatment_options is an object
  if (typeof item.treatment_options === 'object' && item.treatment_options !== null) {
    return item.treatment_options.location_suitable === true;
  }
  
  // Default to true if no specific location restrictions
  return true;
};

export default function PestIdentificationModal({ 
  isOpen, 
  onClose, 
  onSelect 
}: PestIdentificationModalProps) {
  const [pestCatalog, setPestCatalog] = useState<PestCatalogItem[]>([]);
  const [filteredCatalog, setFilteredCatalog] = useState<PestCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Fetch pest catalog data
  useEffect(() => {
    if (!isOpen) return;

    const fetchPestCatalog = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pest_catalog')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching pest catalog:', error);
          setError(`Database error: ${error.message}`);
          return;
        }

        console.log('Raw pest catalog data:', data);
        
        // Debug info for troubleshooting
        const debugMessages = [
          `✅ Fetched ${data?.length || 0} total entries`,
          data?.length ? `📊 Types found: ${[...new Set(data.map(item => item.type))].join(', ')}` : '⚠️ No data found',
          data?.length ? `🔒 Safe for schools: ${data.filter(item => isSchoolSafe(item)).length}` : '',
          data?.length ? `📍 Location suitable: ${data.filter(item => isLocationSuitable(item)).length}` : '',
        ].filter(Boolean);
        
        setDebugInfo(debugMessages.join('\n'));
        setPestCatalog(data || []);
        
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred while loading pest data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPestCatalog();
  }, [isOpen]);

  // Filter catalog based on selected type and school safety
  useEffect(() => {
    if (!pestCatalog.length) {
      setFilteredCatalog([]);
      return;
    }

    let filtered = pestCatalog.filter(item => {
      // Must be safe for schools
      const schoolSafe = isSchoolSafe(item);
      if (!schoolSafe) return false;

      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) return false;

      return true;
    });

    console.log(`Filtered results: ${filtered.length} items for type "${selectedType}"`);
    setFilteredCatalog(filtered);
  }, [pestCatalog, selectedType]);

  const handleSelect = (item: PestCatalogItem) => {
    onSelect?.(item);
    onClose();
  };

  const renderTreatmentOptions = (item: PestCatalogItem) => {
    // Handle different treatment_options structures
    if (Array.isArray(item.treatment_options) && item.treatment_options.length > 0) {
      return (
        <div className="space-y-2">
          {item.treatment_options.map((treatment: any, index: number) => (
            <div key={index} className="text-sm p-2 bg-blue-50 rounded">
              {treatment.method && <strong>{treatment.method}:</strong>} {treatment.description || 'Treatment available'}
            </div>
          ))}
        </div>
      );
    }

    // Check for OMRI remedies
    if (item.omri_remedies && item.omri_remedies.length > 0) {
      return (
        <div className="space-y-2">
          <strong className="text-sm">OMRI Approved:</strong>
          <ul className="text-sm list-disc list-inside">
            {item.omri_remedies.map((remedy, index) => (
              <li key={index}>{remedy}</li>
            ))}
          </ul>
        </div>
      );
    }

    // Check for management strategies
    if (item.management_strategies && item.management_strategies.length > 0) {
      return (
        <div className="space-y-2">
          <strong className="text-sm">Management:</strong>
          <ul className="text-sm list-disc list-inside">
            {item.management_strategies.map((strategy, index) => (
              <li key={index}>{strategy}</li>
            ))}
          </ul>
        </div>
      );
    }

    return <div className="text-sm text-muted-foreground">Contact your teacher for treatment options.</div>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pest & Issue Identification Guide
          </DialogTitle>
        </DialogHeader>

        {/* Debug Info - Remove this in production */}
        {debugInfo && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <details>
                <summary className="cursor-pointer font-medium">Debug Info (Click to expand)</summary>
                <pre className="text-xs mt-2 whitespace-pre-line">{debugInfo}</pre>
              </details>
            </AlertDescription>
          </Alert>
        )}

        {/* Type Filter Tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({pestCatalog.length})</TabsTrigger>
            <TabsTrigger value="pest">Pests ({pestCatalog.filter(p => p.type === 'pest').length})</TabsTrigger>
            <TabsTrigger value="disease">Diseases ({pestCatalog.filter(p => p.type === 'disease').length})</TabsTrigger>
            <TabsTrigger value="nutrient">Nutrients ({pestCatalog.filter(p => p.type === 'nutrient').length})</TabsTrigger>
            <TabsTrigger value="environmental">Environmental ({pestCatalog.filter(p => p.type === 'environmental').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedType} className="flex-1">
            <ScrollArea className="h-[50vh]">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : filteredCatalog.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No issues found for "{selectedType}"</h3>
                  <p className="text-muted-foreground mb-4">
                    Try selecting a different category or check if data has been added to the pest catalog.
                  </p>
                  <Button variant="outline" onClick={() => setSelectedType('all')}>
                    View All Categories
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredCatalog.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelect(item)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            {item.scientific_name && (
                              <p className="text-sm italic text-muted-foreground">{item.scientific_name}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary">{item.type}</Badge>
                            {isSchoolSafe(item) && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                School Safe
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{item.description}</p>
                        
                        {item.identification_tips && item.identification_tips.length > 0 && (
                          <div>
                            <strong className="text-sm">Identification:</strong>
                            <ul className="text-sm list-disc list-inside mt-1">
                              {item.identification_tips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {item.symptoms && item.symptoms.length > 0 && (
                          <div>
                            <strong className="text-sm">Symptoms:</strong>
                            <ul className="text-sm list-disc list-inside mt-1">
                              {item.symptoms.map((symptom, index) => (
                                <li key={index}>{symptom}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <strong className="text-sm">Treatment Options:</strong>
                          <div className="mt-1">
                            {renderTreatmentOptions(item)}
                          </div>
                        </div>

                        {item.video_url && (
                          <div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={item.video_url} target="_blank" rel="noopener noreferrer">
                                Watch Video Guide
                              </a>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}