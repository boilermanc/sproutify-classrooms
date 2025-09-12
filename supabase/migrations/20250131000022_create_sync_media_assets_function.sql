-- Utility function to sync media_assets table with storage buckets
-- This function can be called to ensure all videos in storage have corresponding database records

CREATE OR REPLACE FUNCTION public.sync_media_assets_with_storage()
RETURNS TABLE(
    action TEXT,
    section_slug TEXT,
    bucket_name TEXT,
    object_path TEXT,
    message TEXT
) AS $$
DECLARE
    section_record RECORD;
    bucket_name TEXT;
    expected_path TEXT;
    existing_record RECORD;
BEGIN
    -- Loop through all content sections
    FOR section_record IN 
        SELECT id, slug, title, kind, description 
        FROM public.content_section 
        ORDER BY kind, title
    LOOP
        -- Determine bucket based on section kind
        bucket_name := CASE 
            WHEN section_record.kind = 'pest' THEN 'pest-videos'
            WHEN section_record.kind = 'disease' THEN 'disease-videos'
            ELSE NULL
        END;
        
        -- Skip if no bucket determined
        IF bucket_name IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Check if a media asset already exists for this section
        SELECT * INTO existing_record
        FROM public.media_assets 
        WHERE section_id = section_record.id 
        AND type = 'video'
        LIMIT 1;
        
        IF existing_record IS NULL THEN
            -- Create expected file path based on naming convention
            expected_path := section_record.slug || '-identification-management.mp4';
            
            -- Insert a record for the expected video
            INSERT INTO public.media_assets (
                section_id,
                type,
                bucket,
                object_path,
                title,
                description,
                file_size,
                file_type,
                is_published,
                created_at
            ) VALUES (
                section_record.id,
                'video',
                bucket_name,
                expected_path,
                section_record.title || ' Identification & Management',
                'Educational video for ' || section_record.title || ' - ' || COALESCE(section_record.description, ''),
                0, -- File size unknown, will be updated when file is accessed
                'video/mp4',
                true,
                now()
            );
            
            -- Return information about the created record
            action := 'CREATED';
            section_slug := section_record.slug;
            bucket_name := bucket_name;
            object_path := expected_path;
            message := 'Created media asset record for ' || section_record.title;
            RETURN NEXT;
        ELSE
            -- Record already exists
            action := 'EXISTS';
            section_slug := section_record.slug;
            bucket_name := bucket_name;
            object_path := existing_record.object_path;
            message := 'Media asset record already exists for ' || section_record.title;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.sync_media_assets_with_storage() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.sync_media_assets_with_storage() IS 'Syncs media_assets table with expected videos based on content sections. Creates database records for videos that exist in storage but lack database entries.';
