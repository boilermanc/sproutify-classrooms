import { supabase } from "@/integrations/supabase/client";
import { generateUUID } from "@/utils/uuid";

export async function uploadVideo(
  bucket: "pest-videos" | "disease-videos", 
  file: File,
  sectionId: string,
  title?: string,
  description?: string
) {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error("Not signed in");

  // Use our fixed UUID function instead of crypto.randomUUID()
  const filePath = `${user.id}/${generateUUID()}-${file.name}`;

  // Upload file to storage
  const { error: uploadError } = await supabase
    .storage
    .from(bucket)
    .upload(filePath, file, { 
      contentType: file.type || "video/mp4", 
      upsert: false 
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // Insert record into database
  const { error: insertError } = await supabase.from("media_assets").insert({
    section_id: sectionId,
    type: "video",
    bucket,
    object_path: filePath,
    title: title || file.name,
    description: description || "",
    file_size: file.size,
    file_type: file.type
  });

  if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);

  // Optional: signed URL for private access
  const { data: signed, error: urlErr } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(filePath, 60); // 60s

  if (urlErr) throw urlErr;

  return { filePath, signedUrl: signed.signedUrl };
}

// Helper function to get content sections
export async function getContentSections() {
  const { data, error } = await supabase
    .from("content_section")
    .select("id, slug, title, kind")
    .order("title");
  
  if (error) throw error;
  return data;
}

// Helper function to get media assets
export async function getMediaAssets(sectionId?: string) {
  let query = supabase
    .from("media_assets")
    .select(`
      *,
      content_section:section_id (
        id,
        slug,
        title,
        kind
      )
    `)
    .order("created_at", { ascending: false });

  if (sectionId) {
    query = query.eq("section_id", sectionId);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}
