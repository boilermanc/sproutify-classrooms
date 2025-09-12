import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "").trim();

    // Service client (can bypass RLS if needed)
    const svc = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // Ensure caller is a signed-in user
    const { data: userRes, error: whoErr } = await svc.auth.getUser(jwt);
    if (whoErr || !userRes?.user) {
      return new Response("Unauthorized", { status: 401, headers: cors() });
    }
    const caller = userRes.user;

    // Check caller is super_admin via user_roles
    const { data: roleRows, error: roleErr } = await svc
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "super_admin")
      .limit(1);
    if (roleErr) {
      return new Response(`Role check failed: ${roleErr.message}`, { status: 400, headers: cors() });
    }
    if (!roleRows || roleRows.length === 0) {
      return new Response("Forbidden", { status: 403, headers: cors() });
    }

    // Parse request
    const body = await req.json().catch(() => ({}));
    const email: string | undefined = body.email;
    const role: "staff" | "super_admin" | undefined = body.role;

    if (!email || !["staff", "super_admin"].includes(String(role))) {
      return new Response("Bad request", { status: 400, headers: cors() });
    }

    // Invite user by email (email will get a magic link / password setup)
    const inviteRes = await svc.auth.admin.inviteUserByEmail(email);
    if (inviteRes.error) {
      return new Response(inviteRes.error.message, { status: 400, headers: cors() });
    }

    const newUserId = inviteRes.data.user?.id;
    if (newUserId) {
      // Upsert role into user_roles (unique on user_id,role)
      const { error: upErr } = await svc
        .from("user_roles")
        .upsert({ user_id: newUserId, role }, { onConflict: "user_id,role" });
      if (upErr) {
        return new Response(upErr.message, { status: 400, headers: cors() });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors() },
    });
  } catch (e: any) {
    return new Response(e?.message ?? "Server error", { status: 500, headers: cors() });
  }
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}
