-- Fix RLS policies for video upload functionality
-- This migration ensures that super admins and staff can upload videos without RLS blocking

-- 1. Fix media_assets RLS policies
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Team members can view all media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Team members can manage all media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Regular users can view published media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Anonymous users can view published media assets" ON public.media_assets;

-- Create new, simpler policies for media_assets
-- Policy 1: Anyone can view published media assets
CREATE POLICY "Anyone can view published media assets"
ON public.media_assets
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Policy 2: Team members can manage all media assets (insert, update, delete)
CREATE POLICY "Team members can manage all media assets"
ON public.media_assets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
);

-- 2. Fix storage.objects RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Team members can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Team members can manage videos" ON storage.objects;
DROP POLICY IF EXISTS "Team members can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;

-- Create new storage policies
-- Policy 1: Team members can upload videos
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

-- Policy 2: Team members can update videos
CREATE POLICY "Team members can update videos"
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

-- Policy 3: Team members can delete videos
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

-- Policy 4: Anyone can view videos (for public access)
CREATE POLICY "Anyone can view videos"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('pest-videos', 'disease-videos'));

-- 3. Ensure team_members policies are working correctly
-- The existing policies from the previous migration should be sufficient
-- But let's make sure they're not conflicting

-- 4. Add a comment for debugging
COMMENT ON POLICY "Team members can manage all media assets" ON public.media_assets IS 
'Allows super_admin and staff team members to insert, update, and delete media assets';

COMMENT ON POLICY "Team members can upload videos" ON storage.objects IS 
'Allows super_admin and staff team members to upload videos to pest-videos and disease-videos buckets';
