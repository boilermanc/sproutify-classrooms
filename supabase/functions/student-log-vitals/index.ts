// supabase/functions/student-log-vitals/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("student-log-vitals function invoked");

Deno.serve(async (req) => {
  // This is needed for browser-based requests to work (preflight requests)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { towerId, teacherId, ph, ec, light } = await req.json()

    // A basic validation to ensure we have the required data
    if (!towerId || !teacherId) {
        throw new Error("Tower ID and Teacher ID are required.");
    }

    // Create a Supabase client with the SERVICE_ROLE_KEY to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // --- SECURITY CHECK ---
    // Before we insert, we must verify the tower belongs to the teacher.
    // This prevents a student from one class logging data for another.
    const { data: towerData, error: towerError } = await supabaseAdmin
      .from('towers')
      .select('id')
      .eq('id', towerId)
      .eq('teacher_id', teacherId)
      .single()

    if (towerError || !towerData) {
      console.error("Authorization error:", towerError);
      throw new Error("Authorization error: Tower does not belong to the specified teacher.")
    }

    // --- INSERT DATA ---
    // Now that we've verified ownership, we can safely insert the vitals.
    const { error: insertError } = await supabaseAdmin
      .from('tower_vitals')
      .insert({
        tower_id: towerId,
        teacher_id: teacherId,
        ph: ph || null,
        ec: ec || null,
        light_lux: light ? Math.round(light * 1000) : null,
      })
      
    if (insertError) throw insertError

    return new Response(JSON.stringify({ message: "Vitals logged successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})