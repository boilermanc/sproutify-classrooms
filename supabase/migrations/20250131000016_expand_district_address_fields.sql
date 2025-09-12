-- Expand district address fields to include separate components
-- This migration adds individual address fields while preserving existing data

-- Add new address component columns
ALTER TABLE public.districts 
ADD COLUMN IF NOT EXISTS street_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'United States';

-- Migrate existing address data to street_address if it exists
-- This is a best-effort migration - existing addresses will be preserved in street_address
UPDATE public.districts 
SET street_address = address 
WHERE address IS NOT NULL AND address != '';

-- Add comments for documentation
COMMENT ON COLUMN public.districts.street_address IS 'Street address including street number and name';
COMMENT ON COLUMN public.districts.city IS 'City name';
COMMENT ON COLUMN public.districts.state IS 'State or province';
COMMENT ON COLUMN public.districts.postal_code IS 'ZIP/postal code';
COMMENT ON COLUMN public.districts.country IS 'Country name (defaults to United States)';

-- Keep the original address field for backward compatibility
-- It can be removed in a future migration if not needed
COMMENT ON COLUMN public.districts.address IS 'Legacy single-line address field - consider using individual address components instead';
