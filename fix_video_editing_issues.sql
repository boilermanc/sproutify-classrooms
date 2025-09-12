-- Fix video editing issues - storage access and database update errors
-- This script addresses both the storage access issues and the updated_at trigger problem

-- 1. First, let's check the current state of the media_assets table
SELECT 'Current media_assets table structure:' as test_type;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'media_assets' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if the updated_at trigger exists
SELECT 'Current triggers on media_assets:' as test_type;
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'media_assets'
AND event_object_schema = 'public';

-- 3. Ensure the updated_at column exists and has the right properties
DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_assets' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.media_assets ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();
        RAISE NOTICE 'Added updated_at column to media_assets';
    ELSE
        RAISE NOTICE 'updated_at column already exists in media_assets';
    END IF;
    
    -- Update any existing records that might have NULL updated_at
    UPDATE public.media_assets 
    SET updated_at = now() 
    WHERE updated_at IS NULL;
    
    RAISE NOTICE 'Updated any NULL updated_at values';
END $$;

-- 4. Ensure the update_updated_at_column function exists and is correct
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the NEW record has an updated_at column
    IF TG_TABLE_NAME = 'media_assets' THEN
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Drop and recreate the trigger to ensure it works properly
DROP TRIGGER IF EXISTS update_media_assets_updated_at ON public.media_assets;

CREATE TRIGGER update_media_assets_updated_at 
    BEFORE UPDATE ON public.media_assets 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Check for orphaned video records (videos in database but not in storage)
SELECT 'Checking for orphaned video records:' as test_type;
SELECT 
    id,
    title,
    bucket,
    object_path,
    'Missing from storage' as issue
FROM public.media_assets 
WHERE type = 'video'
AND bucket IN ('pest-videos', 'disease-videos')
AND NOT EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = bucket 
    AND name = object_path
);

-- 7. Clean up orphaned records (optional - uncomment if you want to remove them)
-- DELETE FROM public.media_assets 
-- WHERE type = 'video'
-- AND bucket IN ('pest-videos', 'disease-videos')
-- AND NOT EXISTS (
--     SELECT 1 FROM storage.objects 
--     WHERE bucket_id = bucket 
--     AND name = object_path
-- );

-- 8. Test the trigger by updating a record
SELECT 'Testing the updated_at trigger:' as test_type;
UPDATE public.media_assets 
SET title = title || ' (test)'
WHERE id IN (
    SELECT id FROM public.media_assets 
    WHERE type = 'video' 
    LIMIT 1
);

-- Check if the update worked
SELECT 'Updated record:' as test_type;
SELECT id, title, updated_at 
FROM public.media_assets 
WHERE title LIKE '%(test)%'
ORDER BY updated_at DESC
LIMIT 1;

-- 9. Revert the test change
UPDATE public.media_assets 
SET title = REPLACE(title, ' (test)', '')
WHERE title LIKE '%(test)%';

-- 10. Final verification
SELECT 'Final verification - media_assets table structure:' as test_type;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'media_assets' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Final verification - triggers:' as test_type;
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'media_assets'
AND event_object_schema = 'public';

SELECT 'Setup complete! Video editing should now work properly.' as test_type;
