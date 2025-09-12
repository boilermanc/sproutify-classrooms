-- Update existing profiles to have correct plan format
-- This will fix profiles that have "basic" instead of "basic_monthly"

UPDATE "public"."profiles" 
SET 
  subscription_plan = CASE 
    WHEN subscription_plan = 'basic' THEN 'basic_monthly'
    ELSE subscription_plan
  END
WHERE subscription_plan = 'basic';
