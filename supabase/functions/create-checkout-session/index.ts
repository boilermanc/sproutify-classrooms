import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Promotional pricing configuration from environment variables
const PROMOTIONAL_PRICING_CONFIG = {
  enabled: Deno.env.get("PROMOTIONAL_PRICING_ENABLED") === "true",
  schedule: {
    startDate: Deno.env.get("PROMOTIONAL_PRICING_START") || '2025-09-01T00:00:00Z',
    endDate: Deno.env.get("PROMOTIONAL_PRICING_END") || '2025-09-30T23:59:59Z',
  },
  eligiblePlans: (Deno.env.get("PROMOTIONAL_ELIGIBLE_PLANS") || 'basic,professional,school,district').split(',').map(p => p.trim()),
  rules: {
    autoApply: Deno.env.get("PROMOTIONAL_RULES_AUTO_APPLY") !== "false",
    showOnPricingPage: Deno.env.get("PROMOTIONAL_RULES_SHOW_ON_PRICING") !== "false",
    allowManualOverride: Deno.env.get("PROMOTIONAL_RULES_ALLOW_OVERRIDE") !== "false"
  }
};

// Function to check if promotional pricing should be active
const isPromotionalPricingActive = (): boolean => {
  if (!PROMOTIONAL_PRICING_CONFIG.enabled) {
    return false;
  }
  
  const now = new Date();
  const startDate = new Date(PROMOTIONAL_PRICING_CONFIG.schedule.startDate);
  const endDate = new Date(PROMOTIONAL_PRICING_CONFIG.schedule.endDate);
  
  return now >= startDate && now <= endDate;
};

// --- Stripe setup ---
const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
if (!stripeSecret) {
  throw new Error("Missing STRIPE_SECRET_KEY in function secrets");
}
const stripe = new Stripe(stripeSecret, {
  apiVersion: "2025-08-27.basil",
  httpClient: Stripe.createFetchHttpClient(),
});

// --- CORS ---
const getAllowedOrigins = (): string[] => {
  const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS");
  if (allowedOriginsEnv) {
    return allowedOriginsEnv.split(',').map(origin => origin.trim()).filter(Boolean);
  }
  
  // Default fallback for development
  return [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://100.96.83.5:8081",
    "https://school.sproutify.app"
  ];
};

