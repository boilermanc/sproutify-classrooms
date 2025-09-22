-- Fix your current subscription to use promotional pricing
-- You should have been charged $9.99 instead of $19.99

-- 1. Update your profile to reflect promotional pricing (idempotent)
BEGIN;
UPDATE profiles 
SET 
  subscription_plan = 'basic_monthly_promo',  -- Change to promotional plan
  subscription_ends_at = '2025-10-10 00:10:16.661965+00'  -- Keep same end date
WHERE id = '2ae799e3-a379-432f-a5df-94e6f76e937e'
  AND subscription_plan != 'basic_monthly_promo'  -- Only update if not already correct
  AND subscription_status = 'active';  -- Only update active subscriptions
COMMIT;

-- 2. Update the purchase record to use promotional plan (target only current purchase)
BEGIN;
UPDATE purchases 
SET 
  plan_id = (SELECT id FROM plans WHERE stripe_price_id = 'price_1S3NYCKHJbtiKAzVJBUoKWXX'),
  status = 'active'
WHERE id = (
  SELECT id FROM purchases 
  WHERE user_id = '2ae799e3-a379-432f-a5df-94e6f76e937e' 
  ORDER BY created_at DESC 
  LIMIT 1
);
COMMIT;

-- 3. Log the correction event
INSERT INTO subscription_events (
  user_id, 
  event_type, 
  stripe_event_id, 
  data
) VALUES (
  '2ae799e3-a379-432f-a5df-94e6f76e937e',
  'subscription.corrected',
  'manual_correction',
  '{"reason": "Applied promotional pricing", "original_price": 1999, "corrected_price": 999, "plan": "basic_monthly_promo"}'
);

-- Verify the changes
SELECT 
  p.subscription_plan,
  p.subscription_status,
  pl.name as plan_name,
  pl.unit_amount as price_cents,
  pl.stripe_price_id
FROM profiles p
LEFT JOIN purchases pu ON p.id = pu.user_id
LEFT JOIN plans pl ON pu.plan_id = pl.id
WHERE p.id = '2ae799e3-a379-432f-a5df-94e6f76e937e';
