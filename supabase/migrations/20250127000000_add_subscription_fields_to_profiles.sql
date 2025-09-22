-- Ensure the profiles table exists on fresh local resets
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    -- Create profiles table with proper constraints matching the canonical schema
    CREATE TABLE public.profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE,
      full_name text,
      avatar_url text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Add foreign key constraint to auth.users
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Add subscription-related fields to profiles table
ALTER TABLE "public"."profiles" 
ADD COLUMN IF NOT EXISTS "email" text,
ADD COLUMN IF NOT EXISTS "subscription_status" text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS "subscription_plan" text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "max_towers" integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS "max_students" integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS "stripe_customer_id" text,
ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text,
ADD COLUMN IF NOT EXISTS "subscription_ends_at" timestamp with time zone;

-- Add indexes for better performance on subscription lookups
CREATE INDEX IF NOT EXISTS "profiles_stripe_customer_id_idx" ON "public"."profiles" ("stripe_customer_id");
CREATE INDEX IF NOT EXISTS "profiles_subscription_status_idx" ON "public"."profiles" ("subscription_status");
