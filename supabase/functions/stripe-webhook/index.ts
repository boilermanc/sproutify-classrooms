// supabase/functions/stripe-webhook/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const cryptoProvider = Stripe.createSubtleCryptoProvider()

// Dynamic price mapping from environment variable or database
let PLAN_PRICE_MAP: Record<string, string> = {};

// Load price mappings from environment variable or database
async function loadPriceMappings(): Promise<void> {
  try {
    // Try to load from environment variable first
    const mappingsEnv = Deno.env.get('STRIPE_PRICE_MAPPINGS');
    if (mappingsEnv) {
      try {
        PLAN_PRICE_MAP = JSON.parse(mappingsEnv);
        console.log('Loaded price mappings from environment variable');
        return;
      } catch (parseError) {
        console.error('Failed to parse STRIPE_PRICE_MAPPINGS:', parseError);
        console.error('Invalid JSON string:', mappingsEnv);
        // Fall through to database fallback
      }
    }
    
    // Fallback to database table
    const { data: mappings, error } = await supabase
      .from('stripe_price_mappings')
      .select('stripe_price_id, plan_name');
    
    if (error) {
      console.warn('Failed to load price mappings from database:', error);
      // Use hardcoded fallback
      PLAN_PRICE_MAP = getDefaultPriceMappings();
    } else if (mappings && mappings.length > 0) {
      PLAN_PRICE_MAP = mappings.reduce((acc, mapping) => {
        acc[mapping.stripe_price_id] = mapping.plan_name;
        return acc;
      }, {} as Record<string, string>);
      console.log('Loaded price mappings from database');
    } else {
      // Use hardcoded fallback
      PLAN_PRICE_MAP = getDefaultPriceMappings();
    }
  } catch (error) {
    console.warn('Error loading price mappings:', error);
    PLAN_PRICE_MAP = getDefaultPriceMappings();
  }
}

// Default fallback mappings
function getDefaultPriceMappings(): Record<string, string> {
  return {
    // Basic Plan
    'price_1S41WnKHJbtiKAzVkLuDmvEu': 'basic_monthly',
    'price_1S3NYCKHJbtiKAzVJBUoKWXX': 'basic_monthly_promo',
    'price_1S5Yz6KHJbtiKAzVQ9wFOeCK': 'basic_annual',
    
    // Professional Plan
    'price_1S41c2KHJbtiKAzV8crsVNX1': 'professional_monthly',
    'price_1S41eGKHJbtiKAzV2c95F8ge': 'professional_monthly_promo',
    'price_1S5Z3jKHJbtiKAzV5WdGZMMA': 'professional_annual',
    
    // School Plan
    'price_1S41gQKHJbtiKAzV6qJdJIjN': 'school_monthly',
    'price_1S41hDKHJbtiKAzVW0n8QUPU': 'school_monthly_promo',
    'price_1S5YwKKHJbtiKAzVFDODzk5a': 'school_annual',
    
    // District Plan
    'price_1S5YfqKHJbtiKAzV847eglJR': 'district_monthly',
    'price_1S5YhOKHJbtiKAzVh21kiE2m': 'district_monthly_promo',
    'price_1S5YhyKHJbtiKAzV2pATTPJp': 'district_annual',
  };
}

// Map price IDs to plan names
function getPlanFromPriceId(priceId?: string): string {
  if (!priceId) return 'basic'
  
  const plan = PLAN_PRICE_MAP[priceId]
  if (plan) {
    console.log('Mapped price ID:', priceId, 'to plan:', plan)
    return plan
  }
  
  console.log('Unknown price ID:', priceId)
  return 'basic'
}

// Helper function to extract plan type and billing period from plan string
function parsePlanInfo(planString: string): { planType: string; billingPeriod: 'monthly' | 'annual' } {
  if (planString.includes('_annual')) {
    return {
      planType: planString.replace('_annual', ''),
      billingPeriod: 'annual'
    }
  } else if (planString.includes('_monthly')) {
    return {
      planType: planString.replace('_monthly', '').replace('_promo', ''),
      billingPeriod: 'monthly'
    }
  }
  
  // Default fallback
  return {
    planType: planString,
    billingPeriod: 'monthly'
  }
}

