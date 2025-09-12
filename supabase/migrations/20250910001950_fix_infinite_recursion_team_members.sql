-- Fix infinite recursion in team_members RLS policies
-- The previous migration created circular dependencies that cause infinite recursion

-- Drop all existing policies on team_members to start fresh
DROP POLICY IF EXISTS "Users can view their own team member record" ON public.team_members;
DROP POLICY IF EXISTS "Service role can manage all team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Super admins and staff can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Super admins can manage all team members" ON public.team_members;
DROP POLICY IF EXISTS "Staff can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view their own record" ON public.team_members;

-- Create simple, non-recursive policies
-- Allow users to view their own team member record (if it exists)
CREATE POLICY "Users can view their own team member record"
ON public.team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow service role to manage all team members (for admin operations)
CREATE POLICY "Service role can manage all team members"
ON public.team_members
FOR ALL
TO service_role
USING (true);

-- Allow authenticated users to insert team member records (for admin operations)
CREATE POLICY "Allow inserting team member records"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update team member records (for admin operations)
CREATE POLICY "Allow updating team member records"
ON public.team_members
FOR UPDATE
TO authenticated
USING (true);
