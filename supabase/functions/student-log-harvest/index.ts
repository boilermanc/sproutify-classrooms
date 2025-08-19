// supabase/functions/student-log-harvest/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the data the student submitted from the form
    const { towerId, teacherId, plant_name, plant_quantity, weight_grams, destination, notes } = await req.json()

    if (!towerId || !teacherId || !weight_grams) {
      throw new Error("Tower ID, Teacher ID, and weight are required.");
    }

    // Create a secure, admin-level Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // --- SECURITY CHECK ---
    // Verify that the tower belongs to the correct teacher before proceeding.
    const { data: tower, error: towerErr } = await supabaseAdmin
      .from('towers')
      .select('id')
      .eq('id', towerId)
      .eq('teacher_id', teacherId)
      .single();

    if (towerErr) throw new Error("Authorization error: Could not verify tower ownership.");
    
    // --- INSERT DATA ---
    // If the check passes, safely insert the harvest data.
    const { error: insertError } = await supabaseAdmin
      .from('harvests')
      .insert({ 
        tower_id: towerId, 
        teacher_id: teacherId, 
        plant_name: plant_name || null,
        plant_quantity: plant_quantity || 1,
        weight_grams, 
        destination: destination || null,
        notes: notes || null
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "Harvest logged successfully" }), {
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