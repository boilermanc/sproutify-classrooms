-- Test script to verify milestone documents functionality
-- Run this in Supabase SQL Editor after running the migration

-- 1. Check if the new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tower_documents' 
AND column_name IN ('document_type', 'milestone_type', 'content', 'classroom_id')
ORDER BY column_name;

-- 2. Check if indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'tower_documents' 
AND indexname LIKE '%milestone%' OR indexname LIKE '%document_type%';

-- 3. Test inserting a sample milestone document (replace with actual classroom_id)
-- INSERT INTO tower_documents (
--   classroom_id,
--   teacher_id,
--   title,
--   description,
--   document_type,
--   milestone_type,
--   content,
--   file_name,
--   file_path,
--   file_url,
--   file_size,
--   file_type
-- ) VALUES (
--   'your-classroom-id-here',
--   'your-teacher-id-here',
--   'Test Milestone',
--   'This is a test milestone document',
--   'milestone',
--   'achievement',
--   'Detailed content about this achievement...',
--   'test-milestone.txt',
--   'tower-documents/test-milestone.txt',
--   'https://example.com/test-milestone.txt',
--   0,
--   'text/plain'
-- );

-- 4. Query milestone documents
-- SELECT 
--   id,
--   title,
--   milestone_type,
--   document_type,
--   created_at
-- FROM tower_documents 
-- WHERE document_type = 'milestone'
-- ORDER BY created_at DESC;
