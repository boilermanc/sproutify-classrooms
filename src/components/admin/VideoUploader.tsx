import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { generateUUID } from "@/utils/uuid";

type Section = { id: string; slug: string; title: string; kind: "pest"|"disease" };

export default function VideoUploader() {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionId, setSectionId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("content_section")
        .select("id, slug, title, kind")
        .order("title");
      if (!error) setSections((data ?? []) as any);
    })();
  }, []);

  const handleUpload = async () => {
    if (!file || !sectionId) {
      toast({ description: "Pick a section and a file." });
      return;
    }
    const section = sections.find(s => s.id === sectionId)!;
    const bucket = section.kind === "pest" ? "pest-videos" : "disease-videos";
    const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    
    const object_path = `${section.slug}/${generateUUID()}.${ext}`;

    const { data: up, error: upErr } = await supabase.storage
      .from(bucket)
      .upload(object_path, file, { upsert: false, contentType: file.type || "video/mp4" });

    if (upErr) {
      toast({ variant:"destructive", description: `Upload failed: ${upErr.message}` });
      return;
    }

    const { error: insErr } = await supabase.from("media_assets").insert({
      section_id: sectionId,
      type: "video",
      bucket,
      object_path,
      title: title || file.name,
      description: desc
    });

    if (insErr) {
      toast({ variant:"destructive", description: `Saved file, but DB insert failed: ${insErr.message}` });
      return;
    }

    setProgress(100);
    toast({ description: "Video uploaded & attached!" });
    setFile(null); setTitle(""); setDesc(""); setSectionId("");
    setTimeout(()=>setProgress(0), 1200);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <div>
          <Label className="block mb-1">Section</Label>
          <select className="w-full border rounded p-2" value={sectionId} onChange={e=>setSectionId(e.target.value)}>
            <option value="">Select a section…</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.kind}: {s.title} ({s.slug})</option>)}
          </select>
        </div>
        <div>
          <Label className="block mb-1">Video title</Label>
          <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Optional title" />
        </div>
        <div>
          <Label className="block mb-1">Description</Label>
          <Input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Optional description" />
        </div>
        <div>
          <Label className="block mb-1">Video file</Label>
          <Input type="file" accept="video/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
        </div>
        {progress > 0 && <Progress value={progress} className="w-full" />}
        <Button onClick={handleUpload} disabled={!file || !sectionId}>Upload</Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p className="mb-2">Files go into the correct bucket automatically:</p>
        <code className="block p-2 rounded bg-muted">
{`bucket = section.kind === 'pest' ? 'pest-videos' : 'disease-videos'
object_path = \`\${section.slug}/\${uuid}.\${ext}\``}
        </code>
        <p className="mt-3">To render publicly on the site:</p>
        <code className="block p-2 rounded bg-muted">
{`const { data: { publicUrl } } = supabase
  .storage.from(bucket)
  .getPublicUrl(object_path);`}
        </code>
        <p className="mt-2 break-words">Example (your existing):<br/>
          https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/pest-videos/spider-mites-identification-management.mp4
        </p>
      </div>
    </div>
  );
}
