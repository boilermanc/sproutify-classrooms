-- Create team_members table for managing Sproutify team
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'staff')),
  active boolean NOT NULL DEFAULT true,
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_user_id_unique UNIQUE (user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON public.team_members(active);
CREATE INDEX IF NOT EXISTS idx_team_members_invited_at ON public.team_members(invited_at);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON TABLE public.team_members TO anon;
GRANT ALL ON TABLE public.team_members TO authenticated;
GRANT ALL ON TABLE public.team_members TO service_role;

-- Create RLS policies
-- Super admins and staff can view all team members
CREATE POLICY "Super admins and staff can view all team members"
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

-- Super admins can manage all team members
CREATE POLICY "Super admins can manage all team members"
ON public.team_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role = 'super_admin'
  )
);

-- Staff can view team members but not modify them
CREATE POLICY "Staff can view team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role = 'staff'
  )
);

-- Allow team members to view their own record
CREATE POLICY "Team members can view their own record"
ON public.team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_team_members_updated_at 
    BEFORE UPDATE ON public.team_members 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
