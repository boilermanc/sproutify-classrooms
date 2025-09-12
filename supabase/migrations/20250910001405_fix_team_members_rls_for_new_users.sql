-- Fix RLS policies for team_members table to handle new users gracefully
-- This migration ensures that queries to team_members don't fail with 406 errors for new users

-- Drop the existing restrictive policy that causes 406 errors
DROP POLICY IF EXISTS "Users can view their own team member record" ON public.team_members;

-- Create a more permissive policy that allows users to query their own team member record
-- This will return null for users who don't have a team member record, instead of throwing an error
CREATE POLICY "Users can view their own team member record"
ON public.team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Also ensure that the service role can still manage all team members
-- (This policy should already exist, but let's make sure)
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

-- Add a policy to allow team members to view all team members (for admin operations)
-- This is needed for admin interfaces that need to list all team members
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'team_members' 
        AND policyname = 'Team members can view all team members'
    ) THEN
        CREATE POLICY "Team members can view all team members"
        ON public.team_members
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.team_members tm
                WHERE tm.user_id = auth.uid() 
                AND tm.active = true
                AND tm.role IN ('super_admin', 'staff')
            )
        );
    END IF;
END $$;
