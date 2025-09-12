-- Fix RLS policies for media_assets to allow super admins and staff to see all videos
-- This migration ensures that team members can see both published and unpublished videos

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Anyone can view published media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Super admins and staff can manage media assets" ON public.media_assets;

-- Create new policies that are more specific and don't conflict

-- Policy 1: Super admins and staff can see ALL media assets (published and unpublished)
CREATE POLICY "Team members can view all media assets"
ON public.media_assets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
);

-- Policy 2: Super admins and staff can manage ALL media assets (insert, update, delete)
CREATE POLICY "Team members can manage all media assets"
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

-- Policy 3: Regular users can only view published media assets
CREATE POLICY "Regular users can view published media assets"
ON public.media_assets
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND NOT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid() 
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
  )
);

-- Policy 4: Anonymous users can view published media assets
CREATE POLICY "Anonymous users can view published media assets"
ON public.media_assets
FOR SELECT
TO anon
USING (is_published = true);
