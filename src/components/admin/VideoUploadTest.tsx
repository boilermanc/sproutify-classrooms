import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateUUID } from "@/utils/uuid";

interface ContentSection {
  id: string;
  slug: string;
  title: string;
  kind: "pest" | "disease";
}

export default function VideoUploadTest() {
  const { toast } = useToast();
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [sectionId, setSectionId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from("content_section")
        .select("id, slug, title, kind")
        .order("title");
      
      if (error) {
        addTestResult(`❌ Failed to load sections: ${error.message}`);
      } else {
        setSections(data || []);
        addTestResult(`✅ Loaded ${data?.length || 0} content sections`);
      }
    } catch (error: any) {
      addTestResult(`❌ Error loading sections: ${error.message}`);
    }
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testUpload = async () => {
    if (!file || !sectionId) {
      toast({ 
        title: "Missing Information", 
        description: "Please select a section and a file." 
      });
      return;
    }

    setIsUploading(true);
    addTestResult("🔄 Starting upload test...");

    try {
      const section = sections.find(s => s.id === sectionId)!;
      const bucket = section.kind === "pest" ? "pest-videos" : "disease-videos";
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const object_path = `${section.slug}/${generateUUID()}.${ext}`;

      addTestResult(`📁 Uploading to bucket: ${bucket}`);
      addTestResult(`📁 Object path: ${object_path}`);

      // Test storage upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(object_path, file, { 
          upsert: false, 
          contentType: file.type || "video/mp4" 
        });

      if (uploadError) {
        addTestResult(`❌ Storage upload failed: ${uploadError.message}`);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      addTestResult(`✅ File uploaded successfully to storage`);

      // Test database insert
      const { error: insertError } = await supabase.from("media_assets").insert({
        section_id: sectionId,
        type: "video",
        bucket,
        object_path,
        title: title || file.name,
        description: `Test upload - ${new Date().toISOString()}`,
        file_size: file.size,
        file_type: file.type
      });

      if (insertError) {
        addTestResult(`❌ Database insert failed: ${insertError.message}`);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      addTestResult(`✅ Database record created successfully`);
      addTestResult(`🎉 Upload test completed successfully!`);

      toast({ 
        title: "Test Success", 
        description: "Video upload test completed successfully!" 
      });

      // Reset form
      setFile(null);
      setTitle("");
      setSectionId("");

    } catch (error: any) {
      addTestResult(`❌ Upload test failed: ${error.message}`);
      toast({
        title: "Test Failed",
        description: error.message || "Upload test failed",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Upload Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="block mb-1">Content Section</Label>
            <select 
              className="w-full border rounded p-2" 
              value={sectionId} 
              onChange={e => setSectionId(e.target.value)}
            >
              <option value="">Select a section…</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>
                  {s.kind}: {s.title} ({s.slug})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label className="block mb-1">Video Title</Label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Test video title" 
            />
          </div>
          
          <div>
            <Label className="block mb-1">Video File</Label>
            <Input 
              type="file" 
              accept="video/*" 
              onChange={e => setFile(e.target.files?.[0] ?? null)} 
            />
          </div>
          
          <Button 
            onClick={testUpload} 
            disabled={!file || !sectionId || isUploading}
            className="w-full"
          >
            {isUploading ? "Testing Upload..." : "Test Upload"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">No test results yet. Run a test to see results.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
