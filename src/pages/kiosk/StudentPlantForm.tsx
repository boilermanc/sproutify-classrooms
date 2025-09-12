// src/pages/kiosk/StudentPlantForm.tsx

import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActiveClassroomPlants } from "@/hooks/usePlantCatalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function StudentPlantForm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const towerId = searchParams.get("towerId");
    const teacherId = localStorage.getItem("teacher_id_for_tower");

    const [selectedPlantId, setSelectedPlantId] = useState<string>("");
    const [port_number, setPortNumber] = useState<number | undefined>();
    const [quantity, setQuantity] = useState(1);
    // Default the planted_at date to today for convenience
    const [planted_at, setPlantedAt] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    // Fetch available plants from classroom catalog
    const { activePlants, isLoading: plantsLoading, error: plantsError } = useActiveClassroomPlants(teacherId);

    const handleSave = async () => {
        if (!towerId || !teacherId || !selectedPlantId || !planted_at) {
            toast({ title: "Error", description: "Please select a plant and date.", variant: "destructive" });
            return;
        }
        setLoading(true);

        // Get the selected plant name
        const selectedPlant = activePlants.find(plant => plant.id === selectedPlantId);
        const plantName = selectedPlant?.name || "";

        // Call the Edge Function we created in the previous step
        const { error } = await supabase.functions.invoke('student-add-plant', {
            body: { towerId, teacherId, name: plantName, port_number, quantity, planted_at },
        });
        
        setLoading(false);
        if (error) { 
            toast({ title: "Save Failed", description: error.message, variant: "destructive" }); 
        } else { 
            toast({ title: "Success!", description: "The new plant has been added." }); 
            navigate(`/student/tower/${towerId}`); // Go back to the tower detail page
        }
    };

    return (
        <div className="container py-8">
            <SEO title="Add a Plant | Sproutify School" />
            <Card className="max-w-2xl mx-auto">
                <CardHeader><CardTitle>Add a New Plant</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="plantSelect">Select Plant</Label>
                        {plantsLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading plants...</span>
                            </div>
                        ) : plantsError ? (
                            <div className="text-red-500 text-sm">
                                Error loading plants. Please try again.
                            </div>
                        ) : activePlants.length === 0 ? (
                            <div className="text-muted-foreground text-sm">
                                No plants available in your classroom catalog. Ask your teacher to add some plants.
                            </div>
                        ) : (
                            <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a plant from your classroom catalog" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activePlants.map((plant) => (
                                        <SelectItem key={plant.id} value={plant.id}>
                                            {plant.name}
                                            {plant.category && (
                                                <span className="text-muted-foreground ml-2">({plant.category})</span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="portNumber">Port Number (Optional)</Label>
                            <Input id="portNumber" type="number" value={port_number ?? ""} onChange={(e) => setPortNumber(Number(e.target.value) || undefined)} placeholder="e.g., 5" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="plantedAt">Date Planted</Label>
                        <Input id="plantedAt" type="date" value={planted_at} onChange={(e) => setPlantedAt(e.target.value)} required />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleSave} disabled={loading || !selectedPlantId || plantsLoading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Plant"}
                        </Button>
                        <Button variant="outline" asChild><Link to={`/student/tower/${towerId}`}>Back to Tower</Link></Button>
                        <Button variant="outline" asChild><Link to="/student/dashboard">Back to Dashboard</Link></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
