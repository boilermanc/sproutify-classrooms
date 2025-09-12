-- Enable RLS on districts table if not already enabled
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

-- Grant permissions to roles
GRANT ALL ON TABLE public.districts TO anon;
GRANT ALL ON TABLE public.districts TO authenticated;
GRANT ALL ON TABLE public.districts TO service_role;

-- Create RLS policies for districts table

-- Allow authenticated users to create districts (for registration)
CREATE POLICY "Authenticated users can create districts"
ON public.districts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow district admins to manage their district
CREATE POLICY "District admins can manage their district"
ON public.districts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'district_admin'
    AND ur.district_id = districts.id
  )
);

-- Allow users to view districts they belong to
CREATE POLICY "Users can view their district"
ON public.districts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.district_id = districts.id
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'district_admin'
    AND ur.district_id = districts.id
  )
);

-- Allow users to join districts by join code (for registration flow)
CREATE POLICY "Users can view districts by join code"
ON public.districts
FOR SELECT
TO authenticated
USING (true);

-- Also enable RLS on district_join_codes and district_invitations tables
ALTER TABLE public.district_join_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_invitations ENABLE ROW LEVEL SECURITY;

-- Grant permissions for district_join_codes
GRANT ALL ON TABLE public.district_join_codes TO anon;
GRANT ALL ON TABLE public.district_join_codes TO authenticated;
GRANT ALL ON TABLE public.district_join_codes TO service_role;

-- Grant permissions for district_invitations
GRANT ALL ON TABLE public.district_invitations TO anon;
GRANT ALL ON TABLE public.district_invitations TO authenticated;
GRANT ALL ON TABLE public.district_invitations TO service_role;

-- Policies for district_join_codes
CREATE POLICY "District admins can manage join codes"
ON public.district_join_codes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'district_admin'
    AND ur.district_id = district_join_codes.district_id
  )
);

-- Policies for district_invitations
CREATE POLICY "District admins can manage invitations"
ON public.district_invitations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'district_admin'
    AND ur.district_id = district_invitations.district_id
  )
);
