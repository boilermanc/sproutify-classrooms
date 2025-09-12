-- Fix content sections to have specific pest and disease categories
-- Run this in your Supabase dashboard SQL editor

-- First, let's see what we currently have
SELECT 'Current content sections:' as info;
SELECT id, slug, title, kind, description FROM public.content_section ORDER BY kind, title;

-- Delete the generic sections (we'll recreate them properly)
DELETE FROM public.content_section WHERE slug IN ('pest', 'disease');

-- Insert specific pest sections
INSERT INTO public.content_section (slug, title, kind, description) VALUES
('aphids', 'Aphids', 'pest', 'Common aphid problems and solutions'),
('spider-mites', 'Spider Mites', 'pest', 'Identification and management of spider mites'),
('whiteflies', 'Whiteflies', 'pest', 'Whitefly identification and control methods'),
('thrips', 'Thrips', 'pest', 'Thrip damage and management strategies'),
('mealybugs', 'Mealybugs', 'pest', 'Mealybug identification and treatment'),
('scale-insects', 'Scale Insects', 'pest', 'Scale insect problems and solutions'),
('fungus-gnats', 'Fungus Gnats', 'pest', 'Fungus gnat larvae and adult control'),
('leaf-miners', 'Leaf Miners', 'pest', 'Leaf miner damage and prevention')
ON CONFLICT (slug) DO NOTHING;

-- Insert specific disease sections
INSERT INTO public.content_section (slug, title, kind, description) VALUES
('powdery-mildew', 'Powdery Mildew', 'disease', 'Prevention and treatment of powdery mildew'),
('root-rot', 'Root Rot', 'disease', 'Identifying and managing root rot issues'),
('bacterial-leaf-spot', 'Bacterial Leaf Spot', 'disease', 'Bacterial infections and treatment'),
('fungal-leaf-spot', 'Fungal Leaf Spot', 'disease', 'Fungal leaf spot identification and control'),
('damping-off', 'Damping Off', 'disease', 'Seedling damping off prevention'),
('blight', 'Blight', 'disease', 'Plant blight identification and management'),
('rust', 'Rust', 'disease', 'Plant rust disease control'),
('mosaic-virus', 'Mosaic Virus', 'disease', 'Viral infections and prevention')
ON CONFLICT (slug) DO NOTHING;

-- Show the new structure
SELECT 'Updated content sections:' as info;
SELECT id, slug, title, kind, description FROM public.content_section ORDER BY kind, title;

-- Check if there are any media assets that need to be updated
SELECT 'Media assets that may need updating:' as info;
SELECT ma.id, ma.title, ma.bucket, ma.object_path, cs.slug, cs.title as section_title, cs.kind
FROM public.media_assets ma
JOIN public.content_section cs ON ma.section_id = cs.id
ORDER BY cs.kind, cs.title;
