-- Create missing educational content tables
-- This migration adds the tables that are referenced in the code but missing from the database

-- Create pest_catalog table for pest identification data
CREATE TABLE IF NOT EXISTS public.pest_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scientific_name text,
  type text NOT NULL CHECK (type IN ('pest', 'disease', 'nutrient', 'environmental')),
  description text NOT NULL,
  appearance_details text,
  damage_caused text[],
  omri_remedies text[],
  management_strategies text[],
  prevention_methods text[],
  video_url text,
  safe_for_schools boolean NOT NULL DEFAULT true,
  severity_levels jsonb,
  treatment_options jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pest_catalog_pkey PRIMARY KEY (id)
);

-- Create indexes for pest_catalog
CREATE INDEX IF NOT EXISTS idx_pest_catalog_name ON public.pest_catalog(name);
CREATE INDEX IF NOT EXISTS idx_pest_catalog_type ON public.pest_catalog(type);
CREATE INDEX IF NOT EXISTS idx_pest_catalog_safe_for_schools ON public.pest_catalog(safe_for_schools);

-- Enable RLS for pest_catalog
ALTER TABLE public.pest_catalog ENABLE ROW LEVEL SECURITY;

-- Grant permissions for pest_catalog
GRANT ALL ON TABLE public.pest_catalog TO anon;
GRANT ALL ON TABLE public.pest_catalog TO authenticated;
GRANT ALL ON TABLE public.pest_catalog TO service_role;

-- Create RLS policies for pest_catalog
-- Everyone can view pest catalog entries
CREATE POLICY "Anyone can view pest catalog"
ON public.pest_catalog
FOR SELECT
TO anon, authenticated
USING (true);

-- Super admins and staff can manage pest catalog
CREATE POLICY "Super admins and staff can manage pest catalog"
ON public.pest_catalog
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin')
  )
);

-- Note: content_section and media_assets tables are already created in migration 20250131000006

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

-- Create indexes for better performance (content_section and media_assets indexes already created in migration 20250131000006)
CREATE INDEX IF NOT EXISTS idx_educational_videos_section ON public.educational_videos(section);
CREATE INDEX IF NOT EXISTS idx_educational_videos_published ON public.educational_videos(is_published);
CREATE INDEX IF NOT EXISTS idx_educational_videos_created_by ON public.educational_videos(created_by);

-- Enable RLS (content_section and media_assets RLS already enabled in migration 20250131000006)
ALTER TABLE public.educational_videos ENABLE ROW LEVEL SECURITY;

-- Grant permissions (content_section and media_assets permissions already granted in migration 20250131000006)
GRANT ALL ON TABLE public.educational_videos TO anon;
GRANT ALL ON TABLE public.educational_videos TO authenticated;
GRANT ALL ON TABLE public.educational_videos TO service_role;

-- RLS policies for content_section and media_assets already created in migration 20250131000006

-- Create RLS policies for educational_videos
-- Super admins and staff can manage all videos
CREATE POLICY "Super admins and staff can manage all videos"
ON public.educational_videos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin')
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

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_pest_catalog_updated_at 
    BEFORE UPDATE ON public.pest_catalog 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_educational_videos_updated_at 
    BEFORE UPDATE ON public.educational_videos 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for content_section and media_assets already created in migration 20250131000006

-- Sample content sections already inserted in migration 20250131000006

-- Insert some sample pest catalog entries
INSERT INTO public.pest_catalog (name, scientific_name, type, description, appearance_details, damage_caused, omri_remedies, management_strategies, prevention_methods, safe_for_schools) VALUES
('Spider Mites', 'Tetranychus urticae', 'pest', 'Tiny arachnids that feed on plant sap, causing yellowing and stippling of leaves.', 'Very small (0.5mm), red or green, found on undersides of leaves. Look for fine webbing.', ARRAY['Yellow stippling on leaves', 'Fine webbing on plant surfaces', 'Leaf drop in severe cases'], ARRAY['Neem oil', 'Insecticidal soap', 'Predatory mites'], ARRAY['Increase humidity', 'Remove affected leaves', 'Apply treatments weekly'], ARRAY['Maintain proper humidity', 'Regular plant inspection', 'Avoid over-fertilization'], true),
('Aphids', 'Aphidoidea', 'pest', 'Small, soft-bodied insects that cluster on new growth and feed on plant sap.', 'Small (1-3mm), green, black, or brown insects clustered on stems and leaves.', ARRAY['Curled leaves', 'Stunted growth', 'Honeydew secretion'], ARRAY['Ladybugs', 'Neem oil', 'Insecticidal soap'], ARRAY['Remove by hand', 'Apply treatments', 'Introduce beneficial insects'], ARRAY['Regular inspection', 'Avoid over-fertilization', 'Maintain plant health'], true),
('Powdery Mildew', 'Erysiphales', 'disease', 'Fungal disease that appears as white, powdery coating on leaves and stems.', 'White or gray powdery coating on leaves, stems, and flowers.', ARRAY['White powdery coating', 'Leaf distortion', 'Reduced photosynthesis'], ARRAY['Baking soda spray', 'Milk solution', 'Sulfur fungicide'], ARRAY['Improve air circulation', 'Remove affected parts', 'Apply fungicides'], ARRAY['Proper spacing', 'Good air circulation', 'Avoid overhead watering'], true),
('Root Rot', 'Various fungi', 'disease', 'Fungal disease that attacks plant roots, causing wilting and plant death.', 'Dark, mushy roots with foul odor. Plants wilt despite adequate moisture.', ARRAY['Wilting leaves', 'Yellowing foliage', 'Plant collapse'], ARRAY['Hydrogen peroxide', 'Cinnamon powder', 'Beneficial fungi'], ARRAY['Improve drainage', 'Remove affected plants', 'Treat soil'], ARRAY['Proper drainage', 'Avoid overwatering', 'Use sterile soil'], true)
ON CONFLICT (name) DO NOTHING;
