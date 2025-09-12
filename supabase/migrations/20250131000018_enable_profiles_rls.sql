-- Enable Row Level Security on profiles table
-- This fixes the 406 error when querying profiles with joins to schools/districts
-- The table already has policies defined, but RLS was not enabled

DO $$ 
BEGIN
    -- Check if RLS is already enabled to avoid errors
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'profiles' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;
