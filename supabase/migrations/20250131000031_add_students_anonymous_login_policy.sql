-- Add RLS policy to allow anonymous access to students table for kiosk login
-- This policy allows anonymous users to read and update student records for login purposes

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow anonymous users to read students for login" ON public.students;
DROP POLICY IF EXISTS "Allow anonymous users to update students for login" ON public.students;

-- Policy 1: Allow anonymous users to read students for login verification
CREATE POLICY "Allow anonymous users to read students for login"
ON public.students
FOR SELECT
TO anon
USING (true);

-- Policy 2: Allow anonymous users to update login tracking fields
CREATE POLICY "Allow anonymous users to update students for login"
ON public.students
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Add comments for debugging
COMMENT ON POLICY "Allow anonymous users to read students for login" ON public.students IS 
'Allows anonymous users to read student records for kiosk login verification';

COMMENT ON POLICY "Allow anonymous users to update students for login" ON public.students IS 
'Allows anonymous users to update login tracking fields (has_logged_in, first_login_at, last_login_at)';
