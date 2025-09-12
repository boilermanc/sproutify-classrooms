-- Fix infinite recursion in profiles RLS policies
-- The profiles table policies reference team_members which creates circular dependencies

-- Drop problematic policies that reference team_members
DROP POLICY IF EXISTS "Team members can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Team members can update profiles" ON public.profiles;

-- Keep the basic policy that allows users to view their own profile
-- This policy should already exist from the remote schema migration
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile"
        ON public.profiles
        FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
    END IF;
END $$;

-- Allow users to update their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile"
        ON public.profiles
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Allow users to insert their own profile (for registration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
        ON public.profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Allow service role to manage all profiles (for admin operations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Service role can manage all profiles'
    ) THEN
        CREATE POLICY "Service role can manage all profiles"
        ON public.profiles
        FOR ALL
        TO service_role
        USING (true);
    END IF;
END $$;
