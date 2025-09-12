-- Fix RLS policies for video upload functionality
-- Run this script in your Supabase dashboard SQL editor

-- 1. First, let's check the current user's team member status
SELECT 'Current User Team Member Status:' as test_type;
SELECT 
    tm.id,
    tm.user_id,
    tm.role,
    tm.active,
    tm.created_at
FROM public.team_members tm
WHERE tm.user_id = '3993b9d4-6d1f-4529-b93e-ca1c5a3de125';

-- 2. Fix media_assets RLS policies
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Team members can view all media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Team members can manage all media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Regular users can view published media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Anonymous users can view published media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Super admins and staff can manage media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Anyone can view published media assets" ON public.media_assets;

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

-- 3. Fix storage.objects RLS policies
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

-- 4. Test the policies
SELECT 'Testing RLS Policy for Media Assets:' as test_type;
SELECT 
    'Policy should allow insert for super_admin' as test_result
WHERE EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = '3993b9d4-6d1f-4529-b93e-ca1c5a3de125'
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
);

-- 5. Check if storage buckets exist
SELECT 'Storage Buckets:' as test_type;
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name IN ('pest-videos', 'disease-videos');
