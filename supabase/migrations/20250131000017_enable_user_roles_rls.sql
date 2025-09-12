-- Enable Row Level Security on user_roles table
-- This fixes the 406 error when querying user_roles table
-- The table already exists and has policies, but RLS was not enabled

DO $$ 
BEGIN
    -- Check if RLS is already enabled to avoid errors
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'user_roles' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;
