-- Run this SQL in your Supabase dashboard SQL editor to populate media_assets table
-- This will create database records for existing videos in storage buckets

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
    NULL, -- File size unknown, will be updated when file is accessed
    'video/mp4',
    true,
    now()
FROM public.content_section cs 
WHERE cs.slug = 'spider-mites'
ON CONFLICT DO NOTHING;

-- Aphids video (pest)
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
    NULL,
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
    NULL,
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
    NULL,
    'video/mp4',
    true,
    now()
FROM public.content_section cs 
WHERE cs.slug = 'root-rot'
ON CONFLICT DO NOTHING;

-- Check if records were created
SELECT 
    ma.id,
    ma.title,
    ma.bucket,
    ma.object_path,
    cs.slug,
    cs.kind
FROM public.media_assets ma
JOIN public.content_section cs ON ma.section_id = cs.id
WHERE ma.type = 'video'
ORDER BY ma.created_at DESC;
