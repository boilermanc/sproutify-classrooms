-- Test script to debug the video upload RLS issue
-- Run this in Supabase SQL editor to check the current state

-- 1. Check if the user exists in team_members table
SELECT 'Current User Team Member Status:' as test_type;
SELECT 
    tm.id,
    tm.user_id,
    tm.role,
    tm.active,
    tm.created_at,
    p.email
FROM public.team_members tm
LEFT JOIN public.profiles p ON tm.user_id = p.id
WHERE tm.user_id = '3993b9d4-6d1f-4529-b93e-ca1c5a3de125';

-- 2. Check if the user exists in profiles table
SELECT 'Current User Profile Status:' as test_type;
SELECT 
    id,
    email,
    created_at
FROM public.profiles
WHERE id = '3993b9d4-6d1f-4529-b93e-ca1c5a3de125';

-- 3. Test the RLS policy for media_assets insert
SELECT 'Testing RLS Policy for Media Assets:' as test_type;
SELECT 
    'Policy should allow insert for super_admin' as test_result
WHERE EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = '3993b9d4-6d1f-4529-b93e-ca1c5a3de125'
    AND tm.active = true
    AND tm.role IN ('super_admin', 'staff')
);

-- 4. Check storage bucket policies
SELECT 'Storage Bucket Policies:' as test_type;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 5. Check if storage buckets exist
SELECT 'Storage Buckets:' as test_type;
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name IN ('pest-videos', 'disease-videos');
