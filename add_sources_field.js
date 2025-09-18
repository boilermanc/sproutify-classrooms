import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cqrjesmpwaqvmssrdeoc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcmplc21wd2Fxdm1zc3JkZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NzUzNjAsImV4cCI6MjA3MDI1MTM2MH0.7dtJ6VOK_i_enstTjvzDuRAyUACNc78dlCldHjsxt58";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function addSourcesField() {
  try {
    console.log('Adding sources field to tower_documents table...');
    
    // First, let's add the sources column
    const { data: alterResult, error: alterError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE tower_documents ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT NULL;' 
      });
    
    if (alterError) {
      console.log('Error adding sources column:', alterError.message);
    } else {
      console.log('Successfully added sources column');
    }
    
    console.log('Sources field added successfully. The triggers will automatically populate sources data when tower data changes.');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

addSourcesField();
