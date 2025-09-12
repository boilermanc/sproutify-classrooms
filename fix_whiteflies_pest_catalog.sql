-- Fix whiteflies video in pest catalog
-- This script updates the pest_catalog table to include the video URL for whiteflies

-- 1. First, let's see what's currently in the pest_catalog for whiteflies
SELECT 'Current whiteflies entry in pest_catalog:' as test_type;
SELECT id, name, video_url, safe_for_schools
FROM public.pest_catalog 
WHERE name ILIKE '%white%' OR name ILIKE '%whitefly%';

-- 2. Get the video URL from your media_assets table
SELECT 'Video URL from media_assets:' as test_type;
SELECT 
    ma.title,
    ma.bucket,
    ma.object_path,
    cs.slug as section_slug,
    -- Construct the Supabase storage URL
    CONCAT(
        'https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/',
        ma.bucket,
        '/',
        ma.object_path
    ) as video_url
FROM public.media_assets ma
LEFT JOIN public.content_section cs ON ma.section_id = cs.id
WHERE ma.type = 'video'
AND (cs.slug = 'whiteflies' OR ma.title LIKE '%white%')
AND ma.is_published = true;

-- 3. Update the pest_catalog entry for whiteflies with the video URL
UPDATE public.pest_catalog 
SET video_url = 'https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/pest-videos/3993b9d4-6d1f-4529-b93e-ca1c5a3de125/761b072c-df48-4865-a4ae-3efb6e6418fc-Whiteflies__Tiny_Terrors.mp4'
WHERE name ILIKE '%white%' OR name ILIKE '%whitefly%';

-- 4. Verify the update
SELECT 'Updated whiteflies entry:' as test_type;
SELECT id, name, video_url, safe_for_schools
FROM public.pest_catalog 
WHERE name ILIKE '%white%' OR name ILIKE '%whitefly%';

-- 5. Alternative: If you need to create a new whiteflies entry in pest_catalog
-- (Uncomment this section if whiteflies doesn't exist in pest_catalog)
/*
INSERT INTO public.pest_catalog (
    name,
    scientific_name,
    type,
    description,
    appearance_details,
    damage_caused,
    omri_remedies,
    management_strategies,
    prevention_methods,
    video_url,
    safe_for_schools
) VALUES (
    'Whiteflies',
    'Trialeurodes vaporariorum',
    'pest',
    'Small white flying insects that feed on plant sap and can cause significant damage to crops.',
    'Tiny white insects with powdery wings, often found on the underside of leaves.',
    ARRAY['Yellowing leaves', 'Stunted growth', 'Honeydew production', 'Sooty mold'],
    ARRAY['Neem oil', 'Insecticidal soap', 'Beneficial insects', 'Yellow sticky traps'],
    ARRAY['Regular monitoring', 'Early detection', 'Integrated pest management', 'Cultural controls'],
    ARRAY['Proper spacing', 'Good air circulation', 'Regular inspection', 'Quarantine new plants'],
    'https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/pest-videos/3993b9d4-6d1f-4529-b93e-ca1c5a3de125/761b072c-df48-4865-a4ae-3efb6e6418fc-Whiteflies__Tiny_Terrors.mp4',
    true
) ON CONFLICT (name) DO UPDATE SET
    video_url = EXCLUDED.video_url;
*/
