-- Fix RLS policies to prevent circular dependencies and 500 errors

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Super admins and staff can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Super admins can manage all team members" ON public.team_members;
DROP POLICY IF EXISTS "Staff can view team members" ON public.team_members;
DROP POLICY IF EXISTS "School admins can view roles for their school" ON public.user_roles;
DROP POLICY IF EXISTS "District admins can view roles for their district" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins and staff can manage all user roles" ON public.user_roles;

-- Create simpler, non-circular policies for team_members
-- Allow users to view their own team member record
-- Note: This policy might already exist, so we use IF NOT EXISTS approach
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'team_members' 
        AND policyname = 'Users can view their own team member record'
    ) THEN
        CREATE POLICY "Users can view their own team member record"
        ON public.team_members
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
    END IF;
END $$;

-- Allow service role to manage all team members (for admin operations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'team_members' 
        AND policyname = 'Service role can manage all team members'
    ) THEN
        CREATE POLICY "Service role can manage all team members"
        ON public.team_members
        FOR ALL
        TO service_role
        USING (true);
    END IF;
END $$;

-- Create simpler policies for user_roles
-- Note: "Users can view their own roles" policy already exists, so we don't recreate it

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

-- Allow inserting user roles (for registration and invitations)
-- Note: This policy might already exist, so we use IF NOT EXISTS approach
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
