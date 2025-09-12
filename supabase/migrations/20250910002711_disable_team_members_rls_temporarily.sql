-- Temporarily disable RLS on team_members table to fix 406 errors
-- This is a temporary fix to get the system working while we debug the RLS policies

-- Disable RLS on team_members table
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON TABLE public.team_members TO authenticated;
GRANT ALL ON TABLE public.team_members TO anon;
GRANT ALL ON TABLE public.team_members TO service_role;
