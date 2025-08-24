// src/components/towers/TowerHarvestForm.tsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Scissors, Trash2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TowerHarvestFormProps {
  towerId: string;
  teacherId: string;
  onHarvested?: () => void;
}

type Planting = {
  id: string;
  name: string;
  quantity: number;
};

// Weight conversion utilities
const convertWeight = (weight: number, from: 'grams' | 'ounces', to: 'grams' | 'ounces'): number => {
  if (from === to) return weight;
  if (from === 'grams' && to === 'ounces') return weight * 0.035274;
  if (from === 'ounces' && to === 'grams') return weight * 28.3495;
  return weight;
};

const formatWeight = (weight: number, unit: 'grams' | 'ounces'): string => {
  return unit === 'grams' ? `${weight.toFixed(0)} g` : `${weight.toFixed(2)} oz`;
};

export function TowerHarvestForm({ towerId, teacherId, onHarvested }: TowerHarvestFormProps) {
  const { toast } = useToast();
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [selectedPlant, setSelectedPlant] = useState<Planting | null>(null);
  const [plantQuantity, setPlantQuantity] = useState<number>(1);
  const [weight, setWeight] = useState<number>(0);
  const [harvestMethod, setHarvestMethod] = useState<'pull' | 'cut'>('pull');
  const [weightUnit, setWeightUnit] = useState<'grams' | 'ounces'>('grams');
  const [destination, setDestination] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch classroom weight unit preference and plantings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get classroom weight unit preference
        const { data: classroomData } = await supabase
          .from("classrooms")
          .select("preferred_weight_unit")
          .eq("teacher_id", teacherId)
          .single();
          
        if (classroomData?.preferred_weight_unit) {
          setWeightUnit(classroomData.preferred_weight_unit as 'grams' | 'ounces');
        }

        // Get active plantings
        const { data: plantingsData, error } = await supabase
          .from("plantings")
          .select("id, name, quantity")
          .eq("tower_id", towerId)
          .eq("teacher_id", teacherId)
          .eq("status", "active")
          .gt("quantity", 0);

        if (error) throw error;
        setPlantings(plantingsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Could not load harvest form data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [towerId, teacherId, toast]);

  const handlePlantSelect = (plantId: string) => {
    const plant = plantings.find((p) => p.id === plantId);
    setSelectedPlantId(plantId);
    setSelectedPlant(plant || null);
    setPlantQuantity(1);
    setWeight(0);
    
    // Set default harvest method based on plant type
    if (plant?.name.toLowerCase().includes('lettuce') || 
        plant?.name.toLowerCase().includes('spinach')) {
      setHarvestMethod('pull');
    } else if (plant?.name.toLowerCase().includes('herb') ||
               plant?.name.toLowerCase().includes('basil') ||
               plant?.name.toLowerCase().includes('cilantro') ||
               plant?.name.toLowerCase().includes('kale')) {
      setHarvestMethod('cut');
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlant || plantQuantity <= 0 || weight <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (plantQuantity > selectedPlant.quantity) {
      toast({
        title: "Invalid Quantity",
        description: `Cannot harvest ${plantQuantity} plants. Only ${selectedPlant.quantity} available.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Convert weight to grams for consistent storage
      const weightInGrams = convertWeight(weight, weightUnit, 'grams');

      const { error } = await supabase.from("harvests").insert({
        teacher_id: teacherId,
        tower_id: towerId,
        plant_name: selectedPlant.name,
        plant_quantity: plantQuantity,
        weight_grams: Math.round(weightInGrams),
        harvest_method: harvestMethod,
        destination: destination.trim() || null,
        notes: notes.trim() || null,
        planting_id: selectedPlant.id,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Harvest recorded: ${plantQuantity} ${selectedPlant.name} (${formatWeight(weight, weightUnit)})`,
      });

      if (onHarvested) onHarvested();
      
      // Reset form
      setSelectedPlantId("");
      setSelectedPlant(null);
      setPlantQuantity(1);
      setWeight(0);
      setDestination("");
      setNotes("");
      setHarvestMethod('pull');
      
      // Refresh plantings data
      const { data: updatedPlantings } = await supabase
        .from("plantings")
        .select("id, name, quantity")
        .eq("tower_id", towerId)
        .eq("teacher_id", teacherId)
        .eq("status", "active")
        .gt("quantity", 0);
        
      setPlantings(updatedPlantings || []);

    } catch (error) {
      console.error("Error recording harvest:", error);
      toast({
        title: "Error",
        description: "Failed to record harvest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading plants...</div>;
  }

  if (plantings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="mb-2">No plants available for harvest</div>
        <div className="text-sm">Add some plants to this tower first.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plant Selection */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Select Plant to Harvest</Label>
        <Select value={selectedPlantId} onValueChange={handlePlantSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a plant..." />
          </SelectTrigger>
          <SelectContent>
            {plantings.map((plant) => (
              <SelectItem key={plant.id} value={plant.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{plant.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {plant.quantity} available
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPlant && (
        <>
          {/* Harvest Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Harvest Method</Label>
            <RadioGroup value={harvestMethod} onValueChange={(value) => setHarvestMethod(value as 'pull' | 'cut')}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="pull" id="pull" />
                <Trash2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <label htmlFor="pull" className="font-medium cursor-pointer">Pull (Whole Plant)</label>
                  <p className="text-sm text-muted-foreground">Remove entire plant (lettuce, spinach)</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="cut" id="cut" />
                <Scissors className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <label htmlFor="cut" className="font-medium cursor-pointer">Cut (Partial Harvest)</label>
                  <p className="text-sm text-muted-foreground">Cut portions, plant continues growing (herbs, kale)</p>
                </div>
              </div>
            </RadioGroup>
            
            {harvestMethod === 'cut' && (
              <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Cut Harvest:</strong> Plant quantity won't be reduced since the plant continues growing.
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Plants {harvestMethod === 'pull' ? `(Max ${selectedPlant.quantity})` : ''}</Label>
              <Input
                type="number"
                min={1}
                max={harvestMethod === 'pull' ? selectedPlant.quantity : undefined}
                value={plantQuantity}
                onChange={(e) => setPlantQuantity(Number(e.target.value))}
                className="text-center"
              />
              {harvestMethod === 'cut' && (
                <p className="text-xs text-muted-foreground">
                  For cut harvests, this tracks portions harvested
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Weight
                <Select value={weightUnit} onValueChange={(value) => setWeightUnit(value as 'grams' | 'ounces')}>
                  <SelectTrigger className="w-24 h-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grams">grams</SelectItem>
                    <SelectItem value="ounces">ounces</SelectItem>
                  </SelectContent>
                </Select>
              </Label>
              <Input
                type="number"
                min={0.1}
                step={weightUnit === 'grams' ? 1 : 0.01}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                placeholder={weightUnit === 'grams' ? "e.g., 250" : "e.g., 8.8"}
                className="text-center"
              />
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label>Destination (Optional)</Label>
            <Input 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Cafeteria, Classroom snack, Student take-home"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations about quality, appearance, or other details..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !selectedPlant || plantQuantity <= 0 || weight <= 0}
            className="w-full"
          >
            {submitting ? "Recording..." : `Record Harvest (${formatWeight(weight, weightUnit)})`}
          </Button>
        </>
      )}
    </div>
  );
}