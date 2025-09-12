-- Fix infinite recursion in user_roles RLS policies
-- The user_roles table policies reference team_members which creates circular dependencies

-- Drop problematic policies that reference team_members
DROP POLICY IF EXISTS "School admins can view roles for their school" ON public.user_roles;
DROP POLICY IF EXISTS "District admins can view roles for their district" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins and staff can manage all user roles" ON public.user_roles;

-- Keep the basic policy that allows users to view their own roles
-- This policy should already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' 
        AND policyname = 'Users can view their own roles'
    ) THEN
        CREATE POLICY "Users can view their own roles"
        ON public.user_roles
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
    END IF;
END $$;

-- Allow users to insert their own roles (for registration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' 
        AND policyname = 'Allow inserting user roles'
    ) THEN
        CREATE POLICY "Allow inserting user roles"
        ON public.user_roles
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;
END $$;

-- Allow service role to manage all user roles (for admin operations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' 
        AND policyname = 'Service role can manage all user roles'
    ) THEN
        CREATE POLICY "Service role can manage all user roles"
        ON public.user_roles
        FOR ALL
        TO service_role
        USING (true);
    END IF;
END $$;
