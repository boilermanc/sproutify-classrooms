import Stripe from 'stripe';

// Client-side Stripe for checkout
export const getStripe = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);
};

// Server-side Stripe client (for API routes)
export const stripe = typeof window === 'undefined' ? new Stripe(
  process.env.STRIPE_SECRET_KEY || '', 
  { apiVersion: '2024-06-20' }
) : null;

// Your actual Stripe Price IDs - UPDATED WITH TEST MODE IDs
export const STRIPE_PRICE_IDS = {
  basic: {
    monthly: 'price_1S45NJKHJbtiKAzVnJdU93Cr',     // TEST MODE Basic monthly ($19.99)
    annual: 'price_1S4mblKHJbtiKAzVzxDjpLKw',      // TEST MODE Basic annual
    promotional: 'price_1S45O4KHJbtiKAzVzKjIh4q0'  // TEST MODE Basic promotional ($9.99)
  },
  professional: {
    monthly: 'price_1S41c2KHJbtiKAzV8crsVNX1',     // $39.99 Professional monthly
    annual: '', // TODO: Add annual price ID when available
    promotional: 'price_1S41eGKHJbtiKAzV2c95F8ge'  // $19.99 Professional promotional
  },
  school: {
    monthly: 'price_1S41gQKHJbtiKAzV6qJdJIjN',     // $79.99 School monthly
    annual: '', // TODO: Add annual price ID when available
    promotional: 'price_1S41hDKHJbtiKAzVW0n8QUPU'  // $39.99 School promotional
  }
} as const;

// Plan configurations
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    monthlyPrice: 1999, // $19.99 in cents
    annualPrice: 21588, // $215.88 in cents (10% off from $239.88)
    promotionalPrice: 999, // $9.99 in cents (50% off)
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
    annualPrice: 0, // TODO: Set actual annual price when known
    promotionalPrice: 1999, // $19.99 in cents
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
    name: 'School District',
    monthlyPrice: 7999, // $79.99 in cents
    annualPrice: 0, // TODO: Set actual annual price when known
    promotionalPrice: 3999, // $39.99 in cents
    features: {
      towers: -1, // unlimited
      students: -1 // unlimited
    },
    stripePriceId: {
      monthly: STRIPE_PRICE_IDS.school.monthly,
      annual: STRIPE_PRICE_IDS.school.annual,
      promotional: STRIPE_PRICE_IDS.school.promotional
    }
  }
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Utility function to get the appropriate price ID
export const getPriceId = (plan: PlanType, billingPeriod: 'monthly' | 'annual' = 'monthly', isPromotional: boolean = false) => {
  const planConfig = SUBSCRIPTION_PLANS[plan];
  
  if (isPromotional) {
    return planConfig.stripePriceId.promotional;
  }
  
  return billingPeriod === 'annual' 
    ? planConfig.stripePriceId.annual 
    : planConfig.stripePriceId.monthly;
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