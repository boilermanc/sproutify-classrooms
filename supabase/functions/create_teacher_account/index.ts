// minimal example
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role
    );

    const authHeader = req.headers.get("Authorization") ?? "";
    const userRes = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userRes.data.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { firstName, lastName, schoolName } = await req.json();

    // 1) Find/create school (normalize name)
    const name = String(schoolName ?? "").trim();
    if (!name) return new Response(JSON.stringify({ error: "Missing schoolName" }), { status: 400 });

    // Case-insensitive find
    const { data: found, error: findErr } = await supabase
      .from("schools").select("id").ilike("name", name).limit(1);
    if (findErr) throw findErr;

    let schoolId: string;
    if (found && found.length) {
      schoolId = found[0].id;
    } else {
      const { data: created, error: createErr } = await supabase
        .from("schools").insert({ name }).select("id").single();
      if (createErr) throw createErr;
      schoolId = created!.id;
    }

    // 2) Upsert profile
    const { error: profileErr } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      first_name: String(firstName ?? "").trim(),
      last_name: String(lastName ?? "").trim(),
      full_name: `${String(firstName ?? "").trim()} ${String(lastName ?? "").trim()}`,
      school_id: schoolId,
    }, { onConflict: "id" });
    if (profileErr) throw profileErr;

    // 3) Assign teacher role (idempotent-ish)
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "teacher" });
    // ignore duplicate errors if unique(user_id, role)
    if (roleErr && !String(roleErr.message).toLowerCase().includes("duplicate")) throw roleErr;

    return new Response(JSON.stringify({ ok: true, school_id: schoolId }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500 });
  }
});
