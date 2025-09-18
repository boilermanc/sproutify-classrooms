// test-ai-function.js
// Simple test script for the AI function

const SUPABASE_URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testAIFunction() {
  console.log('Testing AI Chat Function...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        message: "Hello! Can you help me understand hydroponic growing?",
        towerId: "test-tower-id",
        studentName: "Test Student",
        selectedSources: [],
        gradeLevel: "3-5"
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ AI Function Test Successful!');
      console.log('Response:', data.response);
      console.log('Sources Used:', data.context?.sourcesUsed);
    } else {
      console.log('❌ AI Function Test Failed');
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

// Run the test
testAIFunction();
