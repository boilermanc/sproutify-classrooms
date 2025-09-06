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
    regular: 'price_1S45NJKHJbtiKAzVnJdU93Cr',     // TEST MODE Basic primary ($19.99)
    promotional: 'price_1S45O4KHJbtiKAzVzKjIh4q0'  // TEST MODE Basic promotional ($9.99)
  },
  professional: {
    regular: 'price_1S41c2KHJbtiKAzV8crsVNX1',     // $39.99 Professional (get test mode ID later)
    promotional: 'price_1S41eGKHJbtiKAzV2c95F8ge'  // $19.99 Professional (get test mode ID later)
  },
  school: {
    regular: 'price_1S41gQKHJbtiKAzV6qJdJIjN',     // $79.99 School (get test mode ID later)
    promotional: 'price_1S41hDKHJbtiKAzVW0n8QUPU'  // $39.99 School (get test mode ID later)
  }
} as const;

// Plan configurations
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    monthlyPrice: 1999, // $19.99 in cents
    promotionalPrice: 999, // $9.99 in cents (50% off)
    features: {
      towers: 3,
      students: 50
    },
    stripePriceId: {
      monthly: STRIPE_PRICE_IDS.basic.regular,
      promotional: STRIPE_PRICE_IDS.basic.promotional
    }
  },
  professional: {
    name: 'Professional', 
    monthlyPrice: 3999, // $39.99 in cents
    promotionalPrice: 1999, // $19.99 in cents
    features: {
      towers: 10,
      students: 200
    },
    stripePriceId: {
      monthly: STRIPE_PRICE_IDS.professional.regular,
      promotional: STRIPE_PRICE_IDS.professional.promotional
    }
  },
  school: {
    name: 'School District',
    monthlyPrice: 7999, // $79.99 in cents
    promotionalPrice: 3999, // $39.99 in cents
    features: {
      towers: -1, // unlimited
      students: -1 // unlimited
    },
    stripePriceId: {
      monthly: STRIPE_PRICE_IDS.school.regular,
      promotional: STRIPE_PRICE_IDS.school.promotional
    }
  }
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Utility function to get the appropriate price ID
export const getPriceId = (plan: PlanType, isPromotional: boolean = true) => {
  return isPromotional 
    ? SUBSCRIPTION_PLANS[plan].stripePriceId.promotional
    : SUBSCRIPTION_PLANS[plan].stripePriceId.monthly;
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