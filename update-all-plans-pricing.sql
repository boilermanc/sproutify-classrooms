-- Complete Plans Table Update with ALL Correct Pricing
-- Run this to update all promotional pricing in the plans table

-- Update all promotional prices with correct amounts
UPDATE plans 
SET unit_amount = 999 
WHERE stripe_price_id = 'price_1S3NYCKHJbtiKAzVJBUoKWXX'; -- Basic Promo: $9.99

UPDATE plans 
SET unit_amount = 1999 
WHERE stripe_price_id = 'price_1S41eGKHJbtiKAzV2c95F8ge'; -- Professional Promo: $19.99

UPDATE plans 
SET unit_amount = 4999 
WHERE stripe_price_id = 'price_1S41hDKHJbtiKAzVW0n8QUPU'; -- School Promo: $49.99

UPDATE plans 
SET unit_amount = 14999 
WHERE stripe_price_id = 'price_1S5YhOKHJbtiKAzVh21kiE2m'; -- District Promo: $149.99

-- Update regular monthly prices
UPDATE plans 
SET unit_amount = 1999 
WHERE stripe_price_id = 'price_1S41WnKHJbtiKAzVkLuDmvEu'; -- Basic Regular: $19.99

UPDATE plans 
SET unit_amount = 3999 
WHERE stripe_price_id = 'price_1S41c2KHJbtiKAzV8crsVNX1'; -- Professional Regular: $39.99

UPDATE plans 
SET unit_amount = 9999 
WHERE stripe_price_id = 'price_1S41gQKHJbtiKAzV6qJdJIjN'; -- School Regular: $99.99

UPDATE plans 
SET unit_amount = 29999 
WHERE stripe_price_id = 'price_1S5YfqKHJbtiKAzV847eglJR'; -- District Regular: $299.99

-- Update annual prices
UPDATE plans 
SET unit_amount = 10788 
WHERE stripe_price_id = 'price_1S5Yz6KHJbtiKAzVQ9wFOeCK'; -- Basic Annual: $107.88

UPDATE plans 
SET unit_amount = 21588 
WHERE stripe_price_id = 'price_1S5Z3jKHJbtiKAzV5WdGZMMA'; -- Professional Annual: $215.88

UPDATE plans 
SET unit_amount = 108000 
WHERE stripe_price_id = 'price_1S5YwKKHJbtiKAzVFDODzk5a'; -- School Annual: $1,080

UPDATE plans 
SET unit_amount = 324000 
WHERE stripe_price_id = 'price_1S5YhyKHJbtiKAzV2pATTPJp'; -- District Annual: $3,240

-- Verify all updates
SELECT 
  code, 
  name, 
  stripe_price_id, 
  unit_amount, 
  interval,
  CASE 
    WHEN unit_amount >= 100000 THEN '$' || (unit_amount::float / 100)::text
    ELSE '$' || (unit_amount::float / 100)::text
  END as price_display
FROM plans 
ORDER BY 
  CASE code 
    WHEN 'basic_monthly' THEN 1
    WHEN 'basic_monthly_promo' THEN 2
    WHEN 'basic_annual' THEN 3
    WHEN 'professional_monthly' THEN 4
    WHEN 'professional_monthly_promo' THEN 5
    WHEN 'professional_annual' THEN 6
    WHEN 'school_monthly' THEN 7
    WHEN 'school_monthly_promo' THEN 8
    WHEN 'school_annual' THEN 9
    WHEN 'district_monthly' THEN 10
    WHEN 'district_monthly_promo' THEN 11
    WHEN 'district_annual' THEN 12
  END;
