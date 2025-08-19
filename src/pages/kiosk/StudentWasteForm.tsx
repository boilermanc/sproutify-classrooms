// src/pages/kiosk/StudentWasteForm.tsx

import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function StudentWasteForm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const towerId = searchParams.get("towerId");
    const teacherId = localStorage.getItem("teacher_id_for_tower");

    const [plant_name, setPlantName] = useState("");
    const [plant_quantity, setPlantQuantity] = useState(1);
    const [grams, setGrams] = useState<number | undefined>();
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!towerId || !teacherId || !grams || grams <= 0) {
            toast({ title: "Error", description: "A waste weight greater than 0 is required.", variant: "destructive" });
            return;
        }
        setLoading(true);

        // Call the Edge Function we created in the previous step
        const { error } = await supabase.functions.invoke('student-log-waste', {
            body: { towerId, teacherId, plant_name, plant_quantity, grams, notes },
        });
        
        setLoading(false);
        if (error) { 
            toast({ title: "Save Failed", description: error.message, variant: "destructive" }); 
        } else { 
            toast({ title: "Success!", description: "Waste has been logged." }); 
            navigate("/student/dashboard"); 
        }
    };

    return (
        <div className="container py-8">
            <SEO title="Log Waste | Sproutify School" />
            <Card className="max-w-2xl mx-auto">
                <CardHeader><CardTitle>Log Waste</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Plant Name (Optional)</Label>
                            <Input value={plant_name} onChange={(e) => setPlantName(e.target.value)} placeholder="e.g., Lettuce" />
                        </div>
                        <div className="space-y-2">
                            <Label>Number of Plants</Label>
                            <Input type="number" min={1} value={plant_quantity} onChange={(e) => setPlantQuantity(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Waste Weight (grams)</Label>
                        <Input type="number" min={1} value={grams ?? ""} onChange={(e) => setGrams(Number(e.target.value) || undefined)} required placeholder="e.g., 50"/>
                    </div>
                    <div className="space-y-2">
                        <Label>Reason for Waste (Notes)</Label>
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Pest damage, bolted, etc." />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log Waste"}
                        </Button>
                        <Button variant="outline" asChild><Link to="/student/dashboard">Back</Link></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
