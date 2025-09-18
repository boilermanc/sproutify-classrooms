-- Fix storage bucket policies for pest-videos and disease-videos
-- This migration ensures that super admins and staff can upload videos to storage buckets

-- Only proceed if we have the necessary permissions to modify storage.objects
DO $$
BEGIN
  -- Check if we can modify storage.objects table
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'objects' AND table_schema = 'storage'
  ) THEN
    -- Enable RLS on storage.objects if not already enabled
    BEGIN
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN insufficient_privilege THEN
      -- Skip if we don't have permission
      NULL;
    END;
    
    -- Drop existing policies for storage.objects if they exist
    DROP POLICY IF EXISTS "Team members can upload videos" ON storage.objects;
    DROP POLICY IF EXISTS "Team members can manage videos" ON storage.objects;
    DROP POLICY IF EXISTS "Team members can delete videos" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
    
    -- Policy 1: Team members can upload videos to pest-videos and disease-videos buckets
    BEGIN
      CREATE POLICY "Team members can upload videos"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id IN ('pest-videos', 'disease-videos')
        AND EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.user_id = auth.uid() 
          AND tm.active = true
          AND tm.role IN ('super_admin', 'staff')
        )
      );
    EXCEPTION WHEN insufficient_privilege THEN
      -- Skip if we don't have permission
      NULL;
    END;
    
    -- Policy 2: Team members can update/delete videos in pest-videos and disease-videos buckets
    BEGIN
      CREATE POLICY "Team members can manage videos"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id IN ('pest-videos', 'disease-videos')
        AND EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.user_id = auth.uid() 
          AND tm.active = true
          AND tm.role IN ('super_admin', 'staff')
        )
      )
      WITH CHECK (
        bucket_id IN ('pest-videos', 'disease-videos')
        AND EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.user_id = auth.uid() 
          AND tm.active = true
          AND tm.role IN ('super_admin', 'staff')
        )
      );
    EXCEPTION WHEN insufficient_privilege THEN
      -- Skip if we don't have permission
      NULL;
    END;
    
    -- Policy 3: Team members can delete videos in pest-videos and disease-videos buckets
    BEGIN
      CREATE POLICY "Team members can delete videos"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id IN ('pest-videos', 'disease-videos')
        AND EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.user_id = auth.uid() 
          AND tm.active = true
          AND tm.role IN ('super_admin', 'staff')
        )
      );
    EXCEPTION WHEN insufficient_privilege THEN
      -- Skip if we don't have permission
      NULL;
    END;
    
    -- Policy 4: Anyone can view videos from pest-videos and disease-videos buckets (for public access)
    BEGIN
      CREATE POLICY "Anyone can view videos"
      ON storage.objects
      FOR SELECT
      TO anon, authenticated
      USING (bucket_id IN ('pest-videos', 'disease-videos'));
    EXCEPTION WHEN insufficient_privilege THEN
      -- Skip if we don't have permission
      NULL;
    END;
  END IF;
END $$;
