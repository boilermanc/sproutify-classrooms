import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TowerWasteFormProps {
  towerId: string;
  teacherId: string;
  onWasteLogged?: () => void;
}

type Planting = {
  name: string;
  quantity: number;
};

export function TowerWasteForm({ towerId, teacherId, onWasteLogged }: TowerWasteFormProps) {
  const { toast } = useToast();
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [selectedPlantName, setSelectedPlantName] = useState<string>("");
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);
  const [plantQuantity, setPlantQuantity] = useState<number>(0);
  const [grams, setGrams] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    const fetchPlantings = async () => {
      if (!teacherId) return; // Guard clause in case prop isn't ready

      // 1. The important change: adding .eq("teacher_id", teacherId)
      const { data, error } = await supabase
        .from("plantings")
        .select("name, quantity")
        .eq("tower_id", towerId)
        .eq("teacher_id", teacherId) // This ensures we only fetch plants for the logged-in teacher
        .eq("status", "active");

      if (error) {
        console.error("Error fetching plantings:", error);
        toast({ title: "Error", description: "Could not fetch active plants.", variant: "destructive" });
      } else {
        setPlantings(data);
      }
    };

    fetchPlantings();
  }, [towerId, teacherId, toast]); // 2. Add teacherId to the dependency array

  const handlePlantSelect = (plantName: string) => {
    setSelectedPlantName(plantName);
    const selected = plantings.find((p) => p.name === plantName);
    setAvailableQuantity(selected?.quantity || 0);
    setPlantQuantity(0);
    setGrams(0);
  };

  const handleSubmit = async () => {
    if (!selectedPlantName || plantQuantity <= 0 || grams <= 0) return;

    // This part was already correct, using the teacherId prop
    const { error } = await supabase.from("waste_logs").insert({
      teacher_id: teacherId,
      tower_id: towerId,
      plant_name: selectedPlantName,
      plant_quantity: plantQuantity,
      grams: grams,
      notes,
    });

    if (error) {
      console.error("Error inserting waste log:", error);
      toast({ title: "Error", description: "Failed to log waste. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Waste has been logged." });
      if (onWasteLogged) onWasteLogged();
      // reset form
      setSelectedPlantName("");
      setAvailableQuantity(0);
      setPlantQuantity(0);
      setGrams(0);
      setNotes("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Plant to Discard</Label>
        <Select value={selectedPlantName} onValueChange={handlePlantSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose plant" />
          </SelectTrigger>
          <SelectContent>
            {plantings.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                {p.name} ({p.quantity} available)
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
            <Label>Waste Weight (grams)</Label>
            <Input
              type="number"
              min={1}
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
            />
          </div>

          <div className="col-span-2">
            <Label>Notes (Reason for Waste)</Label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Pest damage, bolted, experimental failure..."
            />
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} disabled={!selectedPlantName || plantQuantity <= 0 || grams <= 0}>
        Log Waste
      </Button>
    </div>
  );
}
