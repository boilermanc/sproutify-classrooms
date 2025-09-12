import Stripe from 'stripe';

// Client-side Stripe for checkout
export const getStripe = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);
};

// Server-side Stripe client (for API routes)
export const stripe = typeof window === 'undefined' ? new Stripe(
  process.env.STRIPE_SECRET_KEY || '', 
  { apiVersion: '2025-08-27.basil' }
) : null;

// Your actual Stripe Price IDs - PRODUCTION IDs
export const STRIPE_PRICE_IDS = {
  basic: {
    monthly: 'price_1S41WnKHJbtiKAzVkLuDmvEu',     // Basic Monthly Regular
    annual: 'price_1S5Yz6KHJbtiKAzVQ9wFOeCK',      // Basic Annual
    promotional: 'price_1S3NYCKHJbtiKAzVJBUoKWXX'  // Basic Monthly Promo
  },
  professional: {
    monthly: 'price_1S41c2KHJbtiKAzV8crsVNX1',     // Professional Monthly Regular
    annual: 'price_1S5Z3jKHJbtiKAzV5WdGZMMA',      // Professional Annual
    promotional: 'price_1S41eGKHJbtiKAzV2c95F8ge'  // Professional Monthly Promo
  },
  school: {
    monthly: 'price_1S41gQKHJbtiKAzV6qJdJIjN',     // School Monthly Regular
    annual: 'price_1S5YwKKHJbtiKAzVFDODzk5a',      // School Annual
    promotional: 'price_1S41hDKHJbtiKAzVW0n8QUPU'  // School Monthly Promo
  },
  district: {
    monthly: 'price_1S5YfqKHJbtiKAzV847eglJR',     // District Monthly Regular
    annual: 'price_1S5YhyKHJbtiKAzV2pATTPJp',      // District Annual
    promotional: 'price_1S5YhOKHJbtiKAzVh21kiE2m'  // District Monthly Promo
  }
} as const;

// Plan configurations - CORRECTED PRICING
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    monthlyPrice: 1999, // $19.99 in cents
    annualPrice: 10788, // $107.88 in cents ($8.99/month)
    promotionalPrice: 999, // $9.99 in cents (promotional price)
    features: {
      towers: 3,
      students: 50
    },
    stripePriceId: {
      monthly: STRIPE_PRICE_IDS.basic.monthly,
      annual: STRIPE_PRICE_IDS.basic.annual,
      promotional: STRIPE_PRICE_IDS.basic.promotional
    }
  },
  professional: {
    name: 'Professional', 
    monthlyPrice: 3999, // $39.99 in cents
    annualPrice: 21588, // $215.88 in cents ($17.99/month)
    promotionalPrice: 1999, // $19.99 in cents (promotional price)
    features: {
      towers: 10,
      students: 200
    },
    stripePriceId: {
      monthly: STRIPE_PRICE_IDS.professional.monthly,
      annual: STRIPE_PRICE_IDS.professional.annual,
      promotional: STRIPE_PRICE_IDS.professional.promotional
    }
  },
  school: {
    name: 'School',
    monthlyPrice: 9999, // $99.99 in cents
    annualPrice: 108000, // $1,080 in cents ($90/month)
    promotionalPrice: 4999, // $49.99 in cents (promotional price)
    features: {
      towers: 25,
      students: 500
    },
    stripePriceId: {
      monthly: STRIPE_PRICE_IDS.school.monthly,
      annual: STRIPE_PRICE_IDS.school.annual,
      promotional: STRIPE_PRICE_IDS.school.promotional
    }
  },
  district: {
    name: 'District',
    monthlyPrice: 29999, // $299.99 in cents
    annualPrice: 324000, // $3,240 in cents ($270/month)
    promotionalPrice: 14999, // $149.99 in cents (promotional price)
    features: {
      towers: -1, // unlimited
      students: -1 // unlimited
    },
    stripePriceId: {
      monthly: STRIPE_PRICE_IDS.district.monthly,
      annual: STRIPE_PRICE_IDS.district.annual,
      promotional: STRIPE_PRICE_IDS.district.promotional
    }
  }
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Utility function to get the appropriate price ID with automatic promotional detection
export const getPriceId = (plan: PlanType, billingPeriod: 'monthly' | 'annual' = 'monthly', isPromotional?: boolean) => {
  const planConfig = SUBSCRIPTION_PLANS[plan];
  
  // Check if promotional pricing should be automatically applied
  const shouldUsePromotional = isPromotional || isPromotionalPricingActive();
  
  if (shouldUsePromotional && billingPeriod === 'monthly') {
    return planConfig.stripePriceId.promotional;
  }
  
  return billingPeriod === 'annual' 
    ? planConfig.stripePriceId.annual 
    : planConfig.stripePriceId.monthly;
};

// Promotional pricing configuration
export const PROMOTIONAL_PRICING_CONFIG = {
  enabled: true,
  schedule: {
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-09-30T23:59:59Z', // End of September 2025
  },
  eligiblePlans: ['basic', 'professional', 'school', 'district'],
  rules: {
    autoApply: true,
    showOnPricingPage: true,
    allowManualOverride: true
  }
};

// Function to check if promotional pricing should be active
export const isPromotionalPricingActive = (): boolean => {
  if (!PROMOTIONAL_PRICING_CONFIG.enabled) {
    return false;
  }
  
  const now = new Date();
  const startDate = new Date(PROMOTIONAL_PRICING_CONFIG.schedule.startDate);
  const endDate = new Date(PROMOTIONAL_PRICING_CONFIG.schedule.endDate);
  
  return now >= startDate && now <= endDate;
};

// Function to get promotional pricing info
export const getPromotionalPricingInfo = () => {
  const isActive = isPromotionalPricingActive();
  const endDate = new Date(PROMOTIONAL_PRICING_CONFIG.schedule.endDate);
  
  return {
    isActive,
    endDate: endDate.toISOString(),
    daysRemaining: isActive ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
    message: isActive ? `Promotional pricing ends in ${Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` : 'Promotional pricing has ended'
  };
};

// Function to create checkout session with promo code support - UPDATED FOR SUPABASE
export const createCheckoutSession = async (
  priceId: string, 
  userId: string, 
  promoCode?: string | null
) => {
  try {
    // Import supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Call your Supabase Edge Function instead of /api route
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        userId,
        trialPeriodDays: 7,
        promoCode: promoCode || undefined,
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.sessionId) {
      throw new Error('No session ID returned');
    }

    const stripe = await getStripe();
    if (!stripe) throw new Error('Failed to load Stripe');

    const { error: stripeError } = await stripe.redirectToCheckout({ 
      sessionId: data.sessionId 
    });
    
    if (stripeError) {
      throw stripeError;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};