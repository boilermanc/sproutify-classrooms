// src/pages/kiosk/StudentDocumentForm.tsx

import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function StudentDocumentForm() {
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const towerId = searchParams.get("towerId");
    const teacherId = localStorage.getItem("teacher_id_for_tower");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSave = async () => {
        if (!towerId || !teacherId || !title.trim()) {
            toast({ 
                title: "Error", 
                description: "Title is required.", 
                variant: "destructive" 
            });
            return;
        }

        if (!file) {
            toast({ 
                title: "Error", 
                description: "Please select a file to upload.", 
                variant: "destructive" 
            });
            return;
        }

        setLoading(true);

        try {
            // Upload file to Supabase storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `tower-documents/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('tower_documents')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('tower_documents')
                .getPublicUrl(filePath);

            // Insert document record into database
            const { error: insertError } = await supabase
                .from('tower_documents')
                .insert({
                    tower_id: towerId,
                    teacher_id: teacherId,
                    title: title.trim(),
                    description: description.trim() || null,
                    file_name: file.name,
                    file_path: filePath,
                    file_url: publicUrl,
                    file_size: file.size,
                    file_type: file.type
                });

            if (insertError) {
                throw insertError;
            }

            toast({ 
                title: "Success", 
                description: "Document uploaded successfully!" 
            });

            // Reset form
            setTitle("");
            setDescription("");
            setFile(null);
            
            // Reset file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error('Error uploading document:', error);
            toast({ 
                title: "Error", 
                description: "Failed to upload document. Please try again.", 
                variant: "destructive" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-8">
            <SEO title="Add Document | Sproutify School" />
            
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Add Document</h1>
                    <p className="text-muted-foreground">Upload a document related to this tower.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Document Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Enter document title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Optional description of the document"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file-upload">File *</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                    className="flex-1"
                                />
                                {file && (
                                    <div className="text-sm text-muted-foreground">
                                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
                            </p>
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Document
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to={towerId ? `/student/tower/${towerId}` : "/student/dashboard"}>
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
