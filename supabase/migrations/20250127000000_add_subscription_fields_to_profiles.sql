-- Ensure the profiles table exists on fresh local resets
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    -- Minimal shape so downstream FKs/policies have a target.
    -- (We add constraints/extra columns later in other migrations.)
    CREATE TABLE public.profiles (
      id uuid PRIMARY KEY,
      email text,
      full_name text,
      avatar_url text,
      created_at timestamptz DEFAULT now()
    );
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
