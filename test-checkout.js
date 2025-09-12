#!/usr/bin/env node

// Simple test script for the checkout function
// Run with: node test-checkout.js

const BASE_URL = 'https://your-project.supabase.co/functions/v1'; // Replace with your actual Supabase URL

const testCases = [
  // Test 1: Direct price ID
  {
    name: "Direct Price ID",
    body: { priceId: "price_1S41WnKHJbtiKAzVkLuDmvEu" },
    expectedPriceId: "price_1S41WnKHJbtiKAzVkLuDmvEu"
  },
  
  // Test 2: Plan mapping
  {
    name: "Plan Mapping - Basic Monthly",
    body: { plan: "basic_monthly" },
    expectedPriceId: "price_1S41WnKHJbtiKAzVkLuDmvEu"
  },
  
  // Test 3: Simple plan names
  {
    name: "Simple Plan Name - Monthly",
    body: { plan: "monthly" },
    expectedPriceId: "price_1S41WnKHJbtiKAzVkLuDmvEu"
  },
  
  // Test 4: Professional plan
  {
    name: "Professional Annual",
    body: { plan: "professional_annual" },
    expectedPriceId: "price_1S5Z3jKHJbtiKAzV5WdGZMMA"
  },
  
  // Test 5: Invalid plan
  {
    name: "Invalid Plan",
    body: { plan: "invalid_plan" },
    expectedPriceId: null,
    shouldError: true
  },
  
  // Test 6: Invalid price ID
  {
    name: "Invalid Price ID",
    body: { priceId: "price_invalid123" },
    expectedPriceId: "price_invalid123",
    shouldError: true
  },
  
  // Test 7: Empty request
  {
    name: "Empty Request",
    body: {},
    expectedPriceId: null,
    shouldError: true
  }
];

async function testDebugEndpoint(testCase) {
  try {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📤 Request:`, JSON.stringify(testCase.body, null, 2));
    
    const response = await fetch(`${BASE_URL}/debug-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.body)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Debug Response:`, JSON.stringify(data.debug, null, 2));
      
      // Check if the result matches expectations
      const actualPriceId = data.debug.finalPriceId;
      const isValid = data.debug.isValidPriceId;
      const isAllowed = data.debug.isAllowedPriceId;
      
      if (testCase.shouldError) {
        if (!isValid || !isAllowed) {
          console.log(`✅ Expected error condition met: Invalid=${!isValid}, NotAllowed=${!isAllowed}`);
        } else {
          console.log(`❌ Expected error but got valid result`);
        }
      } else {
        if (actualPriceId === testCase.expectedPriceId && isValid && isAllowed) {
          console.log(`✅ Test passed: Got expected price ID ${actualPriceId}`);
        } else {
          console.log(`❌ Test failed: Expected ${testCase.expectedPriceId}, got ${actualPriceId}`);
        }
      }
    } else {
      console.log(`❌ Debug request failed:`, data);
    }
  } catch (error) {
    console.log(`❌ Debug test error:`, error.message);
  }
}

async function testCheckoutEndpoint(testCase) {
  try {
    console.log(`\n🛒 Testing Checkout: ${testCase.name}`);
    
    const response = await fetch(`${BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.body)
    });
    
    const data = await response.json();
    
    if (testCase.shouldError) {
      if (!response.ok) {
        console.log(`✅ Expected error received:`, data.error);
      } else {
        console.log(`❌ Expected error but got success:`, data);
      }
    } else {
      if (response.ok && data.url) {
        console.log(`✅ Checkout session created successfully`);
        console.log(`🔗 Checkout URL: ${data.url}`);
      } else {
        console.log(`❌ Checkout failed:`, data);
      }
    }
  } catch (error) {
    console.log(`❌ Checkout test error:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Checkout Function Tests');
  console.log('=' .repeat(50));
  
  // Test debug endpoint first
  console.log('\n📊 Testing Debug Endpoint...');
  for (const testCase of testCases) {
    await testDebugEndpoint(testCase);
  }
  
  // Test actual checkout endpoint (only for valid cases)
  console.log('\n🛒 Testing Checkout Endpoint...');
  for (const testCase of testCases.filter(tc => !tc.shouldError)) {
    await testCheckoutEndpoint(testCase);
  }
  
  console.log('\n✨ Tests completed!');
}

// Run the tests
runTests().catch(console.error);
