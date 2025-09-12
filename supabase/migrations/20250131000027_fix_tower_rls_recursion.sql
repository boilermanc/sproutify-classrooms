-- Fix infinite recursion in tower RLS policies
-- The issue is caused by overlapping policies that conflict with each other
-- This migration removes redundant policies and keeps only the necessary ones

-- First, disable RLS temporarily to avoid recursion during policy cleanup
ALTER TABLE public.towers DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing tower policies to eliminate conflicts
-- Using CASCADE to ensure all dependent policies are also dropped
DROP POLICY IF EXISTS "Allow anonymous read access to towers" ON public.towers CASCADE;
DROP POLICY IF EXISTS "Teachers manage their towers" ON public.towers CASCADE;
DROP POLICY IF EXISTS "Users can delete their own towers" ON public.towers CASCADE;
DROP POLICY IF EXISTS "Users can insert their own towers" ON public.towers CASCADE;
DROP POLICY IF EXISTS "Users can update their own towers" ON public.towers CASCADE;
DROP POLICY IF EXISTS "Users can view their own towers" ON public.towers CASCADE;

-- Re-enable RLS
ALTER TABLE public.towers ENABLE ROW LEVEL SECURITY;

-- Create clean, non-overlapping policies for towers

-- Policy 1: Anonymous users can view towers (for public access)
CREATE POLICY "Anonymous users can view towers"
ON public.towers
FOR SELECT
TO anon
USING (true);

-- Policy 2: Authenticated users can view towers
CREATE POLICY "Authenticated users can view towers"
ON public.towers
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Teachers can insert their own towers
CREATE POLICY "Teachers can insert towers"
ON public.towers
FOR INSERT
TO authenticated
WITH CHECK (teacher_id = auth.uid());

-- Policy 4: Teachers can update their own towers
CREATE POLICY "Teachers can update towers"
ON public.towers
FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Policy 5: Teachers can delete their own towers
CREATE POLICY "Teachers can delete towers"
ON public.towers
FOR DELETE
TO authenticated
USING (teacher_id = auth.uid());

-- Add comments for debugging
COMMENT ON POLICY "Teachers can insert towers" ON public.towers IS 
'Allows teachers to create towers with themselves as the teacher_id';

COMMENT ON POLICY "Teachers can update towers" ON public.towers IS 
'Allows teachers to update towers they own';

COMMENT ON POLICY "Teachers can delete towers" ON public.towers IS 
'Allows teachers to delete towers they own';
