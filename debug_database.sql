-- Diagnostic SQL to check what's in your database
-- Run this first to see what data exists

-- Check if content_section table exists and has data
SELECT 'content_section table check:' as check_type;
SELECT COUNT(*) as total_sections FROM public.content_section;
SELECT id, slug, title, kind FROM public.content_section ORDER BY slug;

-- Check if media_assets table exists and has data
SELECT 'media_assets table check:' as check_type;
SELECT COUNT(*) as total_media_assets FROM public.media_assets;
SELECT id, title, bucket, object_path, type FROM public.media_assets ORDER BY created_at DESC;

-- Check table structure
SELECT 'media_assets table structure:' as check_type;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'media_assets' 
AND table_schema = 'public'
ORDER BY ordinal_position;
