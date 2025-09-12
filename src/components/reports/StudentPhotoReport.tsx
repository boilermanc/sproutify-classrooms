// src/components/reports/StudentPhotoReport.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";

interface StudentPhotoReportProps {
  towerId: string;
  teacherId: string;
}

type Photo = {
  id: string;
  file_path: string;
  caption: string | null;
  student_name: string | null;
  taken_at: string;
};

export default function StudentPhotoReport({ towerId, teacherId }: StudentPhotoReportProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!towerId || !teacherId) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("tower_photos")
        .select("id, file_path, caption, student_name, taken_at")
        .eq("tower_id", towerId)
        .eq("teacher_id", teacherId)
        .order("taken_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching photos:", error);
      } else {
        setPhotos(data || []);
      }
      setLoading(false);
    };

    fetchPhotos();
  }, [towerId, teacherId]);

  const publicUrl = (filePath: string) => {
    const { data } = supabase.storage.from("tower-photos").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const openImageLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageLightbox(true);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev > 0 ? prev - 1 : photos.length - 1);
    } else {
      setCurrentImageIndex(prev => prev < photos.length - 1 ? prev + 1 : 0);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Tower Photo Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Tower Photo Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-2">No photos yet</h3>
            <p className="text-sm text-muted-foreground">
              Photos will appear here once students upload them!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Tower Photo Gallery ({photos.length} photos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <figure key={photo.id} className="rounded-md border overflow-hidden relative group">
                <img
                  src={publicUrl(photo.file_path)}
                  alt={photo.caption || "Tower photo"}
                  loading="lazy"
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openImageLightbox(index)}
                />
                <figcaption className="p-3 text-sm">
                  <div className="font-medium">{photo.caption || "—"}</div>
                  <div className="text-muted-foreground text-xs">
                    {photo.student_name ? `By ${photo.student_name} • ` : ""}{new Date(photo.taken_at).toLocaleDateString()}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Image Lightbox */}
      {showImageLightbox && photos.length > 0 && (
        <Dialog open={showImageLightbox} onOpenChange={setShowImageLightbox}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>
                Photo {currentImageIndex + 1} of {photos.length}
                {photos[currentImageIndex]?.caption && (
                  <span className="block text-sm font-normal text-muted-foreground mt-1">
                    {photos[currentImageIndex].caption}
                  </span>
                )}
              </DialogTitle>
              <DialogDescription>
                View tower photos in full size. Use the navigation arrows to browse through all photos.
              </DialogDescription>
            </DialogHeader>
            <div className="relative p-6 pt-0">
              <img
                src={publicUrl(photos[currentImageIndex].file_path)}
                alt={photos[currentImageIndex].caption || "Tower photo"}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
              {photos[currentImageIndex]?.student_name && (
                <div className="text-sm text-muted-foreground mt-2">
                  By {photos[currentImageIndex].student_name} • {new Date(photos[currentImageIndex].taken_at).toLocaleDateString()}
                </div>
              )}
              
              {/* Navigation buttons */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() => navigateImage('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => navigateImage('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
