import { supabase } from "@/integrations/supabase/client";
import { generateUUID } from "@/utils/uuid";

export interface MilestoneDocument {
  id: string;
  tower_id?: string; // Optional for milestone documents
  classroom_id?: string; // For milestone documents
  teacher_id: string;
  title: string;
  description?: string;
  document_type: 'source' | 'milestone';
  milestone_type?: 'planting' | 'harvest' | 'observation' | 'achievement' | 'learning' | 'custom';
  content?: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMilestoneDocumentData {
  classroom_id: string;
  title: string;
  description?: string;
  milestone_type: 'planting' | 'harvest' | 'observation' | 'achievement' | 'learning' | 'custom';
  content?: string;
  file?: File;
}

export async function createMilestoneDocument(data: CreateMilestoneDocumentData): Promise<MilestoneDocument> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error("Not signed in");

  let filePath: string | undefined;
  let fileUrl: string | undefined;
  let fileName: string | undefined;
  let fileSize: number | undefined;
  let fileType: string | undefined;

  // Handle file upload if provided
  if (data.file) {
    const fileExt = data.file.name.split('.').pop();
    fileName = `${Date.now()}-${generateUUID()}.${fileExt}`;
    filePath = `tower-documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('tower_documents')
      .upload(filePath, data.file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tower_documents')
      .getPublicUrl(filePath);

    fileUrl = publicUrl;
    fileSize = data.file.size;
    fileType = data.file.type;
  }

  // Insert milestone document record into database using tower_documents table
  const { data: milestoneDoc, error: insertError } = await supabase
    .from('tower_documents')
    .insert({
      classroom_id: data.classroom_id,
      teacher_id: user.id,
      title: data.title,
      description: data.description || null,
      document_type: 'milestone',
      milestone_type: data.milestone_type,
      content: data.content || null,
      file_name: fileName || 'milestone.txt', // Default filename if no file
      file_path: filePath || 'milestone-documents/default.txt',
      file_url: fileUrl || '',
      file_size: fileSize || 0,
      file_type: fileType || 'text/plain',
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Database insert failed: ${insertError.message}`);
  }

  return milestoneDoc;
}

export async function getMilestoneDocuments(classroomId: string): Promise<MilestoneDocument[]> {
  const { data, error } = await supabase
    .from('tower_documents')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('document_type', 'milestone')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch milestone documents: ${error.message}`);
  }

  return data || [];
}

export async function getRecentMilestoneDocuments(teacherId: string, limit: number = 10): Promise<MilestoneDocument[]> {
  const { data, error } = await supabase
    .from('tower_documents')
    .select(`
      *,
      classrooms (
        id,
        name
      )
    `)
    .eq('teacher_id', teacherId)
    .eq('document_type', 'milestone')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent milestone documents: ${error.message}`);
  }

  return data || [];
}

export async function updateMilestoneDocument(
  id: string, 
  updates: Partial<CreateMilestoneDocumentData>
): Promise<MilestoneDocument> {
  const { data, error } = await supabase
    .from('tower_documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('document_type', 'milestone')
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update milestone document: ${error.message}`);
  }

  return data;
}

export async function deleteMilestoneDocument(id: string): Promise<void> {
  // First get the document to check if it has a file
  const { data: doc, error: fetchError } = await supabase
    .from('tower_documents')
    .select('file_path')
    .eq('id', id)
    .eq('document_type', 'milestone')
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch document: ${fetchError.message}`);
  }

  // Delete the file from storage if it exists
  if (doc.file_path) {
    const { error: deleteError } = await supabase.storage
      .from('tower_documents')
      .remove([doc.file_path]);

    if (deleteError) {
      console.warn('Failed to delete file from storage:', deleteError);
    }
  }

  // Delete the database record
  const { error: deleteError } = await supabase
    .from('tower_documents')
    .delete()
    .eq('id', id)
    .eq('document_type', 'milestone');

  if (deleteError) {
    throw new Error(`Failed to delete milestone document: ${deleteError.message}`);
  }
}
