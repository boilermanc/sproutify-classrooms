-- Drop the foreign key constraint on tower_id to allow NULL values for seeding records
-- This is necessary because seeding records don't require a tower initially

-- Drop the existing foreign key constraint
ALTER TABLE public.plantings 
DROP CONSTRAINT IF EXISTS plantings_tower_id_fkey;

-- Add a new foreign key constraint that allows NULL values
-- This constraint will only be enforced when tower_id is NOT NULL
ALTER TABLE public.plantings 
ADD CONSTRAINT plantings_tower_id_fkey 
FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE;

-- Add a comment to explain the constraint behavior
COMMENT ON CONSTRAINT plantings_tower_id_fkey ON public.plantings IS 'Foreign key to towers table. NULL values are allowed for seeding-only records before transplant.';
