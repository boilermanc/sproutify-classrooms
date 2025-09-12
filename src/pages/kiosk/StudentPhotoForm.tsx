// src/pages/kiosk/StudentPhotoForm.tsx

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Camera } from "lucide-react";
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

    // Auto-populate student name from localStorage
    useEffect(() => {
        const storedStudentName = localStorage.getItem("student_name");
        if (storedStudentName) {
            setStudentName(storedStudentName);
        }
    }, []);

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
            console.log('Calling student-log-photo with:', { towerId, teacherId, file_path, caption, student_name: studentName });
            
            const { error: invokeError } = await supabase.functions.invoke('student-log-photo', {
                body: { towerId, teacherId, file_path, caption, student_name: studentName },
            });

            if (invokeError) {
                console.error('Edge function error:', invokeError);
                throw invokeError;
            }

            toast({ title: "Success!", description: "Your photo has been uploaded." });
            navigate(`/student/tower/${towerId}`); // Go back to the tower detail page

        } catch (error: any) {
            console.error('Upload error:', error);
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-8">
            <SEO title="Add Photo | Sproutify School" />
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h1 className="text-3xl font-bold">Add a Photo</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload a photo to document your tower's progress
                    </p>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Photo Upload
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="photoFile" className="text-base font-medium">Select Photo</Label>
                            <Input 
                                id="photoFile" 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)} 
                                required 
                                className="cursor-pointer"
                            />
                            <p className="text-sm text-muted-foreground">
                                Choose a photo from your device (JPG, PNG, etc.)
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="studentName" className="text-base font-medium">Your Name</Label>
                            <Input 
                                id="studentName" 
                                value={studentName} 
                                onChange={(e) => setStudentName(e.target.value)} 
                                placeholder="e.g., Alex" 
                            />
                            <p className="text-sm text-muted-foreground">
                                This will be shown with your photo
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="caption" className="text-base font-medium">Caption (Optional)</Label>
                            <Input 
                                id="caption" 
                                value={caption} 
                                onChange={(e) => setCaption(e.target.value)} 
                                placeholder="e.g., Week 3 growth! Plants are getting taller." 
                            />
                            <p className="text-sm text-muted-foreground">
                                Describe what's happening in your photo
                            </p>
                        </div>
                        
                        {file && (
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm font-medium text-green-700 mb-2">✓ Photo selected:</p>
                                <p className="text-sm text-muted-foreground">{file.name}</p>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3 pt-4">
                            <Button 
                                onClick={handleUpload} 
                                disabled={loading || !file}
                                size="lg"
                                className="flex-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="mr-2 h-4 w-4" />
                                        Upload Photo
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" asChild size="lg">
                                <Link to={`/student/tower/${towerId}`}>Cancel</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
