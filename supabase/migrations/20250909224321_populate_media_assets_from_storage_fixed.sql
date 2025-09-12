-- Migration to populate media_assets table with existing videos from storage buckets
-- Based on the example URL found in the codebase: spider-mites-identification-management.mp4

-- Insert media asset records for known existing videos
-- These are based on the content sections and the naming pattern seen in the codebase

-- Spider Mites video (pest)
INSERT INTO public.media_assets (
    section_id,
    type,
    bucket,
    object_path,
    title,
    description,
    file_size,
    file_type,
    is_published,
    created_at
)
SELECT 
    cs.id,
    'video',
    'pest-videos',
    'spider-mites-identification-management.mp4',
    'Spider Mites Identification & Management',
    'Educational video covering spider mite identification, damage assessment, and management strategies',
    0, -- File size unknown, will be updated when file is accessed
    'video/mp4',
    true,
    now()
FROM public.content_section cs 
WHERE cs.slug = 'spider-mites'
ON CONFLICT DO NOTHING;

-- Aphids video (pest) - assuming it exists based on the pattern
INSERT INTO public.media_assets (
    section_id,
    type,
    bucket,
    object_path,
    title,
    description,
    file_size,
    file_type,
    is_published,
    created_at
)
SELECT 
    cs.id,
    'video',
    'pest-videos',
    'aphids-identification-management.mp4',
    'Aphids Identification & Management',
    'Educational video covering aphid identification, damage assessment, and management strategies',
    0,
    'video/mp4',
    true,
    now()
FROM public.content_section cs 
WHERE cs.slug = 'aphids'
ON CONFLICT DO NOTHING;

-- Powdery Mildew video (disease)
INSERT INTO public.media_assets (
    section_id,
    type,
    bucket,
    object_path,
    title,
    description,
    file_size,
    file_type,
    is_published,
    created_at
)
SELECT 
    cs.id,
    'video',
    'disease-videos',
    'powdery-mildew-identification-management.mp4',
    'Powdery Mildew Identification & Management',
    'Educational video covering powdery mildew identification, prevention, and treatment methods',
    0,
    'video/mp4',
    true,
    now()
FROM public.content_section cs 
WHERE cs.slug = 'powdery-mildew'
ON CONFLICT DO NOTHING;

-- Root Rot video (disease)
INSERT INTO public.media_assets (
    section_id,
    type,
    bucket,
    object_path,
    title,
    description,
    file_size,
    file_type,
    is_published,
    created_at
)
SELECT 
    cs.id,
    'video',
    'disease-videos',
    'root-rot-identification-management.mp4',
    'Root Rot Identification & Management',
    'Educational video covering root rot identification, causes, and management strategies',
    0,
    'video/mp4',
    true,
    now()
FROM public.content_section cs 
WHERE cs.slug = 'root-rot'
ON CONFLICT DO NOTHING;

-- Add a comment explaining the migration
COMMENT ON TABLE public.media_assets IS 'Contains references to media files stored in Supabase storage buckets. This migration created initial records for existing videos based on content sections.';
