// src/pages/kiosk/StudentPlantForm.tsx

import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function StudentPlantForm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const towerId = searchParams.get("towerId");
    const teacherId = localStorage.getItem("teacher_id_for_tower");

    const [name, setName] = useState("");
    const [port_number, setPortNumber] = useState<number | undefined>();
    const [quantity, setQuantity] = useState(1);
    // Default the planted_at date to today for convenience
    const [planted_at, setPlantedAt] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!towerId || !teacherId || !name.trim() || !planted_at) {
            toast({ title: "Error", description: "Plant name and date are required.", variant: "destructive" });
            return;
        }
        setLoading(true);

        // Call the Edge Function we created in the previous step
        const { error } = await supabase.functions.invoke('student-add-plant', {
            body: { towerId, teacherId, name, port_number, quantity, planted_at },
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
                        <Label htmlFor="plantName">Plant Name</Label>
                        <Input id="plantName" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Buttercrunch Lettuce" />
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
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Plant"}
                        </Button>
                        <Button variant="outline" asChild><Link to={`/student/tower/${towerId}`}>Back</Link></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
