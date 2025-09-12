// Debug script to check subscription status
// Run this in your browser console on the home page

async function checkSubscriptionStatus() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ No user found');
      return;
    }
    
    console.log('👤 User ID:', user.id);
    
    // Get profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan, trial_ends_at, stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Error fetching profile:', profileError);
      return;
    }
    
    console.log('📊 Current Profile:');
    console.log('  subscription_status:', profile.subscription_status);
    console.log('  subscription_plan:', profile.subscription_plan);
    console.log('  trial_ends_at:', profile.trial_ends_at);
    console.log('  stripe_customer_id:', profile.stripe_customer_id);
    console.log('  stripe_subscription_id:', profile.stripe_subscription_id);
    
    // Check if webhook should have fired
    if (profile.stripe_customer_id && profile.subscription_status !== 'active') {
      console.log('⚠️  Webhook issue detected!');
      console.log('   - Customer ID exists but subscription_status is not "active"');
      console.log('   - This suggests the webhook may not have fired or failed');
    } else if (profile.subscription_status === 'active') {
      console.log('✅ Subscription is active - countdown should be hidden');
    } else {
      console.log('ℹ️  No subscription yet - countdown is expected');
    }
    
  } catch (error) {
    console.log('❌ Error:', error);
  }
}

// Run the check
checkSubscriptionStatus();