const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigins = getAllowedOrigins();
  const isValidOrigin = origin && allowedOrigins.includes(origin);
  
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
  
  if (isValidOrigin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  
  return headers;
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  // Preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // --- Simple Price Resolution ---
    const priceId: string | undefined = body.priceId;
    const plan = (body.plan ?? body.billingPeriod ?? "").toString().toLowerCase();
    
    // Check if promotional pricing should be automatically applied
    const isPromotionalPeriod = isPromotionalPricingActive();
    const isPromotional: boolean = body.isPromotional || body.promoCode || isPromotionalPeriod;
    
    console.log('Promotional pricing check:', {
      isPromotionalPeriod,
      manualPromotional: body.isPromotional || body.promoCode,
      finalIsPromotional: isPromotional
    });

    // Price ID mapping from environment variables
    const PLAN_PRICE_MAP: Record<string, string> = {
      // Basic Plan
      basic_monthly: Deno.env.get("PRICE_BASIC_MONTHLY") || '',
      basic_monthly_promo: Deno.env.get("PRICE_BASIC_MONTHLY_PROMO") || '',
      basic_annual: Deno.env.get("PRICE_BASIC_ANNUAL") || '',
      
      // Professional Plan
      professional_monthly: Deno.env.get("PRICE_PROFESSIONAL_MONTHLY") || '',
      professional_monthly_promo: Deno.env.get("PRICE_PROFESSIONAL_MONTHLY_PROMO") || '',
      professional_annual: Deno.env.get("PRICE_PROFESSIONAL_ANNUAL") || '',
      
      // School Plan
      school_monthly: Deno.env.get("PRICE_SCHOOL_MONTHLY") || '',
      school_monthly_promo: Deno.env.get("PRICE_SCHOOL_MONTHLY_PROMO") || '',
      school_annual: Deno.env.get("PRICE_SCHOOL_ANNUAL") || '',
      
      // District Plan
      district_monthly: Deno.env.get("PRICE_DISTRICT_MONTHLY") || '',
      district_monthly_promo: Deno.env.get("PRICE_DISTRICT_MONTHLY_PROMO") || '',
      district_annual: Deno.env.get("PRICE_DISTRICT_ANNUAL") || '',
      
      // Simple names (default to basic)
      monthly: Deno.env.get("PRICE_BASIC_MONTHLY") || '',
      annual: Deno.env.get("PRICE_BASIC_ANNUAL") || '',
    };

    // Validate that required price IDs are configured
    const requiredPrices = ['PRICE_BASIC_MONTHLY', 'PRICE_BASIC_ANNUAL'];
    const missingPrices = requiredPrices.filter(price => !Deno.env.get(price));
    if (missingPrices.length > 0) {
      console.error('Missing required price IDs:', missingPrices);
      return new Response(
        JSON.stringify({ error: "Price configuration incomplete" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Simple price resolution: use explicit priceId or map from plan
    let finalPriceId = priceId || PLAN_PRICE_MAP[plan];
    
    // If promotional and we have a regular price, try to use promotional version
    if (isPromotional && finalPriceId && !finalPriceId.includes('_promo')) {
      const promoKey = Object.keys(PLAN_PRICE_MAP).find(key => 
        key.includes('_promo') && key.replace('_promo', '') === plan
      );
      if (promoKey) {
        finalPriceId = PLAN_PRICE_MAP[promoKey];
        console.log('Using promotional price:', finalPriceId, 'for plan:', plan);
      }
    }

    // Simple validation: must have a valid price ID
    if (!finalPriceId) {
      return new Response(
        JSON.stringify({ error: "Invalid price ID or plan" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate price ID is in our allowed list
    const allowedPriceIds = new Set(Object.values(PLAN_PRICE_MAP));
    if (!allowedPriceIds.has(finalPriceId)) {
      return new Response(
        JSON.stringify({ error: "Price ID not allowed" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // --- Origin-aware redirect base URL ---
    const configuredSiteUrl = Deno.env.get("SITE_URL") || ""; // e.g. http://100.96.83.5:8081 (test) or https://school.sproutify.app (prod)
    const allowedOrigins = new Set([
      configuredSiteUrl,
      "http://100.96.83.5:8081",      // test box (keep/remove as needed)
      "https://school.sproutify.app", // prod domain (add now for later)
    ].filter(Boolean));

    const siteUrl =
      (origin && allowedOrigins.has(origin)) ? origin :
      (configuredSiteUrl || "http://localhost:5173");

    const successUrl = body.successUrl || `${siteUrl}/subscription/success`;
    const cancelUrl  = body.cancelUrl  || `${siteUrl}/pricing`;

    // --- Optional inputs ---
    const customer_email: string | undefined = body.customer_email;
    const userId: string | undefined = body.userId;
    const trial_period_days: number | undefined = body.trial_period_days ?? 7;

    // --- Minimal, robust Checkout Session ---
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      line_items: [{ price: finalPriceId, quantity: 1 }],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      // Removed locale to avoid dynamic import issues
      ...(customer_email ? { customer_email } : {}),
      ...(trial_period_days ? { subscription_data: { trial_period_days } } : {}),
    };

    // Add metadata for webhook processing
    if (userId) {
      params.metadata = { 
        supabase_user_id: userId, 
        billingPeriod: plan || "unspecified" 
      };
      if (params.subscription_data) {
        params.subscription_data.metadata = { 
          supabase_user_id: userId, 
          billingPeriod: plan || "unspecified" 
        };
      }
    }

    // Auto-apply September coupon if in promotional period
    const septemberCouponId = Deno.env.get("SEPTEMBER_COUPON_ID");
    if (isPromotionalPeriod && septemberCouponId) {
      try {
        // Verify the coupon exists and is active
        const coupon = await stripe.coupons.retrieve(septemberCouponId);
        if (coupon && coupon.valid) {
          params.discounts = [{ coupon: septemberCouponId }];
          console.log('Auto-applying September coupon:', septemberCouponId);
        }
      } catch (e) {
        console.warn("September coupon lookup failed:", e);
      }
    }

    // Manual promo code support (if user enters a code)
    const promoCode: string | undefined = body.promoCode;
    if (promoCode && !params.discounts) { // Only apply manual code if no auto-coupon was applied
      try {
        const found = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 });
        if (found.data.length > 0) {
          params.discounts = [{ promotion_code: found.data[0].id }];
          console.log('Applied manual promo code:', promoCode);
        }
      } catch (e) {
        console.warn("Manual promo code lookup failed:", e);
      }
    }

    const session = await stripe.checkout.sessions.create(params);
    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Checkout create failed" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
