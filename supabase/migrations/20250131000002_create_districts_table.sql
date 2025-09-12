-- Create districts table
CREATE TABLE IF NOT EXISTS public.districts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  join_code text NOT NULL,
  logo_url text,
  contact_email text,
  contact_phone text,
  address text,
  website text,
  max_teachers integer NOT NULL DEFAULT 999999,
  subscription_status text NOT NULL DEFAULT 'trial',
  subscription_tier text NOT NULL DEFAULT 'district',
  trial_start_date timestamp with time zone,
  trial_end_date timestamp with time zone,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT districts_pkey PRIMARY KEY (id)
);

-- Create unique index on join_code
CREATE UNIQUE INDEX IF NOT EXISTS districts_join_code_key ON public.districts USING btree (join_code);

-- Add district_id column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS district_id uuid REFERENCES public.districts(id);

-- Add district_id column to schools table if it doesn't exist
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS district_id uuid REFERENCES public.districts(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_district_id ON public.profiles(district_id);
CREATE INDEX IF NOT EXISTS idx_schools_district_id ON public.schools(district_id);

-- Enable RLS on districts table
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

-- Grant permissions
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
