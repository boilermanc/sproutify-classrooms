-- Create video upload tables and basic setup (without storage policy modifications)
-- Run this script in your Supabase dashboard SQL editor

-- 1. First, let's see what tables actually exist
SELECT 'Existing Tables:' as test_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check if storage buckets exist
SELECT 'Storage Buckets:' as test_type;
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name IN ('pest-videos', 'disease-videos');

-- 3. Create content_section table if it doesn't exist
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

-- 4. Create media_assets table if it doesn't exist
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

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_section_slug ON public.content_section(slug);
CREATE INDEX IF NOT EXISTS idx_content_section_kind ON public.content_section(kind);
CREATE INDEX IF NOT EXISTS idx_media_assets_section_id ON public.media_assets(section_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON public.media_assets(type);
CREATE INDEX IF NOT EXISTS idx_media_assets_published ON public.media_assets(is_published);

-- 6. Enable RLS
ALTER TABLE public.content_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- 7. Grant permissions
GRANT SELECT ON TABLE public.content_section TO anon;
GRANT ALL ON TABLE public.content_section TO authenticated;
GRANT ALL ON TABLE public.content_section TO service_role;
GRANT SELECT ON TABLE public.media_assets TO anon;
GRANT ALL ON TABLE public.media_assets TO authenticated;
GRANT ALL ON TABLE public.media_assets TO service_role;

-- 8. Create simple RLS policies for content_section
DROP POLICY IF EXISTS "Anyone can view content sections" ON public.content_section;
DROP POLICY IF EXISTS "Authenticated users can manage content sections" ON public.content_section;

CREATE POLICY "Anyone can view content sections"
ON public.content_section
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Team members can manage content sections"
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
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.active = true
        AND tm.role IN ('super_admin', 'staff')
    )
);

-- 9. Create simple RLS policies for media_assets
DROP POLICY IF EXISTS "Anyone can view published media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Authenticated users can manage media assets" ON public.media_assets;

CREATE POLICY "Anyone can view published media assets"
ON public.media_assets
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Team members can manage media assets"
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
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.active = true
        AND tm.role IN ('super_admin', 'staff')
    )
);

-- 10. Create storage buckets if they don't exist (this should work)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('pest-videos', 'pest-videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('disease-videos', 'disease-videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- 11. Insert some sample content sections
INSERT INTO public.content_section (slug, title, kind, description)
VALUES 
  ('spider-mites', 'Spider Mites', 'pest', 'Identification and management of spider mites'),
  ('aphids', 'Aphids', 'pest', 'Identification and management of aphids'),
  ('powdery-mildew', 'Powdery Mildew', 'disease', 'Identification and management of powdery mildew'),
  ('root-rot', 'Root Rot', 'disease', 'Identification and management of root rot')
ON CONFLICT (slug) DO NOTHING;

-- 12. Test the setup
SELECT 'Setup Complete! Tables created and policies set.' as test_type;
SELECT 'Content Sections:' as test_type;
SELECT id, slug, title, kind FROM public.content_section ORDER BY kind, title;

-- 13. Note about storage policies
SELECT 'Note: Storage policies may need to be configured in Supabase Dashboard' as test_type;
SELECT 'Go to Storage > Policies in your Supabase dashboard to set up storage access' as instruction;
