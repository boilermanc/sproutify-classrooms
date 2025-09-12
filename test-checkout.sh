# Test Script for Simplified Checkout Function
# Replace YOUR_PROJECT_URL with your actual Supabase project URL

PROJECT_URL="https://your-project.supabase.co/functions/v1"

echo "🧪 Testing Simplified Checkout Function"
echo "========================================"

# Test 1: Direct Price ID
echo -e "\n1️⃣ Testing Direct Price ID..."
curl -X POST "$PROJECT_URL/debug-checkout" \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_1S41WnKHJbtiKAzVkLuDmvEu"}' \
  | jq '.'

# Test 2: Plan Mapping
echo -e "\n2️⃣ Testing Plan Mapping (basic_monthly)..."
curl -X POST "$PROJECT_URL/debug-checkout" \
  -H "Content-Type: application/json" \
  -d '{"plan": "basic_monthly"}' \
  | jq '.'

# Test 3: Simple Plan Name
echo -e "\n3️⃣ Testing Simple Plan Name (monthly)..."
curl -X POST "$PROJECT_URL/debug-checkout" \
  -H "Content-Type: application/json" \
  -d '{"plan": "monthly"}' \
  | jq '.'

# Test 4: Professional Plan
echo -e "\n4️⃣ Testing Professional Annual..."
curl -X POST "$PROJECT_URL/debug-checkout" \
  -H "Content-Type: application/json" \
  -d '{"plan": "professional_annual"}' \
  | jq '.'

# Test 5: Invalid Plan (should error)
echo -e "\n5️⃣ Testing Invalid Plan (should error)..."
curl -X POST "$PROJECT_URL/debug-checkout" \
  -H "Content-Type: application/json" \
  -d '{"plan": "invalid_plan"}' \
  | jq '.'

# Test 6: Empty Request (should error)
echo -e "\n6️⃣ Testing Empty Request (should error)..."
curl -X POST "$PROJECT_URL/debug-checkout" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq '.'

echo -e "\n✅ Debug tests completed!"
echo -e "\n🛒 Now testing actual checkout (valid cases only)..."

# Test actual checkout with valid price ID
echo -e "\n7️⃣ Testing Actual Checkout with Valid Price ID..."
curl -X POST "$PROJECT_URL/create-checkout-session" \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_1S41WnKHJbtiKAzVkLuDmvEu", "customer_email": "test@example.com"}' \
  | jq '.'

echo -e "\n✨ All tests completed!"
