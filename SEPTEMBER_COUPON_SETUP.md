# September Coupon Auto-Apply Setup

## Overview
The checkout session function has been updated to automatically apply a September promotional coupon during September 2025. This eliminates the need for users to manually enter a promo code.

## Configuration Required

### 1. Environment Variables
Add these environment variables to your Supabase project:

```bash
# Enable promotional pricing
PROMOTIONAL_PRICING_ENABLED=true

# September promotional period (defaults to September 2025)
PROMOTIONAL_PRICING_START=2025-09-01T00:00:00Z
PROMOTIONAL_PRICING_END=2025-09-30T23:59:59Z

# Your Stripe coupon ID for the September promotion
SEPTEMBER_COUPON_ID=coupon_XXXXXXX
```

### 2. Stripe Coupon Setup
In your Stripe dashboard:
1. Create a coupon with your desired discount (e.g., 3 months at $9.99)
2. Copy the coupon ID (starts with `coupon_`)
3. Set the coupon ID in the `SEPTEMBER_COUPON_ID` environment variable

## How It Works

### Auto-Apply Logic
- **During September 2025**: The coupon is automatically applied to all new subscriptions
- **Outside September**: No coupon is applied, users pay regular pricing
- **Manual Override**: Users can still enter promo codes if needed (only if no auto-coupon was applied)

### Implementation Details
The function checks:
1. If promotional pricing is enabled
2. If current date is within September 2025
3. If the September coupon ID is configured
4. If the coupon exists and is valid in Stripe

If all conditions are met, the coupon is automatically applied to the checkout session.

## Testing
To test the implementation:
1. Set `PROMOTIONAL_PRICING_ENABLED=true`
2. Temporarily modify the date range to include current date
3. Create a test checkout session
4. Verify the coupon appears in the Stripe checkout

## Fallback Behavior
- If the September coupon is invalid or missing, the system logs a warning but continues without the coupon
- Manual promo codes still work as a fallback
- Regular pricing applies outside the promotional period
