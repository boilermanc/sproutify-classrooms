import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";
import { toast } from "@/hooks/use-toast";

interface Props {
  towerId: string;
}

type Photo = {
  id: string;
  file_path: string;
  caption: string | null;
  student_name: string | null;
  taken_at: string;
};

export default function TowerPhotosTab({ towerId }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [studentName, setStudentName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setTeacherId(data.user?.id ?? null);
    });
  }, []);

  const loadPhotos = useMemo(() => async () => {
    const { data, error } = await supabase
      .from("tower_photos")
      .select("id, file_path, caption, student_name, taken_at")
      .eq("tower_id", towerId)
      .order("taken_at", { ascending: false });
    if (error) {
      console.error(error);
      toast({ title: "Failed to load photos" });
    } else {
      setPhotos(data as Photo[]);
    }
  }, [towerId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleUpload = async () => {
    if (!file) return;
    if (!teacherId) {
      toast({ title: "Not signed in" });
      return;
    }
    try {
      setUploading(true);
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${nanoid()}.${ext}`;
      const path = `${teacherId}/${towerId}/${filename}`;

      const { error: upErr } = await supabase.storage
        .from("tower-photos")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("tower_photos").insert({
        teacher_id: teacherId,
        tower_id: towerId,
        file_path: path,
        caption: caption || null,
        student_name: studentName || null,
      });
      if (insErr) throw insErr;

      setCaption("");
      setStudentName("");
      setFile(null);
      toast({ title: "Photo uploaded" });
      await loadPhotos();
    } catch (e) {
      console.error(e);
      toast({ title: "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const publicUrl = (filePath: string) => {
    const { data } = supabase.storage.from("tower-photos").getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Photo</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Image</Label>
            <Input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-2">
            <Label>Student name (optional)</Label>
            <Input value={studentName} onChange={(e)=>setStudentName(e.target.value)} placeholder="e.g. Alex" />
          </div>
          <div className="space-y-2">
            <Label>Caption</Label>
            <Input value={caption} onChange={(e)=>setCaption(e.target.value)} placeholder="What changed today?" />
          </div>
          <div className="md:col-span-4">
            <Button onClick={handleUpload} disabled={uploading || !file}>{uploading ? "Uploading..." : "Upload"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          {photos.length === 0 && (
            <div className="text-sm text-muted-foreground">No photos yet.</div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <figure key={p.id} className="rounded-md border overflow-hidden">
                <img
                  src={publicUrl(p.file_path)}
                  alt={p.caption || "Tower photo"}
                  loading="lazy"
                  className="w-full h-48 object-cover"
                />
                <figcaption className="p-3 text-sm">
                  <div className="font-medium">{p.caption || "—"}</div>
                  <div className="text-muted-foreground text-xs">
                    {p.student_name ? `By ${p.student_name} • ` : ""}{new Date(p.taken_at).toLocaleDateString()}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
