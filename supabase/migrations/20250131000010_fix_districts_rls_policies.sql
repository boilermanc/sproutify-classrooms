-- Enable RLS on districts table if not already enabled
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

-- Grant permissions to roles
GRANT ALL ON TABLE public.districts TO anon;
GRANT ALL ON TABLE public.districts TO authenticated;
GRANT ALL ON TABLE public.districts TO service_role;

-- Create RLS policies for districts table

-- Allow authenticated users to create districts (for registration)
DROP POLICY IF EXISTS "Authenticated users can create districts" ON public.districts;
CREATE POLICY "Authenticated users can create districts"
ON public.districts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow district admins to manage their district (only if user_roles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "District admins can manage their district" ON public.districts;
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
  END IF;
END $$;

-- Allow users to view districts they belong to
DROP POLICY IF EXISTS "Users can view their district" ON public.districts;
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
);

-- Allow users to join districts by join code (for registration flow)
DROP POLICY IF EXISTS "Users can view districts by join code" ON public.districts;
CREATE POLICY "Users can view districts by join code"
ON public.districts
FOR SELECT
TO authenticated
USING (true);

-- Also enable RLS on district_join_codes and district_invitations tables (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'district_join_codes' AND table_schema = 'public') THEN
    ALTER TABLE public.district_join_codes ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON TABLE public.district_join_codes TO anon;
    GRANT ALL ON TABLE public.district_join_codes TO authenticated;
    GRANT ALL ON TABLE public.district_join_codes TO service_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'district_invitations' AND table_schema = 'public') THEN
    ALTER TABLE public.district_invitations ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON TABLE public.district_invitations TO anon;
    GRANT ALL ON TABLE public.district_invitations TO authenticated;
    GRANT ALL ON TABLE public.district_invitations TO service_role;
  END IF;
END $$;

-- Policies for district_join_codes (only if user_roles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'district_join_codes' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "District admins can manage join codes" ON public.district_join_codes;
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
  END IF;
END $$;

-- Policies for district_invitations (only if user_roles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'district_invitations' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "District admins can manage invitations" ON public.district_invitations;
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
  END IF;
END $$;
