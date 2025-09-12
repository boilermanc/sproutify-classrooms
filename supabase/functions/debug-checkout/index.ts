import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: CORS });
  }
  
  // Skip authorization for debugging

  try {
    const body = await req.json().catch(() => ({}));

    // --- Simple Price Resolution (matching main checkout function) ---
    const priceId: string | undefined = body.priceId;
    const plan = (body.plan ?? body.billingPeriod ?? "").toString().toLowerCase();

    // Direct price ID mapping - no complex string manipulation
    const PLAN_PRICE_MAP: Record<string, string> = {
      // Basic Plan
      basic_monthly:     'price_1S41WnKHJbtiKAzVkLuDmvEu',
      basic_monthly_promo: 'price_1S3NYCKHJbtiKAzVJBUoKWXX',
      basic_annual:      'price_1S5Yz6KHJbtiKAzVQ9wFOeCK',
      
      // Professional Plan
      professional_monthly:     'price_1S41c2KHJbtiKAzV8crsVNX1',
      professional_monthly_promo: 'price_1S41eGKHJbtiKAzV2c95F8ge',
      professional_annual:      'price_1S5Z3jKHJbtiKAzV5WdGZMMA',
      
      // School Plan
      school_monthly:     'price_1S41gQKHJbtiKAzV6qJdJIjN',
      school_monthly_promo: 'price_1S41hDKHJbtiKAzVW0n8QUPU',
      school_annual:      'price_1S5YwKKHJbtiKAzVFDODzk5a',
      
      // District Plan
      district_monthly:     'price_1S5YfqKHJbtiKAzV847eglJR',
      district_monthly_promo: 'price_1S5YhOKHJbtiKAzVh21kiE2m',
      district_annual:      'price_1S5YhyKHJbtiKAzV2pATTPJp',
      
      // Simple names (default to basic)
      monthly:           'price_1S41WnKHJbtiKAzVkLuDmvEu',
      annual:            'price_1S5Yz6KHJbtiKAzVQ9wFOeCK',
    };

    // Simple price resolution: use explicit priceId or map from plan
    const finalPriceId = priceId || PLAN_PRICE_MAP[plan];

    // Validation checks
    const isValidPriceId = !!finalPriceId;
    const isAllowedPriceId = finalPriceId ? new Set(Object.values(PLAN_PRICE_MAP)).has(finalPriceId) : false;

    // Return debug information instead of creating checkout session
    return new Response(JSON.stringify({
      debug: {
        requestBody: body,
        priceId,
        plan,
        PLAN_PRICE_MAP,
        finalPriceId,
        isValidPriceId,
        isAllowedPriceId,
        validation: {
          hasPriceId: !!priceId,
          hasPlan: !!plan,
          priceIdInMap: priceId ? PLAN_PRICE_MAP[plan] : null,
          finalResolution: finalPriceId
        }
      }
    }), { status: 200, headers: CORS });
    
  } catch (err: any) {
    console.error("Debug error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
});
