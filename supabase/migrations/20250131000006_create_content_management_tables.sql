-- Create content_section table for organizing educational content
CREATE TABLE IF NOT EXISTS public.content_section (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('pest', 'disease')),
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT content_section_pkey PRIMARY KEY (id)
);

-- Create media_assets table for storing video and other media references
CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.content_section(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('video', 'image', 'document')),
  bucket text NOT NULL,
  object_path text NOT NULL,
  title text NOT NULL,
  description text,
  file_size bigint,
  file_type text,
  duration_seconds integer,
  thumbnail_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT media_assets_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_section_slug ON public.content_section(slug);
CREATE INDEX IF NOT EXISTS idx_content_section_kind ON public.content_section(kind);
CREATE INDEX IF NOT EXISTS idx_media_assets_section_id ON public.media_assets(section_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON public.media_assets(type);
CREATE INDEX IF NOT EXISTS idx_media_assets_published ON public.media_assets(is_published);

-- Enable RLS
ALTER TABLE public.content_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON TABLE public.content_section TO anon;
GRANT ALL ON TABLE public.content_section TO authenticated;
GRANT ALL ON TABLE public.content_section TO service_role;
GRANT ALL ON TABLE public.media_assets TO anon;
GRANT ALL ON TABLE public.media_assets TO authenticated;
GRANT ALL ON TABLE public.media_assets TO service_role;

-- Create RLS policies for content_section
-- Everyone can view published content sections
CREATE POLICY "Anyone can view content sections"
ON public.content_section
FOR SELECT
TO anon, authenticated
USING (true);

-- Super admins and staff can manage content sections
CREATE POLICY "Super admins and staff can manage content sections"
ON public.content_section
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

-- Create RLS policies for media_assets
-- Everyone can view published media assets
CREATE POLICY "Anyone can view published media assets"
ON public.media_assets
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Super admins and staff can manage all media assets
CREATE POLICY "Super admins and staff can manage media assets"
ON public.media_assets
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_content_section_updated_at 
    BEFORE UPDATE ON public.content_section 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at 
    BEFORE UPDATE ON public.media_assets 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample content sections
INSERT INTO public.content_section (slug, title, kind, description) VALUES
('spider-mites', 'Spider Mites', 'pest', 'Identification and management of spider mites'),
('aphids', 'Aphids', 'pest', 'Common aphid problems and solutions'),
('powdery-mildew', 'Powdery Mildew', 'disease', 'Prevention and treatment of powdery mildew'),
('root-rot', 'Root Rot', 'disease', 'Identifying and managing root rot issues')
ON CONFLICT (slug) DO NOTHING;
