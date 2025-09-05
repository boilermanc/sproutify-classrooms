import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2 } from "lucide-react";

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

export function TowerPhotosTab({ towerId }: Props) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [studentName, setStudentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTeacherId(session?.user?.id ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setTeacherId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadPhotos = useCallback(async () => {
    if (!teacherId) return;

    const { data, error } = await supabase
      .from("tower_photos")
      .select("id, file_path, caption, student_name, taken_at")
      .eq("tower_id", towerId)
      .eq("teacher_id", teacherId)
      .order("taken_at", { ascending: false });

    if (error) {
      console.error(error);
      toast({ title: "Failed to load photos", description: error.message, variant: "destructive" });
    } else {
      setPhotos(data as Photo[]);
    }
  }, [towerId, teacherId, toast]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleUpload = async () => {
    if (!file) return;
    if (!teacherId) {
      toast({ title: "Not signed in", variant: "destructive" });
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
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      toast({ title: "Photo uploaded" });
      await loadPhotos();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!teacherId) {
      toast({ title: "Not signed in", variant: "destructive" });
      return;
    }

    try {
      setDeletingPhotoId(photo.id);

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from("tower-photos")
        .remove([photo.file_path]);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        // Continue anyway - the file might already be deleted
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("tower_photos")
        .delete()
        .eq("id", photo.id)
        .eq("teacher_id", teacherId); // Security: only delete your own photos

      if (dbError) throw dbError;

      toast({ title: "Photo deleted" });
      await loadPhotos(); // Refresh the gallery
    } catch (e: any) {
      console.error(e);
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    } finally {
      setDeletingPhotoId(null);
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
            <Button onClick={handleUpload} disabled={uploading || !file}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
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
              <figure key={p.id} className="rounded-md border overflow-hidden relative group">
                <img
                  src={publicUrl(p.file_path)}
                  alt={p.caption || "Tower photo"}
                  loading="lazy"
                  className="w-full h-48 object-cover"
                />
                
                {/* Delete button - shows on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={deletingPhotoId === p.id}
                        className="h-8 w-8 p-0"
                      >
                        {deletingPhotoId === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this photo from your tower gallery. This action cannot be undone.
                          {p.caption && (
                            <span className="block mt-2 font-medium">"{p.caption}"</span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(p)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Photo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

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