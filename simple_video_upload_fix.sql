-- Simple fix for video upload RLS issue
-- Run this script in your Supabase dashboard SQL editor

-- 1. First, let's see what tables actually exist
SELECT 'Existing Tables:' as test_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check if storage buckets exist
SELECT 'Storage Buckets:' as test_type;
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name IN ('pest-videos', 'disease-videos');

-- 3. Check current RLS policies on media_assets
SELECT 'Current Media Assets Policies:' as test_type;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'media_assets' 
AND schemaname = 'public'
ORDER BY policyname;

-- 4. Check current RLS policies on storage.objects
SELECT 'Current Storage Policies:' as test_type;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 5. Simple fix: Disable RLS temporarily on media_assets to allow uploads
-- This is a temporary solution to get uploads working
ALTER TABLE public.media_assets DISABLE ROW LEVEL SECURITY;

-- 6. Create a simple policy that allows authenticated users to manage media_assets
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to manage media_assets (temporary solution)
CREATE POLICY "Authenticated users can manage media assets"
ON public.media_assets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous users to view published media_assets
CREATE POLICY "Anyone can view published media assets"
ON public.media_assets
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- 7. Fix storage policies - allow authenticated users to upload to video buckets
-- Drop existing storage policies
DROP POLICY IF EXISTS "Team members can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Team members can manage videos" ON storage.objects;
DROP POLICY IF EXISTS "Team members can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;

-- Create simple storage policies
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('pest-videos', 'disease-videos'));

CREATE POLICY "Authenticated users can manage videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id IN ('pest-videos', 'disease-videos'))
WITH CHECK (bucket_id IN ('pest-videos', 'disease-videos'));

CREATE POLICY "Authenticated users can delete videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id IN ('pest-videos', 'disease-videos'));

CREATE POLICY "Anyone can view videos"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('pest-videos', 'disease-videos'));

-- 8. Test the setup
SELECT 'Setup Complete - Try uploading a video now!' as test_type;
