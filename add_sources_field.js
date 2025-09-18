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
    
    // Now let's test the function by manually populating sources for the test tower
    const towerId = 'c3f93934-d583-497a-8d18-3e68ab6460fa';
    
    console.log('Testing sources population for tower:', towerId);
    
    // Get all the data for this tower
    const [plantingsResult, vitalsResult, harvestsResult, wasteResult, pestsResult, photosResult] = await Promise.all([
      supabase.from('plantings').select('*').eq('tower_id', towerId),
      supabase.from('tower_vitals').select('*').eq('tower_id', towerId),
      supabase.from('harvests').select('*').eq('tower_id', towerId),
      supabase.from('waste').select('*').eq('tower_id', towerId),
      supabase.from('pest_logs').select('*').eq('tower_id', towerId),
      supabase.from('tower_photos').select('*').eq('tower_id', towerId)
    ]);
    
    // Build sources array
    const sources = [];
    
    // Add plantings
    if (plantingsResult.data) {
      plantingsResult.data.forEach(planting => {
        sources.push({
          id: `plant-${planting.id}`,
          type: 'plant',
          title: planting.name,
          date: new Date(planting.created_at).toLocaleDateString(),
          description: planting.port_number ? `Port ${planting.port_number}` : undefined
        });
      });
    }
    
    // Add vitals
    if (vitalsResult.data) {
      vitalsResult.data.forEach(vital => {
        sources.push({
          id: `vital-${vital.id}`,
          type: 'vitals',
          title: 'pH & EC Reading',
          date: new Date(vital.created_at).toLocaleDateString(),
          description: `pH: ${vital.ph}, EC: ${vital.ec}`
        });
      });
    }
    
    // Add harvests
    if (harvestsResult.data) {
      harvestsResult.data.forEach(harvest => {
        sources.push({
          id: `harvest-${harvest.id}`,
          type: 'harvest',
          title: `${harvest.plant_name || 'Plant'} Harvest`,
          date: new Date(harvest.created_at).toLocaleDateString(),
          description: `${harvest.weight_grams}g${harvest.destination ? ` → ${harvest.destination}` : ''}`
        });
      });
    }
    
    // Add waste
    if (wasteResult.data) {
      wasteResult.data.forEach(waste => {
        sources.push({
          id: `waste-${waste.id}`,
          type: 'waste',
          title: `${waste.plant_name || 'Plant'} Waste`,
          date: new Date(waste.created_at).toLocaleDateString(),
          description: `${waste.grams}g - ${waste.notes || 'No notes'}`
        });
      });
    }
    
    // Add pests
    if (pestsResult.data) {
      pestsResult.data.forEach(pest => {
        sources.push({
          id: `pest-${pest.id}`,
          type: 'pest',
          title: 'Pest Observation',
          date: new Date(pest.created_at).toLocaleDateString(),
          description: pest.pest.substring(0, 50) + (pest.pest.length > 50 ? '...' : '')
        });
      });
    }
    
    // Add photos
    if (photosResult.data) {
      photosResult.data.forEach(photo => {
        sources.push({
          id: `photo-${photo.id}`,
          type: 'photo',
          title: 'Tower Photo',
          date: new Date(photo.created_at).toLocaleDateString(),
          description: photo.caption || 'No description'
        });
      });
    }
    
    // Sort by date (newest first)
    sources.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    console.log('Generated sources:', sources);
    
    // Now let's create a tower_documents record with the sources data
    const { data: insertResult, error: insertError } = await supabase
      .from('tower_documents')
      .insert({
        tower_id: towerId,
        teacher_id: '2df3c560-ff6e-4807-b54a-ea2ff7f2b08d',
        title: 'Tower Sources Data',
        description: 'Automatically generated sources data',
        file_name: 'sources.json',
        file_path: 'sources/sources.json',
        file_url: 'data:sources',
        file_size: JSON.stringify(sources).length,
        file_type: 'application/json',
        sources: sources
      })
      .select();
    
    if (insertError) {
      console.log('Error inserting sources data:', insertError.message);
    } else {
      console.log('Successfully inserted sources data:', insertResult[0]);
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

addSourcesField();
