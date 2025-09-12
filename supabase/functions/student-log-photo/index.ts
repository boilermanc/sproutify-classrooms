// supabase/functions/student-log-photo/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the data the student submitted from the form
    const { towerId, teacherId, file_path, caption, student_name } = await req.json()

    console.log('Received data:', { towerId, teacherId, file_path, caption, student_name });

    if (!towerId || !teacherId || !file_path) {
      throw new Error("Tower ID, Teacher ID, and file path are required.");
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
    // If the check passes, safely insert the photo metadata.
    const insertData = { 
      tower_id: towerId, 
      teacher_id: teacherId, 
      file_path,
      caption: caption || null,
      student_name: student_name || null,
      taken_at: new Date().toISOString()
    };
    
    console.log('Inserting data:', insertData);
    
    const { error: insertError } = await supabaseAdmin
      .from('tower_photos')
      .insert(insertData);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    return new Response(JSON.stringify({ message: "Photo logged successfully" }), {
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
