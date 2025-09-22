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
  data?: any;
}

export function SourceDetailModal({ isOpen, onClose, sourceId, sourceType, towerId }: SourceDetailModalProps) {
  const [sourceData, setSourceData] = useState<SourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedData, setRelatedData] = useState<any[]>([]);
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

      let data: any = null;
      let related: any[] = [];

      switch (sourceType) {
        case 'vitals':
          const { data: vitalData } = await supabase
            .from('tower_vitals')
            .select('*')
            .eq('id', sourceId.replace('vital-', ''))
            .single();
          
          // Get historical vitals for chart
          const { data: historicalVitals } = await supabase
            .from('tower_vitals')
            .select('ph, ec, recorded_at')
            .eq('tower_id', towerId)
            .order('recorded_at', { ascending: true })
            .limit(20);

          data = vitalData;
          related = historicalVitals || [];
          break;

        case 'photo':
          const { data: photoData } = await supabase
            .from('tower_photos')
            .select('*')
            .eq('id', sourceId.replace('photo-', ''))
            .single();
          
          // Get all photos for lightbox navigation
          const { data: allPhotos } = await supabase
            .from('tower_photos')
            .select('*')
            .eq('tower_id', towerId)
            .order('taken_at', { ascending: false });

          data = photoData;
          related = allPhotos || [];
          break;

        case 'plant':
          const { data: plantData } = await supabase
            .from('plantings')
            .select('*')
            .eq('id', sourceId.replace('plant-', ''))
            .single();
          data = plantData;
          break;

        case 'harvest':
          const { data: harvestData } = await supabase
            .from('harvests')
            .select('*')
            .eq('id', sourceId.replace('harvest-', ''))
            .single();
          data = harvestData;
          break;

        case 'waste':
          const { data: wasteData } = await supabase
            .from('waste_logs')
            .select('*')
            .eq('id', sourceId.replace('waste-', ''))
            .single();
          data = wasteData;
          break;

        case 'pest':
          const { data: pestData } = await supabase
            .from('pest_logs')
            .select('*')
            .eq('id', sourceId.replace('pest-', ''))
            .single();
          data = pestData;
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

  const getSourceTitle = (type: string, data: any) => {
    switch (type) {
      case 'vitals': return 'pH & EC Reading';
      case 'photo': return 'Tower Photo';
      case 'plant': return data.name || 'Plant';
      case 'harvest': return `${data.plant_name || 'Plant'} Harvest`;
      case 'waste': return `${data.plant_name || 'Plant'} Waste`;
      case 'pest': return 'Pest Observation';
      default: return 'Source';
    }
  };

  const getSourceDescription = (type: string, data: any) => {
    switch (type) {
      case 'vitals': return `pH: ${data.ph}, EC: ${data.ec}`;
      case 'photo': return data.caption || 'No description';
      case 'plant': return data.port_number ? `Port ${data.port_number}` : undefined;
      case 'harvest': return `${data.weight_grams}g${data.destination ? ` → ${data.destination}` : ''}`;
      case 'waste': return `${data.grams}g - ${data.notes || 'No notes'}`;
      case 'pest': return data.pest;
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
