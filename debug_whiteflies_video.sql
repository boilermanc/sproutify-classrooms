-- Debug script to check why whiteflies video isn't showing in UI
-- Run this in your Supabase dashboard SQL editor

-- 1. Check if whiteflies content section exists
SELECT 'Checking content sections:' as test_type;
SELECT id, slug, title, kind, description 
FROM public.content_section 
WHERE slug LIKE '%white%' OR title LIKE '%white%'
ORDER BY title;

-- 2. Check all content sections to see what's available
SELECT 'All content sections:' as test_type;
SELECT id, slug, title, kind, description 
FROM public.content_section 
ORDER BY kind, title;

-- 3. Check if there are any videos in media_assets table
SELECT 'All videos in media_assets:' as test_type;
SELECT 
    ma.id,
    ma.title,
    ma.bucket,
    ma.object_path,
    ma.is_published,
    ma.created_at,
    cs.slug as section_slug,
    cs.title as section_title
FROM public.media_assets ma
LEFT JOIN public.content_section cs ON ma.section_id = cs.id
WHERE ma.type = 'video'
ORDER BY ma.created_at DESC;

-- 4. Check specifically for whiteflies videos
SELECT 'Whiteflies videos:' as test_type;
SELECT 
    ma.id,
    ma.title,
    ma.bucket,
    ma.object_path,
    ma.is_published,
    ma.created_at,
    cs.slug as section_slug,
    cs.title as section_title
FROM public.media_assets ma
LEFT JOIN public.content_section cs ON ma.section_id = cs.id
WHERE ma.type = 'video'
AND (cs.slug LIKE '%white%' OR cs.title LIKE '%white%' OR ma.title LIKE '%white%')
ORDER BY ma.created_at DESC;

-- 5. Check RLS policies on media_assets table
SELECT 'RLS policies on media_assets:' as test_type;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'media_assets';

-- 6. Test the exact query used by VideoManagement component (with proper SQL join)
SELECT 'Testing VideoManagement query:' as test_type;
SELECT 
    ma.id,
    ma.section_id,
    ma.type,
    ma.bucket,
    ma.object_path,
    ma.title,
    ma.description,
    ma.file_size,
    ma.file_type,
    ma.duration_seconds,
    ma.thumbnail_url,
    ma.is_published,
    ma.created_at,
    ma.created_by,
    cs.id as content_section_id,
    cs.slug as content_section_slug,
    cs.title as content_section_title,
    cs.kind as content_section_kind
FROM public.media_assets ma
LEFT JOIN public.content_section cs ON ma.section_id = cs.id
WHERE ma.type = 'video'
ORDER BY ma.created_at DESC;

-- 7. Check if there are any recent uploads (last 24 hours)
SELECT 'Recent uploads (last 24 hours):' as test_type;
SELECT 
    ma.id,
    ma.title,
    ma.bucket,
    ma.object_path,
    ma.is_published,
    ma.created_at,
    cs.slug as section_slug,
    cs.title as section_title
FROM public.media_assets ma
LEFT JOIN public.content_section cs ON ma.section_id = cs.id
WHERE ma.type = 'video'
AND ma.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY ma.created_at DESC;

-- 8. Check storage buckets
SELECT 'Storage buckets:' as test_type;
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name IN ('pest-videos', 'disease-videos');

-- 9. Check if files exist in storage for recent uploads
SELECT 'Files in storage buckets:' as test_type;
SELECT 
    bucket_id,
    name,
    metadata->>'size' as file_size,
    created_at
FROM storage.objects
WHERE bucket_id IN ('pest-videos', 'disease-videos')
AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
