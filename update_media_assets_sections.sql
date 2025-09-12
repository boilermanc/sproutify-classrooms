-- Update existing media assets to use specific content sections
-- Run this AFTER running fix_content_sections.sql

-- First, let's see what media assets exist and what sections they're linked to
SELECT 'Current media assets and their sections:' as info;
SELECT 
    ma.id,
    ma.title,
    ma.bucket,
    ma.object_path,
    cs.slug as current_section_slug,
    cs.title as current_section_title,
    cs.kind
FROM public.media_assets ma
JOIN public.content_section cs ON ma.section_id = cs.id
ORDER BY cs.kind, cs.title;

-- If you have media assets linked to generic "pest" or "disease" sections,
-- you'll need to manually reassign them to specific sections.
-- Here's an example of how to do that:

-- Example: If you have a spider mites video linked to generic "pest" section
-- UPDATE public.media_assets 
-- SET section_id = (SELECT id FROM public.content_section WHERE slug = 'spider-mites')
-- WHERE title ILIKE '%spider%mite%' 
-- AND section_id = (SELECT id FROM public.content_section WHERE slug = 'pest');

-- Example: If you have an aphids video linked to generic "pest" section  
-- UPDATE public.media_assets 
-- SET section_id = (SELECT id FROM public.content_section WHERE slug = 'aphids')
-- WHERE title ILIKE '%aphid%' 
-- AND section_id = (SELECT id FROM public.content_section WHERE slug = 'pest');

-- Example: If you have a powdery mildew video linked to generic "disease" section
-- UPDATE public.media_assets 
-- SET section_id = (SELECT id FROM public.content_section WHERE slug = 'powdery-mildew')
-- WHERE title ILIKE '%powdery%mildew%' 
-- AND section_id = (SELECT id FROM public.content_section WHERE slug = 'disease');

-- After running updates, verify the changes:
SELECT 'Updated media assets:' as info;
SELECT 
    ma.id,
    ma.title,
    ma.bucket,
    ma.object_path,
    cs.slug as section_slug,
    cs.title as section_title,
    cs.kind
FROM public.media_assets ma
JOIN public.content_section cs ON ma.section_id = cs.id
ORDER BY cs.kind, cs.title;
