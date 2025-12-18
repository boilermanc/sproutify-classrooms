// src/components/tower-notebook/SourcesPanel.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceDetailModal } from "@/components/modals/SourceDetailModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Leaf,
  Activity,
  Wheat,
  Trash2,
  Bug,
  Camera,
  BookOpen,
  Eye,
  FileText,
} from "lucide-react";

export type SourceItem = {
  id: string;
  type: 'plant' | 'vitals' | 'harvest' | 'waste' | 'pest' | 'photo';
  title: string;
  date: string;
  description?: string;
};

interface SourcesPanelProps {
  towerId: string;
  selectedSources: string[];
  setSelectedSources: (sources: string[]) => void;
}

export function SourcesPanel({ towerId, selectedSources, setSelectedSources }: SourcesPanelProps) {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('');

  useEffect(() => {
    const fetchSources = async () => {
      try {
        if (!towerId) return;

        const teacherId = localStorage.getItem("teacher_id_for_tower");
        if (!teacherId) return;

        const sources: SourceItem[] = [];

        // Fetch plantings
        const { data: plantings } = await supabase
          .from('plantings')
          .select('id, name, created_at, port_number')
          .eq('tower_id', towerId);

        if (plantings) {
          plantings.forEach(planting => {
            sources.push({
              id: `plant-${planting.id}`,
              type: 'plant',
              title: planting.name,
              date: new Date(planting.created_at).toLocaleDateString(),
              description: planting.port_number ? `Port ${planting.port_number}` : undefined
            });
          });
        }

        // Fetch vitals
        const { data: vitals } = await supabase
          .from('tower_vitals')
          .select('id, ph, ec, created_at')
          .eq('tower_id', towerId);

        if (vitals) {
          vitals.forEach(vital => {
            sources.push({
              id: `vital-${vital.id}`,
              type: 'vitals',
              title: 'pH & EC Reading',
              date: new Date(vital.created_at).toLocaleDateString(),
              description: `pH: ${vital.ph}, EC: ${vital.ec}`
            });
          });
        }

        // Fetch harvests
        const { data: harvests } = await supabase
          .from('harvests')
          .select('id, plant_name, weight_grams, destination, created_at')
          .eq('tower_id', towerId);

        if (harvests) {
          harvests.forEach(harvest => {
            sources.push({
              id: `harvest-${harvest.id}`,
              type: 'harvest',
              title: `${harvest.plant_name || 'Plant'} Harvest`,
              date: new Date(harvest.created_at).toLocaleDateString(),
              description: `${harvest.weight_grams}g${harvest.destination ? ` → ${harvest.destination}` : ''}`
            });
          });
        }

        // Fetch waste logs
        const { data: wasteLogs } = await supabase
          .from('waste_logs')
          .select('id, plant_name, grams, notes, created_at')
          .eq('tower_id', towerId);

        if (wasteLogs) {
          wasteLogs.forEach(waste => {
            sources.push({
              id: `waste-${waste.id}`,
              type: 'waste',
              title: `${waste.plant_name || 'Plant'} Waste`,
              date: new Date(waste.created_at).toLocaleDateString(),
              description: `${waste.grams}g - ${waste.notes || 'No notes'}`
            });
          });
        }

        // Fetch pest logs
        const { data: pestLogs } = await supabase
          .from('pest_logs')
          .select('id, pest, created_at')
          .eq('tower_id', towerId);

        if (pestLogs) {
          pestLogs.forEach(pest => {
            sources.push({
              id: `pest-${pest.id}`,
              type: 'pest',
              title: 'Pest Observation',
              date: new Date(pest.created_at).toLocaleDateString(),
              description: pest.pest.length > 50 ? `${pest.pest.substring(0, 50)}...` : pest.pest
            });
          });
        }

        // Fetch photos
        const { data: photos } = await supabase
          .from('tower_photos')
          .select('id, caption, created_at')
          .eq('tower_id', towerId);

        if (photos) {
          photos.forEach(photo => {
            sources.push({
              id: `photo-${photo.id}`,
              type: 'photo',
              title: 'Tower Photo',
              date: new Date(photo.created_at).toLocaleDateString(),
              description: photo.caption || 'No description'
            });
          });
        }

        // Sort by date (newest first)
        sources.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setSources(sources);

        // Auto-select all sources by default so AI has access to all data
        setSelectedSources(sources.map(s => s.id));

        setLoading(false);
      } catch (err) {
        console.error('Error fetching sources:', err);
        setLoading(false);
      }
    };

    fetchSources();
  }, [towerId]);

  const getSourceIcon = (type: SourceItem['type']) => {
    switch (type) {
      case 'plant': return <Leaf className="h-4 w-4" />;
      case 'vitals': return <Activity className="h-4 w-4" />;
      case 'harvest': return <Wheat className="h-4 w-4" />;
      case 'waste': return <Trash2 className="h-4 w-4" />;
      case 'pest': return <Bug className="h-4 w-4" />;
      case 'photo': return <Camera className="h-4 w-4" />;
    }
  };

  const handleSourceClick = (source: SourceItem) => {
    setSelectedSourceId(source.id);
    setSelectedSourceType(source.type);
    setShowDetailModal(true);
  };

  return (
    <div className="w-80 min-w-80 bg-background border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-4">Sources</h2>

        <div className="flex gap-2 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to={`/student/add-plant?towerId=${towerId}`}>
                  <Leaf className="h-4 w-4 mr-2" />
                  Add Plant
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/vitals?towerId=${towerId}`}>
                  <Activity className="h-4 w-4 mr-2" />
                  Log Vitals
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/harvest?towerId=${towerId}`}>
                  <Wheat className="h-4 w-4 mr-2" />
                  Log Harvest
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/waste?towerId=${towerId}`}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Log Waste
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/pest-disease?towerId=${towerId}`}>
                  <Bug className="h-4 w-4 mr-2" />
                  Pest and Disease
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/photos?towerId=${towerId}`}>
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photo
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/documents?towerId=${towerId}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Add Document
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to="/student/pest-disease-guide">
              <BookOpen className="h-4 w-4 mr-2" />
              Learning Guide
            </Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedSources.length === sources.length && sources.length > 0}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedSources(sources.map(s => s.id));
              } else {
                setSelectedSources([]);
              }
            }}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select all sources
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sources.length > 0 ? (
          <div className="space-y-3">
            {sources.map((source) => (
              <div key={source.id} className={`flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 group ${selectedSources.includes(source.id) ? 'bg-green-50' : ''}`}>
                <Checkbox
                  checked={selectedSources.includes(source.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedSources([...selectedSources, source.id]);
                    } else {
                      setSelectedSources(selectedSources.filter(id => id !== source.id));
                    }
                  }}
                />
                <div
                  className="flex items-center space-x-2 flex-1 min-w-0 cursor-pointer hover:bg-muted/30 rounded p-1 -m-1"
                  onClick={() => handleSourceClick(source)}
                >
                  {getSourceIcon(source.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{source.title}</p>
                      <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground">{source.date}</p>
                    {source.description && (
                      <p className="text-xs text-muted-foreground truncate">{source.description}</p>
                    )}
                  </div>
                </div>
                {source.type === 'photo' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/student/tower/${towerId}`, '_blank');
                    }}
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Gallery
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Leaf className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No sources yet</p>
            <p className="text-xs text-muted-foreground">Add some data to get started</p>
          </div>
        )}
      </div>

      <SourceDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sourceId={selectedSourceId}
        sourceType={selectedSourceType}
        towerId={towerId}
      />
    </div>
  );
}
