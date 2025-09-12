import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:5173",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  
  // Require authentication for environment access
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Authorization required" }), { status: 401, headers: CORS });
  }
  
  // Check if origin is allowed
  const origin = req.headers.get("origin");
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:5173").split(',').map(o => o.trim());
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers: CORS });
  }
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS });
  }
  
  try {
    const envVars = {
      STRIPE_BASIC_MONTHLY_REGULAR: Deno.env.get("STRIPE_BASIC_MONTHLY_REGULAR"),
      STRIPE_BASIC_MONTHLY_PROMO: Deno.env.get("STRIPE_BASIC_MONTHLY_PROMO"),
      STRIPE_BASIC_ANNUAL: Deno.env.get("STRIPE_BASIC_ANNUAL"),
      STRIPE_PRO_MONTHLY_REGULAR: Deno.env.get("STRIPE_PRO_MONTHLY_REGULAR"),
      STRIPE_PRO_MONTHLY_PROMO: Deno.env.get("STRIPE_PRO_MONTHLY_PROMO"),
      STRIPE_PRO_ANNUAL: Deno.env.get("STRIPE_PRO_ANNUAL"),
      STRIPE_SCHOOL_MONTHLY_REGULAR: Deno.env.get("STRIPE_SCHOOL_MONTHLY_REGULAR"),
      STRIPE_SCHOOL_MONTHLY_PROMO: Deno.env.get("STRIPE_SCHOOL_MONTHLY_PROMO"),
      STRIPE_SCHOOL_ANNUAL: Deno.env.get("STRIPE_SCHOOL_ANNUAL"),
      STRIPE_DISTRICT_MONTHLY_REGULAR: Deno.env.get("STRIPE_DISTRICT_MONTHLY_REGULAR"),
      STRIPE_DISTRICT_MONTHLY_PROMO: Deno.env.get("STRIPE_DISTRICT_MONTHLY_PROMO"),
      STRIPE_DISTRICT_ANNUAL: Deno.env.get("STRIPE_DISTRICT_ANNUAL"),
    };
    
    return new Response(JSON.stringify(envVars), { status: 200, headers: CORS });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
});
