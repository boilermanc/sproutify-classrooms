-- Profiles: add school image url and allow insert by owner
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_image_url text;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Storage buckets for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('school-logos', 'school-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tower-photos', 'tower-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
-- Avatars: public read, owner write in their folder
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users manage own avatars" ON storage.objects;
CREATE POLICY "Users manage own avatars"
ON storage.objects FOR ALL
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- School logos: public read, owner write in their folder
DROP POLICY IF EXISTS "Public read school logos" ON storage.objects;
CREATE POLICY "Public read school logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-logos');

DROP POLICY IF EXISTS "Users manage own school logos" ON storage.objects;
CREATE POLICY "Users manage own school logos"
ON storage.objects FOR ALL
USING (bucket_id = 'school-logos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'school-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Tower photos: public read, owner write under teacher_id/tower_id/*
DROP POLICY IF EXISTS "Public read tower photos" ON storage.objects;
CREATE POLICY "Public read tower photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tower-photos');

DROP POLICY IF EXISTS "Users manage own tower photos" ON storage.objects;
CREATE POLICY "Users manage own tower photos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'tower-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'tower-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Tower photos metadata table
CREATE TABLE IF NOT EXISTS public.tower_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  tower_id uuid NOT NULL REFERENCES public.towers(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  caption text,
  student_name text,
  taken_at date NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tower_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers manage their tower photos" ON public.tower_photos;
CREATE POLICY "Teachers manage their tower photos"
ON public.tower_photos
FOR ALL
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_tower_photos_teacher_id ON public.tower_photos(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tower_photos_tower_id ON public.tower_photos(tower_id);
