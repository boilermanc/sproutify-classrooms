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

Deno.serve(async (req) => {
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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        const userId = session.metadata?.supabase_user_id
        if (!userId) {
          console.error('No supabase_user_id in session metadata')
          break
        }

        // Update user profile with subscription info
        await updateUserSubscription(userId, session)
        
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

  const plan = subscription?.items.data[0]?.price.lookup_key || 
              subscription?.items.data[0]?.price.nickname || 
              'basic'

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_plan: plan,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription?.id || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }

  console.log('Successfully updated user subscription for:', userId)
}

async function updateUserSubscriptionFromSubscription(userId: string, subscription: Stripe.Subscription) {
  const plan = subscription.items.data[0]?.price.lookup_key || 
              subscription.items.data[0]?.price.nickname || 
              'basic'

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      subscription_plan: plan,
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }

  console.log('Successfully updated user subscription for:', userId)
}

async function logSubscriptionEvent(userId: string, eventType: string, objectId: string, data: any) {
  const { error } = await supabase
    .from('subscription_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      stripe_object_id: objectId,
      event_data: data,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error logging subscription event:', error)
    // Don't throw here - logging failure shouldn't stop webhook processing
  }
}