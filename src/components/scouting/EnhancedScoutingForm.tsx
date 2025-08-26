// src/components/scouting/EnhancedScoutingForm.tsx

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Bug, Search, AlertTriangle, Camera, HelpCircle } from "lucide-react";
import PestIdentificationModal from "./PestIdentificationModal";
import TreatmentRecommendations from "./TreatmentRecommendations";

interface EnhancedScoutingFormProps {
  towerId: string;
  teacherId: string;
  towerLocation: 'indoor' | 'greenhouse' | 'outdoor';
  onScoutingSaved: () => void;
  editingEntry?: any; // For editing existing entries
}

interface PestCatalogItem {
  id: string;
  name: string;
  type: string;
  description: string;
  severity_levels: Array<{
    level: number;
    description: string;
    color: string;
    action: string;
  }>;
  treatment_options: Array<{
    method: string;
    safe_for_schools: boolean;
    effectiveness: string;
    location_suitable: string[];
    instructions: string;
    materials?: string[];
    precautions?: string[];
  }>;
}

export function EnhancedScoutingForm({ 
  towerId, 
  teacherId, 
  towerLocation,
  onScoutingSaved,
  editingEntry = null 
}: EnhancedScoutingFormProps) {
  const { toast } = useToast();
  
  // Form state
  const [selectedPest, setSelectedPest] = useState<PestCatalogItem | null>(null);
  const [customPest, setCustomPest] = useState("");
  const [severity, setSeverity] = useState<number>(1);
  const [locationOnTower, setLocationOnTower] = useState("");
  const [affectedPlants, setAffectedPlants] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [treatmentApplied, setTreatmentApplied] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [images, setImages] = useState<File[]>([]);
  
  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [showPestModal, setShowPestModal] = useState(false);
  const [pestCatalog, setPestCatalog] = useState<PestCatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Load pest catalog on mount
  useEffect(() => {
    loadPestCatalog();
    if (editingEntry) {
      populateFormForEditing();
    }
  }, [editingEntry]);

  const loadPestCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from('pest_catalog')
        .select('*')
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

  const populateFormForEditing = () => {
    if (!editingEntry) return;
    
    // Populate form fields with existing data
    setCustomPest(editingEntry.pest || "");
    setSeverity(editingEntry.severity || 1);
    setLocationOnTower(editingEntry.location_on_tower || "");
    setAffectedPlants(editingEntry.affected_plants || []);
    setSymptoms(editingEntry.notes || "");
    setActionTaken(editingEntry.action || "");
    setTreatmentApplied(editingEntry.treatment_applied || []);
    setFollowUpNeeded(editingEntry.follow_up_needed || false);
    setFollowUpDate(editingEntry.follow_up_date || "");
    
    // If there's a pest_catalog_id, load that pest
    if (editingEntry.pest_catalog_id) {
      const catalogPest = pestCatalog.find(p => p.id === editingEntry.pest_catalog_id);
      if (catalogPest) {
        setSelectedPest(catalogPest);
      }
    }
  };

  const filteredPestCatalog = pestCatalog.filter(pest => {
    const matchesSearch = pest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || pest.type === filterType;
    const matchesLocation = pest.treatment_options.some(treatment => 
      treatment.location_suitable.includes(towerLocation)
    );
    
    return matchesSearch && matchesType && matchesLocation;
  });

  // FIXED: Using useCallback to ensure stable function reference
  const handlePestSelection = useCallback((pest: string) => {
    console.log("=== FORM handlePestSelection called ===");
    console.log("Received pest:", pest);
    
    // Create a simple pest object from the string
    const simplePest: PestCatalogItem = {
      id: `custom-${Date.now()}`,
      name: pest,
      type: 'pest',
      description: `Custom observation: ${pest}`,
      severity_levels: [
        { level: 1, description: 'Low', color: 'green', action: 'Monitor closely' },
        { level: 2, description: 'Medium', color: 'yellow', action: 'Take action soon' },
        { level: 3, description: 'High', color: 'red', action: 'Immediate action needed' }
      ],
      treatment_options: []
    };

    console.log("Setting selected pest:", simplePest);
    setSelectedPest(simplePest);
    setCustomPest("");
    setShowPestModal(false);
    setSeverity(1);
    console.log("=== FORM handlePestSelection complete ===");
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      setImages(prev => [...prev, ...imageFiles].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentSeverityInfo = () => {
    if (!selectedPest || !selectedPest.severity_levels) return null;
    return selectedPest.severity_levels.find(s => s.level === severity);
  };

  const getRecommendedTreatments = () => {
    if (!selectedPest) return [];
    
    return selectedPest.treatment_options.filter(treatment => 
      treatment.safe_for_schools && 
      treatment.location_suitable.includes(towerLocation)
    ).sort((a, b) => {
      // Sort by effectiveness and safety
      const effectivenessOrder = { low: 0, medium: 1, high: 2 };
      return effectivenessOrder[b.effectiveness as keyof typeof effectivenessOrder] - 
             effectivenessOrder[a.effectiveness as keyof typeof effectivenessOrder];
    });
  };

  const handleSubmit = async () => {
    // Validation
    const pestName = selectedPest ? selectedPest.name : customPest.trim();
    if (!pestName) {
      toast({
        title: "Pest identification required",
        description: "Please select a pest from the catalog or enter a custom observation.",
        variant: "destructive"
      });
      return;
    }

    if (!symptoms.trim()) {
      toast({
        title: "Symptoms required",
        description: "Please describe what you observed.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Upload images if any
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `scouting/${towerId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('tower-photos')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('tower-photos')
          .getPublicUrl(filePath);
        
        imageUrls.push(data.publicUrl);
      }

      // Prepare scouting entry data
      const scoutingData = {
        tower_id: towerId,
        teacher_id: teacherId,
        pest: pestName,
        pest_catalog_id: selectedPest?.id || null,
        severity: severity,
        location_on_tower: locationOnTower || null,
        affected_plants: affectedPlants.length > 0 ? affectedPlants : null,
        notes: symptoms,
        action: actionTaken || null,
        treatment_applied: treatmentApplied.length > 0 ? treatmentApplied : [],
        follow_up_needed: followUpNeeded,
        follow_up_date: followUpDate || null,
        images: imageUrls.length > 0 ? imageUrls : null,
        resolved: false
      };

      let result;
      if (editingEntry) {
        // Update existing entry
        result = await supabase
          .from('pest_logs')
          .update(scoutingData)
          .eq('id', editingEntry.id)
          .select()
          .single();
      } else {
        // Create new entry
        result = await supabase
          .from('pest_logs')
          .insert(scoutingData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Reset form
      setSelectedPest(null);
      setCustomPest("");
      setSeverity(1);
      setLocationOnTower("");
      setAffectedPlants([]);
      setSymptoms("");
      setActionTaken("");
      setTreatmentApplied([]);
      setNotes("");
      setFollowUpNeeded(false);
      setFollowUpDate("");
      setImages([]);

      toast({
        title: editingEntry ? "Scouting entry updated" : "Scouting entry recorded",
        description: "Your observation has been successfully saved."
      });

      onScoutingSaved();

    } catch (error) {
      console.error('Error saving scouting entry:', error);
      toast({
        title: "Error saving entry",
        description: "Failed to save scouting entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const severityInfo = getCurrentSeverityInfo();
  const recommendedTreatments = getRecommendedTreatments();

  // Debug log right before render
  console.log("Form render - handlePestSelection type:", typeof handlePestSelection);
  console.log("Form render - showPestModal:", showPestModal);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            {editingEntry ? "Edit Scouting Entry" : "Record Scouting Observation"}
            <Badge variant={towerLocation === 'indoor' ? 'default' : 'secondary'}>
              {towerLocation}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Pest Identification Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">What did you observe?</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log("Opening modal...");
                  setShowPestModal(true);
                }}
                className="flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Identify Pest/Issue
              </Button>
            </div>

            {selectedPest ? (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{selectedPest.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPest.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedPest(null)}
                  >
                    Change
                  </Button>
                </div>
                <Badge variant="secondary">{selectedPest.type}</Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Custom Observation</Label>
                <Input
                  value={customPest}
                  onChange={(e) => setCustomPest(e.target.value)}
                  placeholder="Describe what you observed (e.g., Yellow spots on lettuce leaves)"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Severity Assessment */}
          {selectedPest && selectedPest.severity_levels && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Severity Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {selectedPest.severity_levels.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => setSeverity(level.level)}
                    className={`p-3 border rounded-lg text-sm transition-colors ${
                      severity === level.level 
                        ? `bg-${level.color}-100 border-${level.color}-400` 
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">Level {level.level}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
              {severityInfo && (
                <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Recommended Action: </span>
                  <span className="text-sm">{severityInfo.action}</span>
                </div>
              )}
            </div>
          )}

          {/* Location and Plant Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location on Tower</Label>
              <Input
                value={locationOnTower}
                onChange={(e) => setLocationOnTower(e.target.value)}
                placeholder="e.g., Top rows, Port 5-8, Lower section"
              />
            </div>
            <div className="space-y-2">
              <Label>Affected Plants (separate with commas)</Label>
              <Input
                value={affectedPlants.join(", ")}
                onChange={(e) => setAffectedPlants(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                placeholder="e.g., Lettuce, Basil, Kale"
              />
            </div>
          </div>

          {/* Detailed Symptoms */}
          <div className="space-y-2">
            <Label>Detailed Observations *</Label>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe exactly what you see: color changes, patterns, location of damage, number of insects, etc."
              rows={3}
            />
          </div>

          {/* Treatment Recommendations */}
          {recommendedTreatments.length > 0 && (
            <TreatmentRecommendations 
              treatments={recommendedTreatments}
              selectedTreatments={treatmentApplied}
              onTreatmentToggle={(treatment) => {
                setTreatmentApplied(prev => 
                  prev.includes(treatment)
                    ? prev.filter(t => t !== treatment)
                    : [...prev, treatment]
                );
              }}
            />
          )}

          {/* Action Taken */}
          <div className="space-y-2">
            <Label>Action Taken</Label>
            <Textarea
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="What did you do in response to this observation?"
              rows={2}
            />
          </div>

          {/* Photo Documentation */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photo Documentation
            </Label>
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="h-20 w-20 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="h-20 w-20 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center cursor-pointer hover:bg-muted">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload up to 5 photos to document your observation
            </p>
          </div>

          {/* Follow-up Planning */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="followUp"
                checked={followUpNeeded}
                onCheckedChange={(checked) => setFollowUpNeeded(checked as boolean)}
              />
              <Label htmlFor="followUp">This observation needs follow-up</Label>
            </div>
            {followUpNeeded && (
              <div className="space-y-2 ml-6">
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional observations, context, or reminders"
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editingEntry ? "Update Entry" : "Save Scouting Entry"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pest Identification Modal - FIXED: Explicit function passing */}
      <PestIdentificationModal
        isOpen={showPestModal}
        onClose={() => {
          console.log("Modal onClose called");
          setShowPestModal(false);
        }}
        onSelect={handlePestSelection}
      />
    </>
  );
}