// Helper function to send purchase webhook with timeout
async function sendPurchaseWebhook(userId: string, planString: string, subscriptionEndsAt: string, amount?: number) {
  const timeoutMs = parseInt(Deno.env.get('WEBHOOK_TIMEOUT_MS') || '5000');
  const maxRetries = parseInt(Deno.env.get('WEBHOOK_MAX_RETRIES') || '3');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name, school_name')
        .eq('id', userId)
        .single()

      if (profileError || !profileData) {
        console.error('Error fetching user profile for webhook:', profileError)
        return
      }

      const { planType, billingPeriod } = parsePlanInfo(planString)

      const webhookData = {
        id: userId,
        email: profileData.email,
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        schoolName: profileData.school_name || '',
        plan: planType as 'basic' | 'professional' | 'school' | 'district',
        billingPeriod,
        subscriptionEndsAt,
        amount,
        currency: 'usd'
      }

      // Send webhook to n8n
      const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL')
      if (!webhookUrl) {
        console.error('N8N_WEBHOOK_URL not configured')
        return
      }

      const payload = {
        event: 'purchase_completed',
        email: webhookData.email,
        firstName: webhookData.firstName,
        lastName: webhookData.lastName,
        schoolName: webhookData.schoolName,
        plan: webhookData.plan,
        billingPeriod: webhookData.billingPeriod,
        subscriptionEndsAt: webhookData.subscriptionEndsAt,
        amount: webhookData.amount,
        currency: webhookData.currency,
        mailerliteGroup: getMailerLiteGroup(webhookData.plan, 'active'),
        timestamp: new Date().toISOString(),
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log('Purchase webhook sent successfully for:', webhookData.email);
          return; // Success, exit retry loop
        } else {
          // Try to read error response body
          let errorBody = '';
          try {
            errorBody = await response.text();
          } catch (e) {
            errorBody = 'Could not read error response';
          }
          console.error('Purchase webhook failed:', response.status, response.statusText, errorBody);
          
          if (attempt === maxRetries) {
            console.error('Max retries reached for webhook');
            return;
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          console.error('Webhook request timed out after', timeoutMs, 'ms');
        } else {
          console.error('Network error sending webhook:', error);
        }
        
        if (attempt === maxRetries) {
          console.error('Max retries reached for webhook');
          return;
        }
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log('Retrying webhook in', delay, 'ms (attempt', attempt + 1, 'of', maxRetries, ')');
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      console.error('Error sending purchase webhook (attempt', attempt, '):', error);
      if (attempt === maxRetries) {
        console.error('Max retries reached for webhook');
        return;
      }
    }
  }
}

// Helper function to get MailerLite group (simplified version for Deno)
function getMailerLiteGroup(plan: string, status: string): string {
  // This is a simplified version - you may want to expand this logic
  if (status === 'active') {
    switch (plan) {
      case 'basic': return 'Individual_Teacher_Basic'
      case 'professional': return 'Individual_Teacher_Professional'
      case 'school': return 'School_Plan'
      case 'district': return 'District_Plan'
      default: return 'Individual_Teacher_Basic'
    }
  }
  return 'Individual_Teacher_Trial'
}

