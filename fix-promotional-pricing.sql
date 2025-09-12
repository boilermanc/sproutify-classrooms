-- Update the plans table with correct promotional pricing
-- Basic Monthly Promotional should be $9.99 (999 cents)

UPDATE plans 
SET unit_amount = 999 
WHERE stripe_price_id = 'price_1S3NYCKHJbtiKAzVJBUoKWXX';

-- Verify the update
SELECT code, name, stripe_price_id, unit_amount, interval 
FROM plans 
WHERE stripe_price_id IN ('price_1S41WnKHJbtiKAzVkLuDmvEu', 'price_1S3NYCKHJbtiKAzVJBUoKWXX')
ORDER BY stripe_price_id;
