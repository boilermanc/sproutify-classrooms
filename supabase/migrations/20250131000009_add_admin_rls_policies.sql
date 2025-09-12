-- Add RLS policies to allow team members to view all profiles for admin operations

-- Allow team members (super_admin and staff) to view all profiles
CREATE POLICY "Team members can view all profiles"
ON public.profiles
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

-- Allow team members to update profiles (for admin operations)
CREATE POLICY "Team members can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
);

-- Allow team members to view all districts
CREATE POLICY "Team members can view all districts"
ON public.districts
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

-- Allow team members to view all schools
CREATE POLICY "Team members can view all schools"
ON public.schools
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
