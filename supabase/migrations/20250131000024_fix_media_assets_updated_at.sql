-- Fix missing updated_at column in media_assets table
-- This migration ensures the updated_at column exists and the trigger works properly

-- Add updated_at column to media_assets if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_assets' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.media_assets ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();
    END IF;
END $$;

-- Ensure the trigger exists for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_media_assets_updated_at ON public.media_assets;

-- Create the trigger to automatically update updated_at
CREATE TRIGGER update_media_assets_updated_at 
    BEFORE UPDATE ON public.media_assets 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
