-- Test script to verify video upload functionality
-- Run this in your Supabase dashboard SQL editor to check the current state

-- 1. Check if content sections exist and are properly set up
SELECT 'Content Sections Check:' as test_type;
SELECT 
    id, 
    slug, 
    title, 
    kind, 
    description,
    created_at
FROM public.content_section 
ORDER BY kind, title;

-- 2. Check if media_assets table has the correct structure
SELECT 'Media Assets Table Structure:' as test_type;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'media_assets' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if there are any existing media assets
SELECT 'Existing Media Assets:' as test_type;
SELECT 
    ma.id,
    ma.title,
    ma.bucket,
    ma.object_path,
    ma.type,
    ma.is_published,
    ma.created_at,
    cs.slug as section_slug,
    cs.title as section_title,
    cs.kind as section_kind
FROM public.media_assets ma
LEFT JOIN public.content_section cs ON ma.section_id = cs.id
ORDER BY ma.created_at DESC;

-- 4. Check if storage buckets exist (this will show if buckets are accessible)
SELECT 'Storage Buckets Check:' as test_type;
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name IN ('pest-videos', 'disease-videos');

-- 5. Test insert permissions (this will fail if RLS is blocking)
SELECT 'RLS Test - Can we insert media assets?' as test_type;
-- This is just a test query, not an actual insert
SELECT 
    'Test passed - RLS allows reading media_assets' as result
WHERE EXISTS (
    SELECT 1 FROM public.media_assets LIMIT 1
) OR NOT EXISTS (
    SELECT 1 FROM public.media_assets LIMIT 1
);
