-- Add location column to towers table
-- This migration adds the missing location column that the frontend code expects

ALTER TABLE public.towers 
ADD COLUMN IF NOT EXISTS location text DEFAULT 'indoor';

-- Add comment for documentation
COMMENT ON COLUMN public.towers.location IS 'Growing location: indoor, greenhouse, or outdoor';

-- Create index for better performance on location queries
CREATE INDEX IF NOT EXISTS idx_towers_location ON public.towers(location);
