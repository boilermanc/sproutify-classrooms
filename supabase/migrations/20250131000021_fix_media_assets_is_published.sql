-- Fix missing is_published column in media_assets table
-- This migration ensures the is_published column exists

-- Add is_published column to media_assets if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_assets' 
        AND column_name = 'is_published'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.media_assets ADD COLUMN is_published boolean NOT NULL DEFAULT true;
    END IF;
END $$;

-- Create index for is_published column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_media_assets_published ON public.media_assets(is_published);

-- Update RLS policy to use is_published column
DROP POLICY IF EXISTS "Anyone can view published media assets" ON public.media_assets;
CREATE POLICY "Anyone can view published media assets"
ON public.media_assets
FOR SELECT
TO anon, authenticated
USING (is_published = true);
