-- Fix RLS policies to allow anonymous read access for student interface
-- Students need to be able to read tower data without authentication

-- Add anonymous read access to plantings table
CREATE POLICY "Anonymous users can view plantings"
ON public.plantings
FOR SELECT
TO anon
USING (true);

-- Add anonymous read access to tower_vitals table  
CREATE POLICY "Anonymous users can view tower vitals"
ON public.tower_vitals
FOR SELECT
TO anon
USING (true);

-- Add anonymous read access to harvests table
CREATE POLICY "Anonymous users can view harvests"
ON public.harvests
FOR SELECT
TO anon
USING (true);

-- Add anonymous read access to pest_logs table
CREATE POLICY "Anonymous users can view pest logs"
ON public.pest_logs
FOR SELECT
TO anon
USING (true);

-- Add anonymous read access to waste_logs table
CREATE POLICY "Anonymous users can view waste logs"
ON public.waste_logs
FOR SELECT
TO anon
USING (true);

-- Add anonymous read access to tower_photos table
CREATE POLICY "Anonymous users can view tower photos"
ON public.tower_photos
FOR SELECT
TO anon
USING (true);

-- Add anonymous read access to tower_documents table
CREATE POLICY "Anonymous users can view tower documents"
ON public.tower_documents
FOR SELECT
TO anon
USING (true);

-- Add comments for debugging
COMMENT ON POLICY "Anonymous users can view plantings" ON public.plantings IS 
'Allows anonymous users (students) to view plantings data for AI chat';

COMMENT ON POLICY "Anonymous users can view tower vitals" ON public.tower_vitals IS 
'Allows anonymous users (students) to view tower vitals data for AI chat';

COMMENT ON POLICY "Anonymous users can view harvests" ON public.harvests IS 
'Allows anonymous users (students) to view harvests data for AI chat';

COMMENT ON POLICY "Anonymous users can view pest logs" ON public.pest_logs IS 
'Allows anonymous users (students) to view pest logs data for AI chat';

COMMENT ON POLICY "Anonymous users can view waste logs" ON public.waste_logs IS 
'Allows anonymous users (students) to view waste logs data for AI chat';

COMMENT ON POLICY "Anonymous users can view tower photos" ON public.tower_photos IS 
'Allows anonymous users (students) to view tower photos data for AI chat';

COMMENT ON POLICY "Anonymous users can view tower documents" ON public.tower_documents IS 
'Allows anonymous users (students) to view tower documents data for AI chat';
