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

    const { firstName, lastName, schoolName, districtJoinCode } = await req.json();

    // 1) Handle district lookup if join code provided
    let districtId: string | null = null;
    if (districtJoinCode && String(districtJoinCode).trim()) {
      const { data: district, error: districtError } = await supabase
        .from("districts")
        .select("id")
        .eq("join_code", String(districtJoinCode).trim())
        .single();
      
      if (districtError || !district) {
        return new Response(JSON.stringify({ error: "Invalid district join code" }), { status: 400 });
      }
      districtId = district.id;
    }

    // 2) Find/create school (normalize name)
    const name = String(schoolName ?? "").trim();
    if (!name) return new Response(JSON.stringify({ error: "Missing schoolName" }), { status: 400 });

    // Case-insensitive find
    const { data: found, error: findErr } = await supabase
      .from("schools").select("id, district_id").ilike("name", name).limit(1);
    if (findErr) throw findErr;

    let schoolId: string;
    if (found && found.length) {
      schoolId = found[0].id;
      
      // If school exists but doesn't have district_id and we have one, update it
      if (districtId && !found[0].district_id) {
        const { error: updateError } = await supabase
          .from("schools")
          .update({ district_id: districtId })
          .eq("id", schoolId);
        if (updateError) console.warn("Failed to link school to district:", updateError);
      }
    } else {
      const { data: created, error: createErr } = await supabase
        .from("schools").insert({ 
          name,
          district_id: districtId // Link new school to district if provided
        }).select("id").single();
      if (createErr) throw createErr;
      schoolId = created!.id;
    }

    // 3) Upsert profile
    const { error: profileErr } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      first_name: String(firstName ?? "").trim(),
      last_name: String(lastName ?? "").trim(),
      full_name: `${String(firstName ?? "").trim()} ${String(lastName ?? "").trim()}`,
      school_id: schoolId,
      district_id: districtId, // Include district_id if provided
    }, { onConflict: "id" });
    if (profileErr) throw profileErr;

    // 4) Assign teacher role (idempotent-ish)
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "teacher" });
    // ignore duplicate errors if unique(user_id, role)
    if (roleErr && !String(roleErr.message).toLowerCase().includes("duplicate")) throw roleErr;

    return new Response(JSON.stringify({ ok: true, school_id: schoolId, district_id: districtId }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500 });
  }
});
