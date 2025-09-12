-- Fix storage bucket policies for pest-videos and disease-videos
-- This migration ensures that super admins and staff can upload videos to storage buckets

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for storage.objects if they exist
DROP POLICY IF EXISTS "Team members can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Team members can manage videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view published videos" ON storage.objects;

-- Policy 1: Team members can upload videos to pest-videos and disease-videos buckets
CREATE POLICY "Team members can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('pest-videos', 'disease-videos')
  AND EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
);

-- Policy 2: Team members can update/delete videos in pest-videos and disease-videos buckets
CREATE POLICY "Team members can manage videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('pest-videos', 'disease-videos')
  AND EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
)
WITH CHECK (
  bucket_id IN ('pest-videos', 'disease-videos')
  AND EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
);

-- Policy 3: Team members can delete videos in pest-videos and disease-videos buckets
CREATE POLICY "Team members can delete videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('pest-videos', 'disease-videos')
  AND EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
);

-- Policy 4: Anyone can view videos from pest-videos and disease-videos buckets (for public access)
CREATE POLICY "Anyone can view videos"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('pest-videos', 'disease-videos'));
