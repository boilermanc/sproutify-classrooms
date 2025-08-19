// src/pages/kiosk/StudentPhotoForm.tsx

import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { SEO } from "@/components/SEO";

export default function StudentPhotoForm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const towerId = searchParams.get("towerId");
    const teacherId = localStorage.getItem("teacher_id_for_tower");

    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState("");
    const [studentName, setStudentName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file || !towerId || !teacherId) {
            toast({ title: "Error", description: "A photo file is required.", variant: "destructive" });
            return;
        }
        setLoading(true);

        try {
            // Step 1: Upload the file directly to Supabase Storage
            const ext = file.name.split(".").pop() || "jpg";
            const filename = `${nanoid()}.${ext}`;
            const file_path = `${teacherId}/${towerId}/${filename}`;

            const { error: uploadError } = await supabase.storage
                .from("tower-photos")
                .upload(file_path, file);

            if (uploadError) throw uploadError;

            // Step 2: If upload is successful, call our Edge Function to save the metadata
            const { error: invokeError } = await supabase.functions.invoke('student-log-photo', {
                body: { towerId, teacherId, file_path, caption, student_name },
            });

            if (invokeError) throw invokeError;

            toast({ title: "Success!", description: "Your photo has been uploaded." });
            navigate(`/student/tower/${towerId}`); // Go back to the tower detail page

        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-8">
            <SEO title="Add Photo | Sproutify School" />
            <Card className="max-w-2xl mx-auto">
                <CardHeader><CardTitle>Add a Photo</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="photoFile">Photo File</Label>
                        <Input id="photoFile" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="studentName">Your Name (Optional)</Label>
                        <Input id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g., Alex" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="caption">Caption (Optional)</Label>
                        <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g., Week 3 growth!" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleUpload} disabled={loading || !file}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Upload Photo"}
                        </Button>
                        <Button variant="outline" asChild><Link to={`/student/tower/${towerId}`}>Back</Link></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