Deno.serve(async (req) => {
  // Initialize price mappings on first request
  if (Object.keys(PLAN_PRICE_MAP).length === 0) {
    await loadPriceMappings();
  }
  
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  console.log(`Received event: ${event.type}`)
  console.log('Event data:', JSON.stringify(event.data.object, null, 2))

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        console.log('Session metadata:', session.metadata)
        console.log('Session customer:', session.customer)
        console.log('Session subscription:', session.subscription)
        
        const userId = session.metadata?.supabase_user_id
        if (!userId) {
          console.error('No supabase_user_id in session metadata')
          console.error('Available metadata keys:', Object.keys(session.metadata || {}))
          break
        }

        console.log('Found userId in metadata:', userId)

        // Update user profile with subscription info
        await updateUserSubscription(userId, session)
        
        // Send purchase webhook
        const subscription = session.subscription 
          ? await stripe.subscriptions.retrieve(session.subscription as string)
          : null
        
        if (subscription) {
          const planString = getPlanFromPriceId(subscription.items.data[0]?.price.id)
          const subscriptionEndsAt = subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date().toISOString()
          
          await sendPurchaseWebhook(userId, planString, subscriptionEndsAt)
        }
        
        // Log the event
        await logSubscriptionEvent(userId, event.type, session.id, session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`Subscription ${event.type}:`, subscription.id)
        
        // Get customer to find user ID
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        if ('deleted' in customer) {
          console.error('Customer was deleted')
          break
        }
        
        const userId = customer.metadata?.supabase_user_id
        if (!userId) {
          console.error('No supabase_user_id in customer metadata')
          break
        }

        await updateUserSubscriptionFromSubscription(userId, subscription)
        await logSubscriptionEvent(userId, event.type, subscription.id, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription deleted:', subscription.id)
        
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        if ('deleted' in customer) {
          console.error('Customer was deleted')
          break
        }
        
        const userId = customer.metadata?.supabase_user_id
        if (!userId) {
          console.error('No supabase_user_id in customer metadata')
          break
        }

        // Cancel subscription in database
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        await logSubscriptionEvent(userId, event.type, subscription.id, subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice payment succeeded:', invoice.id)
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          
          if ('deleted' in customer) {
            console.error('Customer was deleted')
            break
          }
          
          const userId = customer.metadata?.supabase_user_id
          if (userId) {
            await updateUserSubscriptionFromSubscription(userId, subscription)
            
            // Send purchase webhook for recurring payments
            const planString = getPlanFromPriceId(subscription.items.data[0]?.price.id)
            const subscriptionEndsAt = subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : new Date().toISOString()
            
            await sendPurchaseWebhook(userId, planString, subscriptionEndsAt, invoice.amount_paid)
            
            await logSubscriptionEvent(userId, event.type, invoice.id, invoice)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice payment failed:', invoice.id)
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          
          if ('deleted' in customer) {
            console.error('Customer was deleted')
            break
          }
          
          const userId = customer.metadata?.supabase_user_id
          if (userId) {
            // Mark as past_due or unpaid
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId)

            await logSubscriptionEvent(userId, event.type, invoice.id, invoice)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function updateUserSubscription(userId: string, session: Stripe.Checkout.Session) {
  const subscription = session.subscription 
    ? await stripe.subscriptions.retrieve(session.subscription as string)
    : null

  // Get the price ID from the subscription
  const priceId = subscription?.items.data[0]?.price.id
  console.log('Price ID from subscription:', priceId)
  
  // Map price ID to plan name
  const plan = getPlanFromPriceId(priceId)
  console.log('Price ID:', priceId, 'Mapped plan:', plan)

  // Get user's school information to populate school_name
  const { data: profileData } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', userId)
    .single()

  let schoolName = null
  if (profileData?.school_id) {
    const { data: schoolData } = await supabase
      .from('schools')
      .select('name')
      .eq('id', profileData.school_id)
      .single()
    schoolName = schoolData?.name || null
  }

  // Update profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_plan: plan,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription?.id || null,
      subscription_ends_at: subscription?.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      trial_ends_at: null, // Clear trial since they're now subscribed
      school_name: schoolName,
      avatar_url: 'https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/avatars/3ed72cee-a334-4c41-ba1d-49437aa1144f/BCO.52a99b16-ea69-4a75-93cd-dbdd2eda7c65.png',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Error updating user subscription:', profileError)
    throw profileError
  }

  // Create purchase record
  if (subscription && priceId) {
    const planRes = await supabase.from('plans').select('id').eq('stripe_price_id', priceId).single();
    
    if (planRes.error || !planRes.data) {
      console.error('Error fetching plan ID for price:', priceId, planRes.error);
      // Continue without creating purchase record rather than failing the webhook
    } else {
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          plan_id: planRes.data.id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          status: 'active',
          current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
          current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
          quantity: 1
        })

      if (purchaseError) {
        console.error('Error creating purchase record:', purchaseError)
        // Don't throw here - purchase record failure shouldn't stop webhook processing
      } else {
        console.log('Successfully created purchase record for:', userId)
      }
    }
  }

  console.log('Successfully updated user subscription for:', userId, 'with plan:', plan)
}

async function updateUserSubscriptionFromSubscription(userId: string, subscription: Stripe.Subscription) {
  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id
  console.log('Price ID from subscription:', priceId)
  
  // Map price ID to plan name
  const plan = getPlanFromPriceId(priceId)
  console.log('Price ID:', priceId, 'Mapped plan:', plan)

  // Get user's school information to populate school_name
  const { data: profileData } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', userId)
    .single()

  let schoolName = null
  if (profileData?.school_id) {
    const { data: schoolData } = await supabase
      .from('schools')
      .select('name')
      .eq('id', profileData.school_id)
      .single()
    schoolName = schoolData?.name || null
  }

  // Update profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      subscription_plan: plan,
      stripe_subscription_id: subscription.id,
      subscription_ends_at: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      trial_ends_at: subscription.status === 'active' ? null : undefined, // Clear trial if active
      school_name: schoolName,
      avatar_url: 'https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/avatars/3ed72cee-a334-4c41-ba1d-49437aa1144f/BCO.52a99b16-ea69-4a75-93cd-dbdd2eda7c65.png',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Error updating user subscription:', profileError)
    throw profileError
  }

  // Create or update purchase record for active subscriptions
  if (subscription.status === 'active' && priceId) {
    const planRes = await supabase.from('plans').select('id').eq('stripe_price_id', priceId).single();
    
    if (planRes.error || !planRes.data) {
      console.error('Error fetching plan ID for price:', priceId, planRes.error);
      // Continue without creating purchase record rather than failing the webhook
    } else {
      const { error: purchaseError } = await supabase
        .from('purchases')
        .upsert({
          user_id: userId,
          plan_id: planRes.data.id,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
          current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
          quantity: 1
        }, {
          onConflict: 'stripe_subscription_id'
        })

      if (purchaseError) {
        console.error('Error creating/updating purchase record:', purchaseError)
        // Don't throw here - purchase record failure shouldn't stop webhook processing
      } else {
        console.log('Successfully created/updated purchase record for:', userId)
      }
    }
  }

  console.log('Successfully updated user subscription for:', userId, 'with plan:', plan)
}

async function logSubscriptionEvent(userId: string, eventType: string, objectId: string, data: any) {
  const { error } = await supabase
    .from('subscription_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      stripe_event_id: objectId,
      data: data
    })

  if (error) {
    console.error('Error logging subscription event:', error)
    // Don't throw here - logging failure shouldn't stop webhook processing
  } else {
    console.log('Successfully logged subscription event:', eventType, 'for user:', userId)
  }
}