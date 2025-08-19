// supabase/functions/student-log-waste/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { towerId, teacherId, plant_name, plant_quantity, grams, notes } = await req.json()

    if (!towerId || !teacherId || !grams) {
      throw new Error("Tower ID, Teacher ID, and weight are required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // --- SECURITY CHECK ---
    const { data: tower, error: towerErr } = await supabaseAdmin
      .from('towers')
      .select('id')
      .eq('id', towerId)
      .eq('teacher_id', teacherId)
      .single();

    if (towerErr) throw new Error("Authorization error: Could not verify tower ownership.");
    
    // --- INSERT DATA ---
    const { error: insertError } = await supabaseAdmin
      .from('waste_logs')
      .insert({ 
        tower_id: towerId, 
        teacher_id: teacherId, 
        plant_name: plant_name || null,
        plant_quantity: plant_quantity || 1,
        grams, 
        notes: notes || null
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "Waste logged successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})