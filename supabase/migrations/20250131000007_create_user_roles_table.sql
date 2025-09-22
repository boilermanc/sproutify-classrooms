-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('teacher', 'student', 'school_admin', 'district_admin', 'super_admin', 'staff')),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  district_id uuid REFERENCES public.districts(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_school_id ON public.user_roles(school_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_district_id ON public.user_roles(district_id);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Grant permissions (restrictive for anon)
GRANT SELECT ON TABLE public.user_roles TO anon;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;

-- Create RLS policies
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- School admins can view roles for their school
CREATE POLICY "School admins can view roles for their school"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  school_id IN (
    SELECT school_id FROM public.profiles 
    WHERE id = auth.uid() 
    AND school_id IS NOT NULL
  )
  OR
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
);

-- District admins can view roles for their district
CREATE POLICY "District admins can view roles for their district"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  district_id IN (
    SELECT district_id FROM public.profiles 
    WHERE id = auth.uid() 
    AND district_id IS NOT NULL
  )
  OR
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
);

-- Super admins and staff can manage all user roles
CREATE POLICY "Super admins and staff can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
);

-- Allow inserting user roles (for registration and invitations)
CREATE POLICY "Allow inserting user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (true);
