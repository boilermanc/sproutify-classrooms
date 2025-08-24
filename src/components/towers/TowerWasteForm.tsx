// src/components/towers/TowerWasteForm.tsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TowerWasteFormProps {
  towerId: string;
  teacherId: string;
  onWasteLogged?: () => void;
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

// Common waste reasons for quick selection
const COMMON_WASTE_REASONS = [
  "Pest damage",
  "Disease",
  "Bolted (went to seed)",
  "Overripe/expired",
  "Root rot",
  "Nutrient deficiency",
  "Physical damage",
  "Experimental failure",
  "Poor germination",
  "Overcrowding",
  "Other"
];

export function TowerWasteForm({ towerId, teacherId, onWasteLogged }: TowerWasteFormProps) {
  const { toast } = useToast();
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [selectedPlant, setSelectedPlant] = useState<Planting | null>(null);
  const [plantQuantity, setPlantQuantity] = useState<number>(1);
  const [weight, setWeight] = useState<number>(0);
  const [weightUnit, setWeightUnit] = useState<'grams' | 'ounces'>('grams');
  const [wasteReason, setWasteReason] = useState<string>("");
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
          description: "Could not load waste form data.",
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
    setWasteReason("");
  };

  const handleSubmit = async () => {
    if (!selectedPlant || plantQuantity <= 0 || weight <= 0 || !wasteReason.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields including the reason for waste.",
        variant: "destructive",
      });
      return;
    }

    if (plantQuantity > selectedPlant.quantity) {
      toast({
        title: "Invalid Quantity",
        description: `Cannot waste ${plantQuantity} plants. Only ${selectedPlant.quantity} available.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Convert weight to grams for consistent storage
      const weightInGrams = convertWeight(weight, weightUnit, 'grams');

      // Combine reason and notes for the notes field
      const combinedNotes = notes.trim() 
        ? `Reason: ${wasteReason.trim()}\n\nNotes: ${notes.trim()}`
        : `Reason: ${wasteReason.trim()}`;

      const { error } = await supabase.from("waste_logs").insert({
        teacher_id: teacherId,
        tower_id: towerId,
        plant_name: selectedPlant.name,
        plant_quantity: plantQuantity,
        grams: Math.round(weightInGrams),
        notes: combinedNotes,
        planting_id: selectedPlant.id,
      });

      if (error) throw error;

      toast({
        title: "Waste Logged",
        description: `Recorded: ${plantQuantity} ${selectedPlant.name} (${formatWeight(weight, weightUnit)}) - ${wasteReason}`,
      });

      if (onWasteLogged) onWasteLogged();
      
      // Reset form
      setSelectedPlantId("");
      setSelectedPlant(null);
      setPlantQuantity(1);
      setWeight(0);
      setWasteReason("");
      setNotes("");
      
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
      console.error("Error logging waste:", error);
      toast({
        title: "Error",
        description: "Failed to log waste. Please try again.",
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
        <div className="mb-2">No plants available to log as waste</div>
        <div className="text-sm">Add some plants to this tower first.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-amber-800">Logging Plant Waste</h3>
          <p className="text-sm text-amber-700 mt-1">
            This will permanently reduce the plant count and help track tower efficiency.
          </p>
        </div>
      </div>

      {/* Plant Selection */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Select Plant to Log as Waste</Label>
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
          {/* Quantity and Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Plants (Max {selectedPlant.quantity})</Label>
              <Input
                type="number"
                min={1}
                max={selectedPlant.quantity}
                value={plantQuantity}
                onChange={(e) => setPlantQuantity(Number(e.target.value))}
                className="text-center"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Waste Weight
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
                placeholder={weightUnit === 'grams' ? "e.g., 150" : "e.g., 5.3"}
                className="text-center"
              />
            </div>
          </div>

          {/* Waste Reason */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Reason for Waste *</Label>
            <Select value={wasteReason} onValueChange={setWasteReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {COMMON_WASTE_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details about the waste, what was learned, or prevention strategies..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !selectedPlant || plantQuantity <= 0 || weight <= 0 || !wasteReason.trim()}
            className="w-full"
            variant="destructive"
          >
            {submitting ? "Logging..." : `Log Waste (${formatWeight(weight, weightUnit)})`}
          </Button>
        </>
      )}
    </div>
  );
}