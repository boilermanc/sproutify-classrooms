// CREATE: src/components/scouting/ScoutingEntryModal.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bug, 
  Calendar, 
  MapPin, 
  Eye, 
  Edit, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Save
} from "lucide-react";
import { format } from "date-fns";
import { EnhancedScoutingForm } from "./EnhancedScoutingForm";

interface ScoutingEntry {
  id: string;
  tower_id: string;
  tower_name?: string;
  tower_location?: string;
  teacher_id: string;
  pest: string;
  pest_catalog_id?: string;
  pest_catalog_name?: string;
  pest_type?: string;
  severity?: number;
  location_on_tower?: string;
  affected_plants?: string[];
  notes?: string;
  action?: string;
  treatment_applied?: string[];
  follow_up_needed: boolean;
  follow_up_date?: string;
  resolved: boolean;
  resolved_at?: string;
  observed_at: string;
  created_at: string;
  images?: string[];
}

interface ScoutingEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ScoutingEntry;
  editMode: boolean;
  onSave: () => void;
}

export function ScoutingEntryModal({
  isOpen,
  onClose,
  entry,
  editMode: initialEditMode,
  onSave
}: ScoutingEntryModalProps) {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(initialEditMode);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [pestCatalogDetails, setPestCatalogDetails] = useState<any>(null);
  const [loadingPestDetails, setLoadingPestDetails] = useState(false);

  useEffect(() => {
    setEditMode(initialEditMode);
  }, [initialEditMode]);

  useEffect(() => {
    if (entry.pest_catalog_id && !editMode) {
      loadPestCatalogDetails();
    }
  }, [entry.pest_catalog_id, editMode]);

  const loadPestCatalogDetails = async () => {
    if (!entry.pest_catalog_id) return;
    
    setLoadingPestDetails(true);
    try {
      const { data, error } = await supabase
        .from('pest_catalog')
        .select('*')
        .eq('id', entry.pest_catalog_id)
        .single();

      if (error) throw error;
      setPestCatalogDetails(data);
    } catch (error) {
      console.error('Error loading pest catalog details:', error);
    } finally {
      setLoadingPestDetails(false);
    }
  };

  const handleResolveToggle = async () => {
    try {
      const { error } = await supabase
        .from('pest_logs')
        .update({ 
          resolved: !entry.resolved,
          resolved_at: entry.resolved ? null : new Date().toISOString()
        })
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: entry.resolved ? "Entry reopened" : "Entry resolved",
        description: entry.resolved 
          ? "Scouting entry has been marked as active again."
          : "Scouting entry has been marked as resolved."
      });

      onSave(); // Refresh the parent data
    } catch (error) {
      console.error('Error updating entry:', error);
      toast({
        title: "Error updating entry",
        description: "Could not update scouting entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = () => {
    if (entry.resolved) {
      return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
    } else if (entry.follow_up_needed) {
      const isOverdue = entry.follow_up_date && new Date(entry.follow_up_date) < new Date();
      return (
        <Badge className={isOverdue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
          {isOverdue ? "Follow-up Overdue" : "Follow-up Needed"}
        </Badge>
      );
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
    }
  };

  const getSeverityInfo = () => {
    if (!entry.severity || !pestCatalogDetails?.severity_levels) return null;
    return pestCatalogDetails.severity_levels.find((s: any) => s.level === entry.severity);
  };

  const nextImage = () => {
    if (entry.images && entry.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % entry.images.length);
    }
  };

  const prevImage = () => {
    if (entry.images && entry.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + entry.images.length) % entry.images.length);
    }
  };

  const handleFormSave = () => {
    setEditMode(false);
    onSave();
  };

  const handleModalClose = () => {
    setEditMode(false);
    onClose();
  };

  if (editMode) {
    return (
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Scouting Entry
              </span>
              <Button
                onClick={() => setEditMode(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[600px] pr-4">
            <EnhancedScoutingForm
              towerId={entry.tower_id}
              teacherId={entry.teacher_id}
              towerLocation={(entry.tower_location as 'indoor' | 'greenhouse' | 'outdoor') || 'indoor'}
              onScoutingSaved={handleFormSave}
              editingEntry={entry}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  const severityInfo = getSeverityInfo();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Scouting Entry Details
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleResolveToggle}
                  variant="outline"
                  size="sm"
                  className={entry.resolved ? "text-yellow-600" : "text-green-600"}
                >
                  {entry.resolved ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Reopen
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </>
                  )}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Header Information */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{entry.pest}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        {entry.tower_name && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{entry.tower_name}</span>
                            {entry.tower_location && (
                              <Badge variant="outline">{entry.tower_location}</Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Observed {format(new Date(entry.observed_at), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge()}
                        {entry.severity && (
                          <Badge 
                            className={
                              entry.severity === 1 ? "bg-green-100 text-green-800" :
                              entry.severity === 2 ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }
                          >
                            Severity Level {entry.severity}
                          </Badge>
                        )}
                        {entry.pest_type && (
                          <Badge variant="outline">{entry.pest_type}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {severityInfo && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Level {severityInfo.level}:</strong> {severityInfo.description}
                        <br />
                        <strong>Recommended Action:</strong> {severityInfo.action}
                      </AlertDescription>
                    </Alert>
                  )}

                  {entry.location_on_tower && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Location on Tower</h4>
                      <p className="text-sm text-muted-foreground">{entry.location_on_tower}</p>
                    </div>
                  )}

                  {entry.affected_plants && entry.affected_plants.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Affected Plants</h4>
                      <div className="flex flex-wrap gap-2">
                        {entry.affected_plants.map((plant, idx) => (
                          <Badge key={idx} variant="outline">{plant}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Observations */}
              {entry.notes && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Detailed Observations
                    </h3>
                    <p className="text-sm leading-relaxed">{entry.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Photo Documentation */}
              {entry.images && entry.images.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Photo Documentation
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {entry.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square cursor-pointer rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
                          onClick={() => {
                            setCurrentImageIndex(index);
                            setShowImageLightbox(true);
                          }}
                        >
                          <img
                            src={image}
                            alt={`Observation ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions Taken */}
              {(entry.action || (entry.treatment_applied && entry.treatment_applied.length > 0)) && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-3">Actions Taken</h3>
                    {entry.action && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">General Actions</h4>
                        <p className="text-sm text-muted-foreground">{entry.action}</p>
                      </div>
                    )}
                    {entry.treatment_applied && entry.treatment_applied.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Applied Treatments</h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.treatment_applied.map((treatment, idx) => (
                            <Badge key={idx} className="bg-green-100 text-green-800">
                              {treatment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Follow-up Information */}
              {entry.follow_up_needed && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-3 flex items-center gap-2 text-yellow-800">
                      <Clock className="h-4 w-4" />
                      Follow-up Required
                    </h3>
                    {entry.follow_up_date && (
                      <div className="mb-3">
                        <p className="text-sm">
                          <strong>Scheduled for:</strong> {format(new Date(entry.follow_up_date), 'MMMM d, yyyy')}
                        </p>
                        {new Date(entry.follow_up_date) < new Date() && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              This follow-up is overdue. Please check on this issue and update the entry.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Resolution Information */}
              {entry.resolved && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-3 flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      Resolved
                    </h3>
                    <p className="text-sm">
                      This issue was marked as resolved on {format(new Date(entry.resolved_at!), 'MMMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Pest Catalog Information */}
              {pestCatalogDetails && !loadingPestDetails && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-3">Reference Information</h3>
                    <div className="space-y-4">
                      {pestCatalogDetails.description && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">About This Issue</h4>
                          <p className="text-sm text-muted-foreground">{pestCatalogDetails.description}</p>
                        </div>
                      )}
                      
                      {pestCatalogDetails.prevention_tips && pestCatalogDetails.prevention_tips.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Prevention Tips</h4>
                          <ul className="space-y-1">
                            {pestCatalogDetails.prevention_tips.slice(0, 3).map((tip: string, idx: number) => (
                              <li key={idx} className="flex items-start text-sm">
                                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Entry Metadata */}
              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-medium mb-3">Entry Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <br />
                      <span>{format(new Date(entry.created_at), 'MMM d, yyyy \'at\' h:mm a')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <br />
                      <span>{format(new Date(entry.observed_at), 'MMM d, yyyy \'at\' h:mm a')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {showImageLightbox && entry.images && entry.images.length > 0 && (
        <Dialog open={showImageLightbox} onOpenChange={setShowImageLightbox}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Photo {currentImageIndex + 1} of {entry.images.length}</span>
                <Button
                  onClick={() => setShowImageLightbox(false)}
                  variant="outline"
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="relative">
              <img
                src={entry.images[currentImageIndex]}
                alt={`Observation photo ${currentImageIndex + 1}`}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
              {entry.images.length > 1 && (
                <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between">
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
            </div>
            {entry.images.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {entry.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}