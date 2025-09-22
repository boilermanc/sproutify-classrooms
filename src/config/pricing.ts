// src/config/pricing.ts - Shared pricing configuration

export interface PricingConfig {
  monthlyPrice: number;
  annualPrice: number;
  originalMonthlyPrice: number;
  originalAnnualPrice: number;
}

export const DISTRICT_PRICING: PricingConfig = {
  monthlyPrice: 14999, // $149.99
  annualPrice: 324000, // $3,240
  originalMonthlyPrice: 29999, // $299.99
  originalAnnualPrice: 359880, // $3,598.80 (10% off from $299.99 * 12)
};

export const SCHOOL_PRICING: PricingConfig = {
  monthlyPrice: 4999, // $49.99
  annualPrice: 108000, // $1,080
  originalMonthlyPrice: 9999, // $99.99
  originalAnnualPrice: 119988, // $1,199.88 ($99.99 × 12)
};
