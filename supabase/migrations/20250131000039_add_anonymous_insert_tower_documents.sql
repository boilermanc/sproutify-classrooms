-- Add anonymous insert policy for tower_documents table
-- This allows students to create documents (timelines, study guides, etc.) without authentication

-- Add anonymous insert access to tower_documents table
CREATE POLICY "Anonymous users can insert tower documents"
ON public.tower_documents
FOR INSERT
TO anon
WITH CHECK (true);

-- Add comment for debugging
COMMENT ON POLICY "Anonymous users can insert tower documents" ON public.tower_documents IS 
'Allows anonymous users (students) to insert documents like timelines and study guides';
