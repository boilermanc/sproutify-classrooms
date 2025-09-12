-- Fix missing columns in content_section and media_assets tables
-- This migration ensures that all required columns exist

-- Add description column to content_section if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_section' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.content_section ADD COLUMN description text;
    END IF;
END $$;

-- Add file_size column to media_assets if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_assets' 
        AND column_name = 'file_size'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.media_assets ADD COLUMN file_size bigint;
    END IF;
END $$;

-- Ensure all other required columns exist in media_assets
DO $$ 
BEGIN
    -- Add file_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_assets' 
        AND column_name = 'file_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.media_assets ADD COLUMN file_type text;
    END IF;
    
    -- Add duration_seconds column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_assets' 
        AND column_name = 'duration_seconds'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.media_assets ADD COLUMN duration_seconds integer;
    END IF;
    
    -- Add thumbnail_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_assets' 
        AND column_name = 'thumbnail_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.media_assets ADD COLUMN thumbnail_url text;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_assets' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.media_assets ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();
    END IF;
END $$;

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure triggers exist for both tables
DO $$ 
BEGIN
    -- Create trigger for content_section if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_content_section_updated_at'
        AND event_object_table = 'content_section'
    ) THEN
        CREATE TRIGGER update_content_section_updated_at 
            BEFORE UPDATE ON public.content_section 
            FOR EACH ROW 
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Create trigger for media_assets if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_media_assets_updated_at'
        AND event_object_table = 'media_assets'
    ) THEN
        CREATE TRIGGER update_media_assets_updated_at 
            BEFORE UPDATE ON public.media_assets 
            FOR EACH ROW 
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
