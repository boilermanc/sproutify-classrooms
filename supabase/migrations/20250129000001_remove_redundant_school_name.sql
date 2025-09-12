-- Remove redundant school_name field from profiles table
-- The school name should be retrieved via JOIN with schools table using school_id

-- First, let's check if there are any existing records that need to be migrated
-- (This is just for reference - in production you'd want to migrate data first)

-- Remove the school_name column
ALTER TABLE "public"."profiles" 
DROP COLUMN IF EXISTS "school_name";

-- Add comment to clarify the relationship (only if school_id column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'school_id'
        AND table_schema = 'public'
    ) THEN
        COMMENT ON COLUMN "public"."profiles"."school_id" IS 'Foreign key reference to schools.id - use JOIN to get school name';
    END IF;
END $$;
