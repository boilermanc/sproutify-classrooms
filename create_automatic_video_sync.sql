-- Automatic sync system between media_assets and pest_catalog
-- This creates triggers and functions to automatically update pest_catalog when videos are uploaded

-- 1. Create a function to sync video URLs from media_assets to pest_catalog
CREATE OR REPLACE FUNCTION sync_video_to_pest_catalog()
RETURNS TRIGGER AS $$
DECLARE
    video_url text;
    pest_name text;
BEGIN
    -- Only process video uploads
    IF NEW.type = 'video' AND NEW.is_published = true THEN
        -- Get the content section slug to determine the pest name
        SELECT cs.slug INTO pest_name
        FROM public.content_section cs
        WHERE cs.id = NEW.section_id;
        
        -- Construct the video URL
        video_url := CONCAT(
            'https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/',
            NEW.bucket,
            '/',
            NEW.object_path
        );
        
        -- Update the pest_catalog entry if it exists
        -- Try different name variations to match
        UPDATE public.pest_catalog 
        SET video_url = video_url,
            updated_at = now()
        WHERE (
            name ILIKE '%' || pest_name || '%' OR
            name ILIKE '%' || REPLACE(pest_name, '-', ' ') || '%' OR
            name ILIKE '%' || REPLACE(pest_name, '-', '') || '%' OR
            -- Handle specific mappings
            (pest_name = 'whiteflies' AND name ILIKE '%white%') OR
            (pest_name = 'spider-mites' AND name ILIKE '%spider%') OR
            (pest_name = 'aphids' AND name ILIKE '%aphid%')
        );
        
        -- Log the sync attempt
        RAISE NOTICE 'Synced video % to pest_catalog for section %', NEW.title, pest_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a trigger that fires when a video is inserted or updated
DROP TRIGGER IF EXISTS sync_video_to_pest_catalog_trigger ON public.media_assets;

CREATE TRIGGER sync_video_to_pest_catalog_trigger
    AFTER INSERT OR UPDATE ON public.media_assets
    FOR EACH ROW
    EXECUTE FUNCTION sync_video_to_pest_catalog();

-- 3. Create a function to manually sync all existing videos
CREATE OR REPLACE FUNCTION sync_all_videos_to_pest_catalog()
RETURNS TABLE(
    media_asset_id uuid,
    media_asset_title text,
    content_section_slug text,
    pest_catalog_name text,
    video_url text,
    sync_status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ma.id as media_asset_id,
        ma.title as media_asset_title,
        cs.slug as content_section_slug,
        pc.name as pest_catalog_name,
        CONCAT(
            'https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/',
            ma.bucket,
            '/',
            ma.object_path
        ) as video_url,
        CASE 
            WHEN pc.id IS NOT NULL THEN 'SYNCED'
            ELSE 'NO MATCH FOUND'
        END as sync_status
    FROM public.media_assets ma
    LEFT JOIN public.content_section cs ON ma.section_id = cs.id
    LEFT JOIN public.pest_catalog pc ON (
        pc.name ILIKE '%' || cs.slug || '%' OR
        pc.name ILIKE '%' || REPLACE(cs.slug, '-', ' ') || '%' OR
        pc.name ILIKE '%' || REPLACE(cs.slug, '-', '') || '%' OR
        -- Handle specific mappings
        (cs.slug = 'whiteflies' AND pc.name ILIKE '%white%') OR
        (cs.slug = 'spider-mites' AND pc.name ILIKE '%spider%') OR
        (cs.slug = 'aphids' AND pc.name ILIKE '%aphid%')
    )
    WHERE ma.type = 'video' AND ma.is_published = true
    ORDER BY ma.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a function to sync a specific video by ID
CREATE OR REPLACE FUNCTION sync_specific_video_to_pest_catalog(video_id uuid)
RETURNS TABLE(
    success boolean,
    message text,
    video_url text
) AS $$
DECLARE
    video_record record;
    pest_record record;
    video_url text;
BEGIN
    -- Get the video record
    SELECT ma.*, cs.slug as section_slug
    INTO video_record
    FROM public.media_assets ma
    LEFT JOIN public.content_section cs ON ma.section_id = cs.id
    WHERE ma.id = video_id AND ma.type = 'video' AND ma.is_published = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Video not found or not published', null::text;
        RETURN;
    END IF;
    
    -- Construct video URL
    video_url := CONCAT(
        'https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/',
        video_record.bucket,
        '/',
        video_record.object_path
    );
    
    -- Find and update matching pest catalog entry
    UPDATE public.pest_catalog 
    SET video_url = video_url,
        updated_at = now()
    WHERE (
        name ILIKE '%' || video_record.section_slug || '%' OR
        name ILIKE '%' || REPLACE(video_record.section_slug, '-', ' ') || '%' OR
        name ILIKE '%' || REPLACE(video_record.section_slug, '-', '') || '%' OR
        -- Handle specific mappings
        (video_record.section_slug = 'whiteflies' AND name ILIKE '%white%') OR
        (video_record.section_slug = 'spider-mites' AND name ILIKE '%spider%') OR
        (video_record.section_slug = 'aphids' AND name ILIKE '%aphid%')
    );
    
    IF FOUND THEN
        RETURN QUERY SELECT true, 'Video synced successfully', video_url;
    ELSE
        RETURN QUERY SELECT false, 'No matching pest catalog entry found', video_url;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Test the sync system
SELECT 'Testing sync system - Current video mappings:' as test_type;
SELECT * FROM sync_all_videos_to_pest_catalog();

-- 6. Sync your existing whiteflies video
SELECT 'Syncing whiteflies video:' as test_type;
SELECT * FROM sync_specific_video_to_pest_catalog('d6dce031-1159-430f-afc1-33b76f98775e');

-- 7. Verify the sync worked
SELECT 'Verifying sync - Updated pest_catalog entries:' as test_type;
SELECT id, name, video_url, updated_at
FROM public.pest_catalog 
WHERE video_url IS NOT NULL
ORDER BY updated_at DESC;

-- 8. Create a helper function for the frontend to trigger sync
CREATE OR REPLACE FUNCTION trigger_video_sync()
RETURNS text AS $$
BEGIN
    -- This function can be called from the frontend after video upload
    PERFORM sync_video_to_pest_catalog();
    RETURN 'Video sync triggered successfully';
END;
$$ LANGUAGE plpgsql;

SELECT 'Automatic sync system created successfully!' as test_type;
SELECT 'New videos will now automatically sync to pest_catalog when uploaded.' as instruction;
SELECT 'Use sync_all_videos_to_pest_catalog() to see all current mappings.' as instruction;
SELECT 'Use sync_specific_video_to_pest_catalog(video_id) to sync a specific video.' as instruction;
