import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast"; // 1. Import useToast for better feedback

interface TowerHarvestFormProps {
  towerId: string;
  teacherId: string;
  onHarvested?: () => void;
}

export function TowerHarvestForm({ towerId, teacherId, onHarvested }: TowerHarvestFormProps) {
  const { toast } = useToast(); // 2. Initialize toast
  const [plantings, setPlantings] = useState<any[]>([]);
  const [selectedPlantName, setSelectedPlantName] = useState<string>("");
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);
  const [plantQuantity, setPlantQuantity] = useState<number>(0);
  const [weightGrams, setWeightGrams] = useState<number>(0);
  const [destination, setDestination] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    const fetchPlantings = async () => {
      // 3. The important change is here: adding .eq("teacher_id", teacherId)
      const { data, error } = await supabase
        .from("plantings")
        .select("name, quantity")
        .eq("tower_id", towerId)
        .eq("teacher_id", teacherId) // This ensures we only fetch plants for the logged-in teacher
        .eq("status", "active");

      if (error) {
        console.error("Error fetching plantings:", error);
        toast({
            title: "Error",
            description: "Could not fetch active plants for harvesting.",
            variant: "destructive",
        });
      } else {
        setPlantings(data);
      }
    };

    fetchPlantings();
  }, [towerId, teacherId, toast]); // 4. Add teacherId and toast to the dependency array

  const handlePlantSelect = (plantName: string) => {
    setSelectedPlantName(plantName);
    const selected = plantings.find((p) => p.name === plantName);
    setAvailableQuantity(selected?.quantity || 0);
    setPlantQuantity(0);
    setWeightGrams(0);
  };

  const handleSubmit = async () => {
    if (!selectedPlantName || plantQuantity <= 0 || weightGrams <= 0) return;

    const { error } = await supabase.from("harvests").insert({
      teacher_id: teacherId,
      tower_id: towerId,
      plant_name: selectedPlantName,
      plant_quantity: plantQuantity,
      weight_grams: weightGrams,
      destination,
      notes,
    });

    if (error) {
      console.error("Error inserting harvest:", error);
      toast({
        title: "Error",
        description: "Failed to submit harvest. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Your harvest has been recorded.",
      });
      if (onHarvested) onHarvested();
      // reset form
      setSelectedPlantName("");
      setAvailableQuantity(0);
      setPlantQuantity(0);
      setWeightGrams(0);
      setDestination("");
      setNotes("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Plant</Label>
        <Select value={selectedPlantName} onValueChange={handlePlantSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose plant" />
          </SelectTrigger>
          <SelectContent>
            {plantings.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                {p.name} ({p.quantity})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPlantName && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Number of Plants (Max {availableQuantity})</Label>
            <Input
              type="number"
              min={1}
              max={availableQuantity}
              value={plantQuantity}
              onChange={(e) => setPlantQuantity(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Weight (grams)</Label>
            <Input
              type="number"
              min={1}
              value={weightGrams}
              onChange={(e) => setWeightGrams(Number(e.target.value))}
            />
          </div>

          <div className="col-span-2">
            <Label>Destination</Label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} />
          </div>

          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} disabled={!selectedPlantName || plantQuantity <= 0 || weightGrams <= 0}>
        Submit Harvest
      </Button>
    </div>
  );
}
