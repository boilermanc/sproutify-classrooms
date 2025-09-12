-- Fix tower_photos RLS policies for student photo uploads
-- This migration adds the necessary policies to allow students to upload photos

-- First, check if RLS is enabled (it should be)
-- ALTER TABLE public.tower_photos ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Students can insert photos" ON public.tower_photos;
DROP POLICY IF EXISTS "Anyone can view photos" ON public.tower_photos;
DROP POLICY IF EXISTS "Teachers can manage photos" ON public.tower_photos;

-- Policy 1: Allow anonymous users (students) to insert photos
-- This is needed for the kiosk mode where students aren't authenticated
CREATE POLICY "Students can insert photos"
ON public.tower_photos
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Allow anyone to view photos (for public access)
CREATE POLICY "Anyone can view photos"
ON public.tower_photos
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 3: Allow teachers to update/delete their own photos
CREATE POLICY "Teachers can manage photos"
ON public.tower_photos
FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Policy 4: Allow teachers to delete their own photos
CREATE POLICY "Teachers can delete photos"
ON public.tower_photos
FOR DELETE
TO authenticated
USING (teacher_id = auth.uid());

-- Add comments for debugging
COMMENT ON POLICY "Students can insert photos" ON public.tower_photos IS 
'Allows students to upload photos via kiosk mode';

COMMENT ON POLICY "Anyone can view photos" ON public.tower_photos IS 
'Allows anyone to view tower photos';

COMMENT ON POLICY "Teachers can manage photos" ON public.tower_photos IS 
'Allows teachers to update photos they own';

COMMENT ON POLICY "Teachers can delete photos" ON public.tower_photos IS 
'Allows teachers to delete photos they own';
