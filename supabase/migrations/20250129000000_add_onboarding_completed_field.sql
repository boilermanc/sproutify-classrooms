-- Add onboarding_completed field to profiles table
ALTER TABLE "public"."profiles" 
ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false;

-- Add index for better performance on onboarding lookups
CREATE INDEX IF NOT EXISTS "profiles_onboarding_completed_idx" ON "public"."profiles" ("onboarding_completed");
