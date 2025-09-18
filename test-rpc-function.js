// Test script to verify get_tower_resources function works with PRODUCTION database
// Run this with: node test-rpc-function.js

import { createClient } from '@supabase/supabase-js'

// Use production Supabase instance
// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRPCFunction() {
  // First, let's get a real tower ID from the database
  console.log('Getting tower IDs from production database...')
  
  const { data: towers, error: towersError } = await supabase
    .from('towers')
    .select('id, name')
    .limit(1)
  
  if (towersError) {
    console.error('Error fetching towers:', towersError.message)
    console.log('Make sure you have set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
    return
  }
  
  if (!towers || towers.length === 0) {
    console.log('No towers found in database. Please create a tower first.')
    return
  }
  
  const testTowerId = towers[0].id
  console.log(`Testing with tower: ${towers[0].name} (${testTowerId})`)
  
  console.log('Testing RPC function calls...')
  
  // Test 1: Simple function
  try {
    const { data: simpleData, error: simpleError } = await supabase
      .rpc('test_simple')
    
    console.log('Simple function test:', simpleError ? `Error: ${simpleError.message}` : `Success: ${simpleData}`)
  } catch (err) {
    console.log('Simple function exception:', err.message)
  }
  
  // Test 2: Positional parameter
  try {
    const { data: posData, error: posError } = await supabase
      .rpc('get_tower_resources', testTowerId)
    
    console.log('Positional parameter test:', posError ? `Error: ${posError.message}` : 'Success: Data received')
  } catch (err) {
    console.log('Positional parameter exception:', err.message)
  }
  
  // Test 3: Named parameter
  try {
    const { data: namedData, error: namedError } = await supabase
      .rpc('get_tower_resources', { p_tower_id: testTowerId })
    
    console.log('Named parameter test:', namedError ? `Error: ${namedError.message}` : 'Success: Data received')
  } catch (err) {
    console.log('Named parameter exception:', err.message)
  }
  
  // Test 4: View approach
  try {
    const { data: viewData, error: viewError } = await supabase
      .from('v_tower_resources')
      .select('resources')
      .eq('tower_id', testTowerId)
      .single()
    
    console.log('View approach test:', viewError ? `Error: ${viewError.message}` : 'Success: Data received')
  } catch (err) {
    console.log('View approach exception:', err.message)
  }
}

testRPCFunction().catch(console.error)
