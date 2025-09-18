-- Fix tower_documents document_type constraint to allow generated document types
-- The current constraint is too restrictive for our generated content

-- First, drop the existing constraint
ALTER TABLE tower_documents DROP CONSTRAINT IF EXISTS tower_documents_document_type_check;

-- Create a new, more permissive constraint that allows our generated document types
ALTER TABLE tower_documents 
ADD CONSTRAINT tower_documents_document_type_check 
CHECK (document_type IN ('source', 'milestone', 'timeline', 'study-guide', 'faq', 'report', 'generated'));

-- Add comment for debugging
COMMENT ON CONSTRAINT tower_documents_document_type_check ON tower_documents IS 
'Allows various document types including generated content like timelines and study guides';
