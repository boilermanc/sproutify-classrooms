import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEducationalPackage } from '@/context/EducationalPackageContext';
import { Sprout, Calendar, Camera, Lightbulb, Target, BarChart3, Users, Microscope } from 'lucide-react';

interface SeedingInterfaceProps {
  studentId: string;
  classroomId: string;
  studentName: string;
  onSeedingComplete: () => void;
}

interface PlantType {
  id: string;
  name: string;
  category?: string;
  germination_days?: number;
  harvest_days?: number;
  description?: string;
}

export default function SeedingInterface({ 
  studentId, 
  classroomId, 
  studentName, 
  onSeedingComplete 
}: SeedingInterfaceProps) {
  const { hasFeature } = useEducationalPackage();
  const { toast } = useToast();
  
  // Form state
  const [plantType, setPlantType] = useState<string>('');
  const [seedCount, setSeedCount] = useState<number>(1);
  const [seedingDate, setSeedingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [predictions, setPredictions] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [hypothesis, setHypothesis] = useState<string>('');
  
  // Data state
  const [availablePlants, setAvailablePlants] = useState<PlantType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailablePlants();
  }, [classroomId]);

  const fetchAvailablePlants = async () => {
    try {
      setLoading(true);
      
      // Get the current user (teacher) to query plant catalog
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Authentication required");
      }
      
      const { data, error } = await supabase
        .from('plant_catalog')
        .select('id, name, category, germination_days, harvest_days, description')
        .or(`is_global.eq.true,teacher_id.eq.${user.id}`)
        .order('name');

      if (error) throw error;
      setAvailablePlants(data || []);
    } catch (error) {
      console.error('Error fetching plants:', error);
      toast({
        title: "Error",
        description: "Failed to load plant catalog",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setPhotos(prev => [...prev, ...files]);
      toast({
        title: "Photos Added",
        description: `${files.length} photo(s) added to your seeding record`
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!plantType || !seedCount) {
      toast({
        title: "Missing Information",
        description: "Please select a plant type and enter seed count",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Get the current user (teacher) to create the seeding record
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Authentication required");
      }

      const selectedPlant = availablePlants.find(p => p.id === plantType);
      
      // For seeding records, we don't need a tower yet - tower_id can be NULL
      // This represents the rockwool seeding phase before transplant to towers
      const { error } = await supabase
        .from('plantings')
        .insert({
          teacher_id: user.id,
          tower_id: null, // NULL for seeding-only records
          catalog_id: plantType,
          name: selectedPlant?.name || 'Unknown Plant',
          quantity: seedCount,
          seeded_at: seedingDate,
          planted_at: null, // Will be set when transferred to actual tower
          expected_harvest_date: null, // Will be calculated based on plant type
          port_number: null, // Will be set when transferred to actual tower
          status: 'seeded',
          // Store additional seeding data in the outcome field
          outcome: JSON.stringify({
            seeding_notes: notes,
            predictions: predictions,
            observations: observations,
            hypothesis: hypothesis,
            photos_count: photos.length,
            is_seeding_only: true, // Flag to identify seeding-only records
            student_id: studentId, // Track which student this seeding belongs to
            student_name: studentName
          })
        });

      if (error) throw error;

      toast({
        title: "Seeding Recorded!",
        description: `${seedCount} ${selectedPlant?.name} seeds planted in rockwool for ${studentName}`
      });

      // Reset form
      setPlantType('');
      setSeedCount(1);
      setSeedingDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setPhotos([]);
      setPredictions('');
      setObservations('');
      setHypothesis('');

      onSeedingComplete();
    } catch (error) {
      console.error('Error recording seeding:', error);
      toast({
        title: "Error",
        description: "Failed to record seeding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlantData = availablePlants.find(p => p.id === plantType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            New Rockwool Seeding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Recording seeding for <strong>{studentName}</strong>
          </p>
        </CardContent>
      </Card>

      {/* Basic Seeding Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Seeding Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plant-type">Plant Type</Label>
              <Select value={plantType} onValueChange={setPlantType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plant..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePlants.map((plant) => (
                    <SelectItem key={plant.id} value={plant.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{plant.name}</span>
                        {plant.category && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {plant.category}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="seed-count">Number of Seeds</Label>
              <Input
                id="seed-count"
                type="number"
                min="1"
                max="50"
                value={seedCount}
                onChange={(e) => setSeedCount(Math.max(1, parseInt(e.target.value) || 1))}
                placeholder="How many seeds?"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="seeding-date">Seeding Date</Label>
            <Input
              id="seeding-date"
              type="date"
              value={seedingDate}
              onChange={(e) => setSeedingDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any observations about the seeds, rockwool condition, or setup..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Plant Information Display */}
      {selectedPlantData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              Plant Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Plant Name</Label>
                <p className="text-lg font-semibold">{selectedPlantData.name}</p>
              </div>
              {selectedPlantData.germination_days && (
                <div>
                  <Label className="text-sm font-medium">Germination Time</Label>
                  <p className="text-lg font-semibold">{selectedPlantData.germination_days} days</p>
                </div>
              )}
              {selectedPlantData.harvest_days && (
                <div>
                  <Label className="text-sm font-medium">Time to Harvest</Label>
                  <p className="text-lg font-semibold">{selectedPlantData.harvest_days} days</p>
                </div>
              )}
            </div>
            {selectedPlantData.description && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedPlantData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photo Documentation */}
      {hasFeature('photos') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photo Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="photos">Upload Photos</Label>
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Take photos of your rockwool setup, seeds, or any interesting observations
              </p>
            </div>

            {photos.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Photos ({photos.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removePhoto(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Growth Predictions */}
      {hasFeature('predictions') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Growth Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="predictions">What do you predict will happen?</Label>
              <Textarea
                id="predictions"
                placeholder="Make predictions about germination time, growth rate, or any other observations..."
                value={predictions}
                onChange={(e) => setPredictions(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scientific Observations */}
      {hasFeature('observations') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              Scientific Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="observations">Record your observations</Label>
              <Textarea
                id="observations"
                placeholder="Record detailed observations about seed appearance, rockwool condition, environmental factors..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hypothesis Formation */}
      {hasFeature('hypothesis_formation') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Hypothesis Formation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="hypothesis">Form a hypothesis</Label>
              <Textarea
                id="hypothesis"
                placeholder="Based on your observations, what hypothesis can you form about this seeding experiment?"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Ready to Record Seeding?</h4>
              <p className="text-sm text-muted-foreground">
                This will create a record of your rockwool seeding session
              </p>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !plantType}
              size="lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Recording...
                </>
              ) : (
                <>
                  <Sprout className="h-4 w-4 mr-2" />
                  Record Seeding
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
