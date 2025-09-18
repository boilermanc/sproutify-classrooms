// supabase/functions/test-rpc/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tower_id } = await req.json()
    
    if (!tower_id) {
      throw new Error("Tower ID is required.")
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create a fresh client instance for each request
    const supabase = createClient(
      supabaseUrl, 
      supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public'
        }
      }
    )
    
    const results: any = {}
    
    // Test 1: Simple function
    console.log('Testing simple function...')
    try {
      const { data: testData, error: testError } = await supabase
        .rpc('test_simple')
      
      results.simple_test = {
        success: !testError,
        data: testData,
        error: testError?.message
      }
      console.log('Simple test result:', testData, testError)
    } catch (err) {
      results.simple_test = {
        success: false,
        error: err.message
      }
    }
    
    // Test 2: Positional parameter
    console.log('Testing positional parameter...')
    try {
      const { data: posData, error: posError } = await supabase
        .rpc('get_tower_resources', tower_id)
      
      results.positional_test = {
        success: !posError,
        data: posData ? 'Data received' : null,
        error: posError?.message
      }
      console.log('Positional test result:', posData ? 'Success' : posError?.message)
    } catch (err) {
      results.positional_test = {
        success: false,
        error: err.message
      }
    }
    
    // Test 3: Named parameter
    console.log('Testing named parameter...')
    try {
      const { data: namedData, error: namedError } = await supabase
        .rpc('get_tower_resources', { p_tower_id: tower_id })
      
      results.named_test = {
        success: !namedError,
        data: namedData ? 'Data received' : null,
        error: namedError?.message
      }
      console.log('Named test result:', namedData ? 'Success' : namedError?.message)
    } catch (err) {
      results.named_test = {
        success: false,
        error: err.message
      }
    }
    
    // Test 4: View approach
    console.log('Testing view approach...')
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('v_tower_resources')
        .select('resources')
        .eq('tower_id', tower_id)
        .single()
      
      results.view_test = {
        success: !viewError,
        data: viewData ? 'Data received' : null,
        error: viewError?.message
      }
      console.log('View test result:', viewData ? 'Success' : viewError?.message)
    } catch (err) {
      results.view_test = {
        success: false,
        error: err.message
      }
    }
    
    // Test 5: Direct table query
    console.log('Testing direct table query...')
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('towers')
        .select(`
          id,
          name,
          created_at,
          ports,
          harvests(*),
          pest_logs(*),
          plantings(*),
          tower_documents(*),
          tower_photos(*),
          tower_vitals(*),
          waste_logs(*)
        `)
        .eq('id', tower_id)
        .single()
      
      results.table_test = {
        success: !tableError,
        data: tableData ? 'Data received' : null,
        error: tableError?.message
      }
      console.log('Table test result:', tableData ? 'Success' : tableError?.message)
    } catch (err) {
      results.table_test = {
        success: false,
        error: err.message
      }
    }
    
    return new Response(
      JSON.stringify({ 
        tower_id,
        results,
        summary: {
          total_tests: 5,
          successful_tests: Object.values(results).filter((r: any) => r.success).length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (err) {
    console.error('Test function error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
