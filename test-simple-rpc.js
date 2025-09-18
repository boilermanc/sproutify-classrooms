// Simple test script to verify RPC functions work with PRODUCTION database
// Run this with: node test-simple-rpc.js

import { createClient } from '@supabase/supabase-js'

// Use production Supabase instance
// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSimpleRPC() {
  console.log('Testing simple RPC function...')
  
  try {
    const { data, error } = await supabase
      .rpc('test_simple')
    
    if (error) {
      console.error('❌ RPC call failed:', error.message)
      console.error('Full error:', error)
    } else {
      console.log('✅ RPC call succeeded!')
      console.log('Response:', data)
    }
  } catch (err) {
    console.error('❌ Exception occurred:', err.message)
  }
}

testSimpleRPC().catch(console.error)
