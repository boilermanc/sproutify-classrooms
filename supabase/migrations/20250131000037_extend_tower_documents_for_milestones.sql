-- Extend tower_documents table for milestone documents
-- This migration adds support for milestone documents to the existing tower_documents table

-- Add new columns to existing tower_documents table
ALTER TABLE tower_documents 
ADD COLUMN IF NOT EXISTS document_type TEXT NOT NULL DEFAULT 'source' CHECK (document_type IN ('source', 'milestone')),
ADD COLUMN IF NOT EXISTS milestone_type TEXT CHECK (milestone_type IN ('planting', 'harvest', 'observation', 'achievement', 'learning', 'custom')),
ADD COLUMN IF NOT EXISTS content TEXT, -- Rich text content for milestones
ADD COLUMN IF NOT EXISTS classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE;

-- Update existing records to have the default document_type
UPDATE tower_documents SET document_type = 'source' WHERE document_type IS NULL;

-- Create index for milestone documents
CREATE INDEX IF NOT EXISTS idx_tower_documents_document_type ON tower_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_tower_documents_milestone_type ON tower_documents(milestone_type);
CREATE INDEX IF NOT EXISTS idx_tower_documents_classroom_id ON tower_documents(classroom_id);

-- Update RLS policies to handle both source and milestone documents
-- The existing policies should work fine since they're based on teacher_id and tower_id
-- For milestone documents, we'll use classroom_id instead of tower_id
