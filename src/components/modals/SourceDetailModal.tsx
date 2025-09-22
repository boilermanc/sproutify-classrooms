import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Leaf, 
  Activity, 
  Wheat, 
  Trash2, 
  Bug, 
  Camera, 
  FileText,
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Legend } from 'recharts';

interface SourceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceId: string;
  sourceType: string;
  towerId: string;
}

interface SourceData {
  id: string;
  type: string;
  title: string;
  date: string;
  description?: string;
  data?: TowerVitals | TowerPhoto | Planting | Harvest | WasteLog | PestLog;
}

// Type definitions for better type safety
interface TowerVitals {
  id: string;
  ph: number;
  ec: number;
  recorded_at: string;
  tower_id: string;
  teacher_id: string;
  created_at: string;
}

interface TowerPhoto {
  id: string;
  caption?: string;
  taken_at: string;
  tower_id: string;
  student_name?: string;
  created_at: string;
}

interface Planting {
  id: string;
  name: string;
  planted_at: string;
  expected_harvest_date?: string;
  status: string;
  tower_id: string;
  plant_catalog?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface Harvest {
  id: string;
  plant_name: string;
  harvested_at: string;
  weight_grams: number;
  plant_quantity: number;
  tower_id: string;
}

interface WasteLog {
  id: string;
  waste_type: string;
  quantity: number;
  created_at: string;
  tower_id: string;
}

interface PestLog {
  id: string;
  pest: string;
  severity: number;
  observed_at: string;
  tower_id: string;
  pest_catalog?: {
    id: string;
    name: string;
    description?: string;
    treatment?: string;
  };
}

export function SourceDetailModal({ isOpen, onClose, sourceId, sourceType, towerId }: SourceDetailModalProps) {
  const [sourceData, setSourceData] = useState<SourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedData, setRelatedData] = useState<(TowerVitals | TowerPhoto)[]>([]);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && sourceId && towerId) {
      fetchSourceDetails();
    }
  }, [isOpen, sourceId, towerId]);

  const fetchSourceDetails = async () => {
    setLoading(true);
    try {
      const teacherId = localStorage.getItem("teacher_id_for_tower");
      if (!teacherId) return;

      let data: TowerVitals | TowerPhoto | Planting | Harvest | WasteLog | PestLog | null = null;
      let related: (TowerVitals | TowerPhoto)[] = [];

      switch (sourceType) {
        case 'vitals':
          // Execute both queries in parallel
          const [vitalResult, historicalResult] = await Promise.all([
            supabase
              .from('tower_vitals')
              .select('*')
              .eq('id', sourceId.replace('vital-', ''))
              .single(),
            supabase
              .from('tower_vitals')
              .select('ph, ec, recorded_at')
              .eq('tower_id', towerId)
              .order('recorded_at', { ascending: true })
              .limit(20)
          ]);

          data = vitalResult.data as TowerVitals;
          related = historicalResult.data as TowerVitals[] || [];
          break;

        case 'photo':
          // Execute both queries in parallel
          const [photoResult, allPhotosResult] = await Promise.all([
            supabase
              .from('tower_photos')
              .select('*')
              .eq('id', sourceId.replace('photo-', ''))
              .single(),
            supabase
              .from('tower_photos')
              .select('*')
              .eq('tower_id', towerId)
              .order('taken_at', { ascending: false })
          ]);

          data = photoResult.data as TowerPhoto;
          related = allPhotosResult.data as TowerPhoto[] || [];
          break;

        case 'plant':
          const { data: plantData } = await supabase
            .from('plantings')
            .select('*, plant_catalog (*)')
            .eq('id', sourceId.replace('plant-', ''))
            .single();
          data = plantData as Planting;
          break;

        case 'harvest':
          const { data: harvestData } = await supabase
            .from('harvests')
            .select('*')
            .eq('id', sourceId.replace('harvest-', ''))
            .single();
          data = harvestData as Harvest;
          break;

        case 'waste':
          const { data: wasteData } = await supabase
            .from('waste_logs')
            .select('*')
            .eq('id', sourceId.replace('waste-', ''))
            .single();
          data = wasteData as WasteLog;
          break;

        case 'pest':
          const { data: pestData } = await supabase
            .from('pest_logs')
            .select('*, pest_catalog (*)')
            .eq('id', sourceId.replace('pest-', ''))
            .single();
          data = pestData as PestLog;
          break;
      }

      if (data) {
        setSourceData({
          id: sourceId,
          type: sourceType,
          title: getSourceTitle(sourceType, data),
          date: new Date(data.created_at || data.recorded_at || data.taken_at || data.planted_at || data.harvested_at).toLocaleDateString(),
          description: getSourceDescription(sourceType, data),
          data: data
        });
        setRelatedData(related);
      }
    } catch (error) {
      console.error('Error fetching source details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceTitle = (type: string, data: TowerVitals | TowerPhoto | Planting | Harvest | WasteLog | PestLog): string => {
    switch (type) {
      case 'vitals': return 'pH & EC Reading';
      case 'photo': return 'Tower Photo';
      case 'plant': return (data as Planting).name || 'Plant';
      case 'harvest': return `${(data as Harvest).plant_name || 'Plant'} Harvest`;
      case 'waste': return `${(data as WasteLog).waste_type || 'Plant'} Waste`;
      case 'pest': return 'Pest Observation';
      default: return 'Source';
    }
  };

  const getSourceDescription = (type: string, data: TowerVitals | TowerPhoto | Planting | Harvest | WasteLog | PestLog): string | undefined => {
    switch (type) {
      case 'vitals': return `pH: ${(data as TowerVitals).ph}, EC: ${(data as TowerVitals).ec}`;
      case 'photo': return (data as TowerPhoto).caption || 'No description';
      case 'plant': {
        const plant = data as Planting;
        const parts = [];
        if (plant.port_number) parts.push(`Port ${plant.port_number}`);
        if (plant.quantity) parts.push(`Qty: ${plant.quantity}`);
        if (plant.plant_catalog?.category) parts.push(plant.plant_catalog.category);
        return parts.length > 0 ? parts.join(' • ') : undefined;
      }
      case 'harvest': {
        const harvest = data as Harvest;
        return `${harvest.weight_grams}g${harvest.destination ? ` → ${harvest.destination}` : ''}`;
      }
      case 'waste': {
        const waste = data as WasteLog;
        return `${waste.quantity}g - ${waste.notes || 'No notes'}`;
      }
      case 'pest': {
        const pest = data as PestLog;
        const parts = [pest.pest];
        if (pest.severity) parts.push(`Severity: ${pest.severity}/10`);
        if (pest.location_on_tower) parts.push(`Location: ${pest.location_on_tower}`);
        return parts.join(' • ');
      }
      default: return undefined;
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'plant': return <Leaf className="h-5 w-5" />;
      case 'vitals': return <Activity className="h-5 w-5" />;
      case 'harvest': return <Wheat className="h-5 w-5" />;
      case 'waste': return <Trash2 className="h-5 w-5" />;
      case 'pest': return <Bug className="h-5 w-5" />;
      case 'photo': return <Camera className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const publicUrl = (filePath: string) => {
    const { data } = supabase.storage.from("tower-photos").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const openImageLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageLightbox(true);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev > 0 ? prev - 1 : relatedData.length - 1);
    } else {
      setCurrentImageIndex(prev => prev < relatedData.length - 1 ? prev + 1 : 0);
    }
  };

  const renderVitalsChart = () => {
    if (!relatedData.length) return null;

    const chartData = relatedData.map(vital => ({
      date: new Date(vital.recorded_at).toLocaleDateString(),
      ph: vital.ph,
      ec: vital.ec,
      recorded_at: vital.recorded_at
    }));

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              pH History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={{ stroke: '#64748b' }}
                    axisLine={{ stroke: '#64748b' }}
                  />
                  <YAxis 
                    domain={[4, 8]} 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={{ stroke: '#64748b' }}
                    axisLine={{ stroke: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                  />
                  <Legend />
                  <ReferenceArea 
                    y1={5.2} 
                    y2={5.8} 
                    fill="#22c55e" 
                    fillOpacity={0.15} 
                    stroke="#22c55e" 
                    strokeOpacity={0.4} 
                    strokeDasharray="5 5"
                    label={{ 
                      value: 'Ideal Range', 
                      position: 'insideTopRight', 
                      fill: '#22c55e', 
                      fontSize: 11,
                      fontWeight: 'bold'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ph" 
                    name="pH Level" 
                    stroke="#3b82f6" 
                    connectNulls 
                    dot={{ 
                      fill: '#3b82f6', 
                      strokeWidth: 2, 
                      r: 4,
                      stroke: '#ffffff'
                    }} 
                    strokeWidth={3}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              EC History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={{ stroke: '#64748b' }}
                    axisLine={{ stroke: '#64748b' }}
                  />
                  <YAxis 
                    domain={[0.5, 2.5]} 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={{ stroke: '#64748b' }}
                    axisLine={{ stroke: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                  />
                  <Legend />
                  <ReferenceArea 
                    y1={1.2} 
                    y2={2.0} 
                    fill="#22c55e" 
                    fillOpacity={0.15} 
                    stroke="#22c55e" 
                    strokeOpacity={0.4} 
                    strokeDasharray="5 5"
                    label={{ 
                      value: 'Ideal Range', 
                      position: 'insideTopRight', 
                      fill: '#22c55e', 
                      fontSize: 11,
                      fontWeight: 'bold'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ec" 
                    name="EC Level" 
                    stroke="#22c55e" 
                    connectNulls 
                    dot={{ 
                      fill: '#22c55e', 
                      strokeWidth: 2, 
                      r: 4,
                      stroke: '#ffffff'
                    }} 
                    strokeWidth={3}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPhotoGallery = () => {
    if (!relatedData.length) return null;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple-600" />
              Photo Gallery ({relatedData.length} photos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedData.map((photo, index) => (
                <figure key={photo.id} className="rounded-md border overflow-hidden relative group">
                  <img
                    src={publicUrl(photo.file_path)}
                    alt={photo.caption || "Tower photo"}
                    loading="lazy"
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageLightbox(index)}
                  />
                  <figcaption className="p-3 text-sm">
                    <div className="font-medium">{photo.caption || "—"}</div>
                    <div className="text-muted-foreground text-xs">
                      {photo.student_name ? `By ${photo.student_name} • ` : ""}{new Date(photo.taken_at).toLocaleDateString()}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!sourceData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Source Not Found</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">The requested source could not be found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getSourceIcon(sourceData.type)}
              {sourceData.title}
            </DialogTitle>
            <DialogDescription>
              View detailed information about this logged source
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Source Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Details</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {sourceData.date}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sourceData.description && (
                    <p className="text-sm text-muted-foreground">{sourceData.description}</p>
                  )}
                  
                  {/* Additional details based on type */}
                  {sourceData.type === 'vitals' && sourceData.data && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-blue-50">
                        <div className="text-sm font-medium text-blue-900">pH Level</div>
                        <div className="text-2xl font-bold text-blue-600">{sourceData.data.ph}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50">
                        <div className="text-sm font-medium text-green-900">EC Level</div>
                        <div className="text-2xl font-bold text-green-600">{sourceData.data.ec}</div>
                      </div>
                    </div>
                  )}

                  {sourceData.type === 'photo' && sourceData.data && (
                    <div className="space-y-3">
                      <img
                        src={publicUrl(sourceData.data.file_path)}
                        alt={sourceData.data.caption || "Tower photo"}
                        className="w-full max-h-64 object-contain rounded-lg"
                      />
                      {sourceData.data.student_name && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          By {sourceData.data.student_name}
                        </div>
                      )}
                    </div>
                  )}

                  {sourceData.type === 'plant' && sourceData.data && (
                    <div className="space-y-4">
                      {/* Plant Catalog Information */}
                      {sourceData.data.plant_catalog && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-green-600" />
                            Plant Information
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sourceData.data.plant_catalog.description && (
                              <div className="p-3 rounded-lg bg-green-50">
                                <div className="text-sm font-medium text-green-900">Description</div>
                                <div className="text-sm text-green-700 mt-1">{sourceData.data.plant_catalog.description}</div>
                              </div>
                            )}
                            
                            {sourceData.data.plant_catalog.category && (
                              <div className="p-3 rounded-lg bg-blue-50">
                                <div className="text-sm font-medium text-blue-900">Category</div>
                                <div className="text-sm text-blue-700 mt-1">{sourceData.data.plant_catalog.category}</div>
                              </div>
                            )}
                            
                            {sourceData.data.plant_catalog.germination_days && (
                              <div className="p-3 rounded-lg bg-purple-50">
                                <div className="text-sm font-medium text-purple-900">Germination Days</div>
                                <div className="text-sm text-purple-700 mt-1">{sourceData.data.plant_catalog.germination_days} days</div>
                              </div>
                            )}
                            
                            {sourceData.data.plant_catalog.harvest_days && (
                              <div className="p-3 rounded-lg bg-orange-50">
                                <div className="text-sm font-medium text-orange-900">Harvest Days</div>
                                <div className="text-sm text-orange-700 mt-1">{sourceData.data.plant_catalog.harvest_days} days</div>
                              </div>
                            )}
                          </div>
                          
                          {sourceData.data.plant_catalog.image_url && (
                            <div className="p-3 rounded-lg bg-gray-50">
                              <div className="text-sm font-medium text-gray-900 mb-2">Plant Image</div>
                              <img
                                src={sourceData.data.plant_catalog.image_url}
                                alt={sourceData.data.name}
                                className="w-full max-h-48 object-contain rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Planting Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          Planting Details
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sourceData.data.quantity && (
                            <div className="p-3 rounded-lg bg-green-50">
                              <div className="text-sm font-medium text-green-900">Quantity Planted</div>
                              <div className="text-xl font-bold text-green-600">{sourceData.data.quantity}</div>
                            </div>
                          )}
                          
                          {sourceData.data.port_number && (
                            <div className="p-3 rounded-lg bg-blue-50">
                              <div className="text-sm font-medium text-blue-900">Port Number</div>
                              <div className="text-xl font-bold text-blue-600">{sourceData.data.port_number}</div>
                            </div>
                          )}
                          
                          {sourceData.data.seeded_at && (
                            <div className="p-3 rounded-lg bg-purple-50">
                              <div className="text-sm font-medium text-purple-900">Seeded Date</div>
                              <div className="text-sm text-purple-700 mt-1">{new Date(sourceData.data.seeded_at).toLocaleDateString()}</div>
                            </div>
                          )}
                          
                          {sourceData.data.planted_at && (
                            <div className="p-3 rounded-lg bg-orange-50">
                              <div className="text-sm font-medium text-orange-900">Planted Date</div>
                              <div className="text-sm text-orange-700 mt-1">{new Date(sourceData.data.planted_at).toLocaleDateString()}</div>
                            </div>
                          )}
                          
                          {sourceData.data.expected_harvest_date && (
                            <div className="p-3 rounded-lg bg-yellow-50">
                              <div className="text-sm font-medium text-yellow-900">Expected Harvest</div>
                              <div className="text-sm text-yellow-700 mt-1">{new Date(sourceData.data.expected_harvest_date).toLocaleDateString()}</div>
                            </div>
                          )}
                          
                          {sourceData.data.status && (
                            <div className="p-3 rounded-lg bg-gray-50">
                              <div className="text-sm font-medium text-gray-900">Status</div>
                              <Badge variant="outline" className="mt-1">
                                {sourceData.data.status}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {sourceData.data.outcome && (
                          <div className="p-3 rounded-lg bg-gray-50">
                            <div className="text-sm font-medium text-gray-900">Outcome/Notes</div>
                            <div className="text-sm text-gray-700 mt-1">{sourceData.data.outcome}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {sourceData.type === 'pest' && sourceData.data && (
                    <div className="space-y-4">
                      {/* Pest Catalog Information */}
                      {sourceData.data.pest_catalog && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Bug className="h-5 w-5 text-red-600" />
                            Pest Information
                          </h4>
                          
                          <div className="space-y-3">
                            {sourceData.data.pest_catalog.description && (
                              <div className="p-3 rounded-lg bg-red-50">
                                <div className="text-sm font-medium text-red-900">Description</div>
                                <div className="text-sm text-red-700 mt-1">{sourceData.data.pest_catalog.description}</div>
                              </div>
                            )}
                            
                            {sourceData.data.pest_catalog.scientific_name && (
                              <div className="p-3 rounded-lg bg-blue-50">
                                <div className="text-sm font-medium text-blue-900">Scientific Name</div>
                                <div className="text-sm text-blue-700 mt-1 italic">{sourceData.data.pest_catalog.scientific_name}</div>
                              </div>
                            )}
                            
                            {sourceData.data.pest_catalog.appearance_details && (
                              <div className="p-3 rounded-lg bg-purple-50">
                                <div className="text-sm font-medium text-purple-900">Appearance</div>
                                <div className="text-sm text-purple-700 mt-1">{sourceData.data.pest_catalog.appearance_details}</div>
                              </div>
                            )}
                            
                            {sourceData.data.pest_catalog.damage_caused && sourceData.data.pest_catalog.damage_caused.length > 0 && (
                              <div className="p-3 rounded-lg bg-orange-50">
                                <div className="text-sm font-medium text-orange-900">Damage Caused</div>
                                <ul className="text-sm text-orange-700 mt-1 list-disc list-inside">
                                  {sourceData.data.pest_catalog.damage_caused.map((damage: string, index: number) => (
                                    <li key={index}>{damage}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Treatment and Management */}
                      {sourceData.data.pest_catalog && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-green-600" />
                            Treatment & Management
                          </h4>
                          
                          {sourceData.data.pest_catalog.omri_remedies && sourceData.data.pest_catalog.omri_remedies.length > 0 && (
                            <div className="p-3 rounded-lg bg-green-50">
                              <div className="text-sm font-medium text-green-900">OMRI-Approved Remedies</div>
                              <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
                                {sourceData.data.pest_catalog.omri_remedies.map((remedy: string, index: number) => (
                                  <li key={index}>{remedy}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {sourceData.data.pest_catalog.management_strategies && sourceData.data.pest_catalog.management_strategies.length > 0 && (
                            <div className="p-3 rounded-lg bg-blue-50">
                              <div className="text-sm font-medium text-blue-900">Management Strategies</div>
                              <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                                {sourceData.data.pest_catalog.management_strategies.map((strategy: string, index: number) => (
                                  <li key={index}>{strategy}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {sourceData.data.pest_catalog.prevention_methods && sourceData.data.pest_catalog.prevention_methods.length > 0 && (
                            <div className="p-3 rounded-lg bg-purple-50">
                              <div className="text-sm font-medium text-purple-900">Prevention Methods</div>
                              <ul className="text-sm text-purple-700 mt-1 list-disc list-inside">
                                {sourceData.data.pest_catalog.prevention_methods.map((method: string, index: number) => (
                                  <li key={index}>{method}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {sourceData.data.pest_catalog.video_url && (
                            <div className="p-3 rounded-lg bg-gray-50">
                              <div className="text-sm font-medium text-gray-900 mb-2">Educational Video</div>
                              <div className="aspect-video rounded-lg overflow-hidden">
                                <iframe
                                  src={sourceData.data.pest_catalog.video_url}
                                  title={`${sourceData.data.pest_catalog.name} treatment video`}
                                  className="w-full h-full"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Observation Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          Observation Details
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sourceData.data.severity && (
                            <div className="p-3 rounded-lg bg-yellow-50">
                              <div className="text-sm font-medium text-yellow-900">Severity Level</div>
                              <div className="text-xl font-bold text-yellow-600">{sourceData.data.severity}/10</div>
                            </div>
                          )}
                          
                          {sourceData.data.location_on_tower && (
                            <div className="p-3 rounded-lg bg-blue-50">
                              <div className="text-sm font-medium text-blue-900">Location on Tower</div>
                              <div className="text-sm text-blue-700 mt-1">{sourceData.data.location_on_tower}</div>
                            </div>
                          )}
                          
                          {sourceData.data.affected_plants && sourceData.data.affected_plants.length > 0 && (
                            <div className="p-3 rounded-lg bg-green-50">
                              <div className="text-sm font-medium text-green-900">Affected Plants</div>
                              <div className="text-sm text-green-700 mt-1">
                                {sourceData.data.affected_plants.join(', ')}
                              </div>
                            </div>
                          )}
                          
                          {sourceData.data.resolved !== null && (
                            <div className="p-3 rounded-lg bg-gray-50">
                              <div className="text-sm font-medium text-gray-900">Status</div>
                              <Badge variant={sourceData.data.resolved ? "default" : "destructive"} className="mt-1">
                                {sourceData.data.resolved ? "Resolved" : "Active"}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {sourceData.data.action && (
                          <div className="p-3 rounded-lg bg-blue-50">
                            <div className="text-sm font-medium text-blue-900">Action Taken</div>
                            <div className="text-sm text-blue-700 mt-1">{sourceData.data.action}</div>
                          </div>
                        )}
                        
                        {sourceData.data.notes && (
                          <div className="p-3 rounded-lg bg-gray-50">
                            <div className="text-sm font-medium text-gray-900">Notes</div>
                            <div className="text-sm text-gray-700 mt-1">{sourceData.data.notes}</div>
                          </div>
                        )}
                        
                        {sourceData.data.follow_up_needed && sourceData.data.follow_up_date && (
                          <div className="p-3 rounded-lg bg-orange-50">
                            <div className="text-sm font-medium text-orange-900">Follow-up Required</div>
                            <div className="text-sm text-orange-700 mt-1">
                              Scheduled for {new Date(sourceData.data.follow_up_date).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {sourceData.type === 'harvest' && sourceData.data && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-green-50">
                        <div className="text-sm font-medium text-green-900">Weight</div>
                        <div className="text-xl font-bold text-green-600">{sourceData.data.weight_grams}g</div>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50">
                        <div className="text-sm font-medium text-blue-900">Quantity</div>
                        <div className="text-xl font-bold text-blue-600">{sourceData.data.plant_quantity}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related Data */}
            {sourceData.type === 'vitals' && renderVitalsChart()}
            {sourceData.type === 'photo' && renderPhotoGallery()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {showImageLightbox && relatedData.length > 0 && (
        <Dialog open={showImageLightbox} onOpenChange={setShowImageLightbox}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>
                Photo {currentImageIndex + 1} of {relatedData.length}
                {relatedData[currentImageIndex]?.caption && (
                  <span className="block text-sm font-normal text-muted-foreground mt-1">
                    {relatedData[currentImageIndex].caption}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="relative p-6 pt-0">
              <img
                src={publicUrl(relatedData[currentImageIndex].file_path)}
                alt={relatedData[currentImageIndex].caption || "Tower photo"}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
              {relatedData[currentImageIndex]?.student_name && (
                <div className="text-sm text-muted-foreground mt-2">
                  By {relatedData[currentImageIndex].student_name} • {new Date(relatedData[currentImageIndex].taken_at).toLocaleDateString()}
                </div>
              )}
              
              {/* Navigation arrows */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                onClick={() => navigateImage('prev')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                onClick={() => navigateImage('next')}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
