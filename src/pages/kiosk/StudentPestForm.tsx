// src/pages/kiosk/StudentPestForm.tsx

import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function StudentPestForm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const towerId = searchParams.get("towerId");
    const teacherId = localStorage.getItem("teacher_id_for_tower");

    const [pest, setPest] = useState("");
    const [action, setAction] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!towerId || !teacherId || !pest.trim()) {
            toast({ title: "Error", description: "An observation description is required.", variant: "destructive" });
            return;
        }
        setLoading(true);

        // Call the Edge Function we created in the previous step
        const { error } = await supabase.functions.invoke('student-log-pest', {
            body: { towerId, teacherId, pest, action, notes },
        });
        
        setLoading(false);
        if (error) { 
            toast({ title: "Save Failed", description: error.message, variant: "destructive" }); 
        } else { 
            toast({ title: "Success!", description: "Pest observation has been logged." }); 
            navigate("/student/dashboard"); 
        }
    };

    return (
        <div className="container py-8">
            <SEO title="Log Pest Observation | Sproutify School" />
            <Card className="max-w-2xl mx-auto">
                <CardHeader><CardTitle>Log Pest Observation</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Pest / Observation</Label>
                        <Textarea value={pest} onChange={(e) => setPest(e.target.value)} required placeholder="e.g., Small white flies on the kale leaves." />
                    </div>
                    <div className="space-y-2">
                        <Label>Action Taken (Optional)</Label>
                        <Textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g., Washed leaves with soapy water." />
                    </div>
                    <div className="space-y-2">
                        <Label>Notes (Optional)</Label>
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any extra details..." />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Observation"}
                        </Button>
                        <Button variant="outline" asChild><Link to="/student/dashboard">Back</Link></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
