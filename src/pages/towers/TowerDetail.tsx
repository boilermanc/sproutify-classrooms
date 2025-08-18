import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useParams } from "react-router-dom";

export function HarvestsTab() {
  const { towerId } = useParams();
  const user = useUser();

  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState(0);
  const [plantName, setPlantName] = useState("");
  const [plantQuantity, setPlantQuantity] = useState(1);
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [plants, setPlants] = useState([]);

  // Fetch active plantings for this tower
  useEffect(() => {
    async function fetchPlants() {
      const { data, error } = await supabase
        .from("plantings")
        .select("name")
        .eq("tower_id", towerId)
        .eq("status", "active");

      if (!error && data) {
        const uniqueNames = [...new Set(data.map((p) => p.name))];
        setPlants(uniqueNames);
        if (uniqueNames.length > 0) {
          setPlantName(uniqueNames[0]);
        }
      }
    }

    fetchPlants();
  }, [towerId]);

  const handleSubmit = async () => {
    if (!user || !towerId || !plantName) return;

    const { error } = await supabase.from("harvests").insert({
      teacher_id: user.id,
      tower_id: towerId,
      harvested_at: harvestDate,
      weight_grams: weight,
      plant_name: plantName,
      plant_quantity: plantQuantity,
      destination,
      notes,
    });

    if (error) {
      alert("Failed to add harvest: " + error.message);
    } else {
      alert("Harvest recorded!");
      setWeight(0);
      setPlantQuantity(1);
      setDestination("");
      setNotes("");
    }
  };

  return (
    <Card className="p-4">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-bold">Add Harvest</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Date</Label>
            <Input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} />
          </div>

          <div>
            <Label>Plant</Label>
            <select
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1"
            >
              {plants.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Weight (g)</Label>
            <Input type="number" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} />
          </div>

          <div>
            <Label>Number of Plants</Label>
            <Input type="number" value={plantQuantity} onChange={(e) => setPlantQuantity(parseInt(e.target.value))} />
          </div>

          <div className="md:col-span-2">
            <Label>Destination</Label>
            <Input type="text" placeholder="Cafeteria, donation, etc" value={destination} onChange={(e) => setDestination(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea placeholder="Additional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleSubmit}>Add harvest</Button>
      </CardContent>
    </Card>
  );
}
