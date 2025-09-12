-- Fix classrooms table RLS policy for kiosk login access
-- This migration ensures that anonymous users can access classrooms for kiosk login

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Allow anonymous users to read classrooms for login" ON public.classrooms;

-- Recreate the policy to ensure it works correctly
CREATE POLICY "Allow anonymous users to read classrooms for login"
ON public.classrooms
FOR SELECT
TO anon, authenticated
USING (true);

-- Add a comment for debugging
COMMENT ON POLICY "Allow anonymous users to read classrooms for login" ON public.classrooms IS 
'Allows anonymous users to read classrooms for kiosk login functionality';

-- Ensure the policy is properly applied
-- This should not be necessary but helps ensure the policy is active
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
