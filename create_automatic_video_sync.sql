-- Automatic sync system between media_assets and pest_catalog
-- This creates triggers and functions to automatically update pest_catalog when videos are uploaded

-- 0. Create pest_name_mappings table for precise matching
CREATE TABLE IF NOT EXISTS public.pest_name_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL,
    pest_catalog_names text[] NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert initial mappings
INSERT INTO public.pest_name_mappings (slug, pest_catalog_names) VALUES
    ('whiteflies', ARRAY['Whiteflies', 'Whitefly']),
    ('spider-mites', ARRAY['Spider Mites', 'Spider Mite', 'Two-spotted Spider Mite']),
    ('aphids', ARRAY['Aphids', 'Aphid', 'Green Aphid', 'Black Aphid'])
ON CONFLICT (slug) DO NOTHING;

-- 1. Create a function to sync video URLs from media_assets to pest_catalog
CREATE OR REPLACE FUNCTION sync_video_to_pest_catalog()
RETURNS TRIGGER AS $$
DECLARE
    video_url text;
    pest_name text;
    rows_updated integer;
BEGIN
    -- Only process video uploads
    IF NEW.type = 'video' AND NEW.is_published = true THEN
        -- Validate required fields
        IF NEW.section_id IS NULL OR NEW.bucket IS NULL OR NEW.object_path IS NULL OR NEW.object_path = '' THEN
            RAISE WARNING 'Video sync skipped: missing required fields (section_id, bucket, or object_path)';
            RETURN NEW;
        END IF;
        
        -- Get the content section slug to determine the pest name
        BEGIN
            SELECT cs.slug INTO pest_name
            FROM public.content_section cs
            WHERE cs.id = NEW.section_id;
            
            IF NOT FOUND THEN
                RAISE WARNING 'Video sync skipped: content section not found for section_id %', NEW.section_id;
                RETURN NEW;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Video sync failed: error retrieving content section - %', SQLERRM;
                RETURN NEW;
        END;
        
        -- Construct the video URL using configurable base URL
        DECLARE
            storage_base_url text;
        BEGIN
            -- Try to get storage base URL from configuration
            BEGIN
                SELECT current_setting('app.storage_base_url', true) INTO storage_base_url;
                IF storage_base_url IS NULL OR storage_base_url = '' THEN
                    -- Fallback to environment-specific URL construction
                    storage_base_url := CONCAT(
                        COALESCE(current_setting('app.supabase_url', true), 'https://your-project-ref.supabase.co'),
                        '/storage/v1/object/public'
                    );
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE WARNING 'Could not read storage_base_url config, using fallback';
                    storage_base_url := 'https://your-project-ref.supabase.co/storage/v1/object/public';
            END;
            
            video_url := CONCAT(storage_base_url, '/', NEW.bucket, '/', NEW.object_path);
        END;
        
        -- Update the pest_catalog entry using precise mapping
        BEGIN
            UPDATE public.pest_catalog 
            SET video_url = video_url,
                updated_at = now()
            WHERE EXISTS (
                SELECT 1 FROM public.pest_name_mappings pnm
                WHERE pnm.slug = pest_name
                AND pest_catalog.name = ANY(pnm.pest_catalog_names)
            );
            
            GET DIAGNOSTICS rows_updated = ROW_COUNT;
            
            IF rows_updated = 0 THEN
                RAISE NOTICE 'Video sync completed but no pest catalog entries were updated for section %', pest_name;
            ELSE
                RAISE NOTICE 'Video sync successful: updated % pest catalog entries for section %', rows_updated, pest_name;
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Video sync failed during pest catalog update - %', SQLERRM;
                RETURN NEW;
        END;
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

-- 5. Create a helper function for the frontend to trigger sync
CREATE OR REPLACE FUNCTION trigger_video_sync()
RETURNS text AS $$
BEGIN
    -- This function can be called from the frontend after video upload
    PERFORM sync_video_to_pest_catalog();
    RETURN 'Video sync triggered successfully';
END;
$$ LANGUAGE plpgsql;
