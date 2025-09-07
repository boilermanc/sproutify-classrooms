-- Update existing profiles to have correct plan format
-- This will fix profiles that have "basic" instead of "basic_annual"

UPDATE "public"."profiles" 
SET 
  subscription_plan = CASE 
    WHEN subscription_plan = 'basic' AND billing_period = 'annual' THEN 'basic_annual'
    WHEN subscription_plan = 'basic' AND billing_period = 'monthly' THEN 'basic_monthly'
    WHEN subscription_plan = 'basic' AND billing_period IS NULL THEN 'basic_monthly'
    ELSE subscription_plan
  END,
  billing_period = CASE 
    WHEN subscription_plan = 'basic' AND billing_period IS NULL THEN 'monthly'
    ELSE billing_period
  END
WHERE subscription_plan = 'basic';
