-- Comprehensive fix for tower RLS infinite recursion
-- This migration completely resets the tower policies to eliminate recursion

-- Step 1: Completely disable RLS on towers table
ALTER TABLE public.towers DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on towers table (if any exist)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'towers' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.towers CASCADE', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE public.towers ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-conflicting policies

-- Policy 1: Anyone can view towers (for public access)
CREATE POLICY "towers_select_policy"
ON public.towers
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 2: Teachers can insert towers
CREATE POLICY "towers_insert_policy"
ON public.towers
FOR INSERT
TO authenticated
WITH CHECK (teacher_id = auth.uid());

-- Policy 3: Teachers can update their own towers
CREATE POLICY "towers_update_policy"
ON public.towers
FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Policy 4: Teachers can delete their own towers
CREATE POLICY "towers_delete_policy"
ON public.towers
FOR DELETE
TO authenticated
USING (teacher_id = auth.uid());

-- Add comments for debugging
COMMENT ON POLICY "towers_select_policy" ON public.towers IS 
'Allows anyone to view towers';

COMMENT ON POLICY "towers_insert_policy" ON public.towers IS 
'Allows teachers to create towers with themselves as the teacher_id';

COMMENT ON POLICY "towers_update_policy" ON public.towers IS 
'Allows teachers to update towers they own';

COMMENT ON POLICY "towers_delete_policy" ON public.towers IS 
'Allows teachers to delete towers they own';
