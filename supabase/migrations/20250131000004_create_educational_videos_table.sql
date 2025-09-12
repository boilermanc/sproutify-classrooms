-- Create educational_videos table for video content management
CREATE TABLE IF NOT EXISTS public.educational_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  section text NOT NULL DEFAULT 'general',
  file_path text NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  duration_seconds integer,
  thumbnail_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT educational_videos_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_educational_videos_section ON public.educational_videos(section);
CREATE INDEX IF NOT EXISTS idx_educational_videos_published ON public.educational_videos(is_published);
CREATE INDEX IF NOT EXISTS idx_educational_videos_created_by ON public.educational_videos(created_by);

-- Enable RLS
ALTER TABLE public.educational_videos ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON TABLE public.educational_videos TO anon;
GRANT ALL ON TABLE public.educational_videos TO authenticated;
GRANT ALL ON TABLE public.educational_videos TO service_role;

-- Create RLS policies
-- Super admins and staff can manage all videos
CREATE POLICY "Super admins and staff can manage all videos"
ON public.educational_videos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'staff')
  )
);

-- Teachers can view published videos
CREATE POLICY "Teachers can view published videos"
ON public.educational_videos
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'teacher'
  )
);

-- Students can view published videos
CREATE POLICY "Students can view published videos"
ON public.educational_videos
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'student'
  )
);

-- Create videos storage bucket (this would typically be done in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
