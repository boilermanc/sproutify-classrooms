import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

// --- Stripe setup ---
const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
if (!stripeSecret) console.error("Missing STRIPE_SECRET_KEY in function secrets");
const stripe = new Stripe(stripeSecret!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

// --- CORS ---
const CORS = {
  "Access-Control-Allow-Origin": "*", // tighten later to your domain(s)
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: CORS });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // --- Price resolution (plan OR explicit priceId) ---
    const explicitPriceId: string | undefined = body.priceId;
    const plan = (body.plan ?? body.billingPeriod ?? "").toString().toLowerCase();

    const PLAN_PRICE_MAP: Record<string, string | undefined> = {
      basic_monthly:     Deno.env.get("STRIPE_BASIC_MONTHLY"),
      basic_annual:      Deno.env.get("STRIPE_BASIC_ANNUAL"),
      basic_promotional: Deno.env.get("STRIPE_BASIC_PROMOTIONAL"),
      // tolerate simple names:
      monthly:           Deno.env.get("STRIPE_BASIC_MONTHLY"),
      annual:            Deno.env.get("STRIPE_BASIC_ANNUAL"),
    };

    const resolvedFromPlan = plan ? PLAN_PRICE_MAP[plan] : undefined;
    const priceId = explicitPriceId ?? resolvedFromPlan;

    // Allowlist enforcement: only env-configured prices are valid
    const allowedPrices = new Set(Object.values(PLAN_PRICE_MAP).filter((v): v is string => !!v));
    if (!priceId || !allowedPrices.has(priceId)) {
      return new Response(
        JSON.stringify({ error: "Unknown or disallowed priceId/plan" }),
        { status: 400, headers: CORS }
      );
    }

    // --- Origin-aware redirect base URL ---
    const origin = req.headers.get("origin") || "";
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
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      locale: "en", // avoids dynamic import of './en' that some blockers break
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

    // // (Optional) Promo code support:
    // const promoCode: string | undefined = body.promoCode;
    // if (promoCode) {
    //   try {
    //     const found = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 });
    //     if (found.data.length > 0) {
    //       (params as any).discounts = [{ promotion_code: found.data[0].id }];
    //     }
    //   } catch (e) {
    //     console.warn("Promo code lookup failed:", e);
    //   }
    // }

    const session = await stripe.checkout.sessions.create(params);
    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: CORS });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Checkout create failed" }), {
      status: 500,
      headers: CORS,
    });
  }
});
