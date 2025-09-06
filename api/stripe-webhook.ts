import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Received webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout completed:', session.id);
  
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Determine plan based on price ID
    const planType = getPlanFromPriceId(subscription.items.data[0].price.id);
    
    // Update user profile with subscription info
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: planType,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_ends_at: null, // Clear trial since they're now subscribed
      })
      .eq('id', userId);

    if (error) {
      console.error('Database update error:', error);
    } else {
      console.log('Successfully updated user subscription');
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription created:', subscription.id);
  
  const customerId = subscription.customer as string;
  const planType = getPlanFromPriceId(subscription.items.data[0].price.id);
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        subscription_plan: planType,
        stripe_subscription_id: subscription.id,
        subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Database update error:', error);
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  const customerId = subscription.customer as string;
  const planType = getPlanFromPriceId(subscription.items.data[0].price.id);
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        subscription_plan: planType,
        subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Database update error:', error);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id);
  
  const customerId = subscription.customer as string;
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        subscription_ends_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Database update error:', error);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing payment succeeded:', invoice.id);
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const customerId = subscription.customer as string;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Database update error:', error);
      }
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing payment failed:', invoice.id);
  
  if (invoice.subscription) {
    const customerId = invoice.customer as string;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'past_due',
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Database update error:', error);
      }
    } catch (error) {
      console.error('Error handling payment failed:', error);
    }
  }
}

// Helper function to determine plan type from Stripe price ID
function getPlanFromPriceId(priceId: string): string {
  // Your price IDs from lib/stripe.ts
  const priceIdMap: Record<string, string> = {
    'price_1S41WnKHJbtiKAzVkLuDmvEu': 'basic',     // Basic regular
    'price_1S3NYCKHJbtiKAzVJBUoKWXX': 'basic',     // Basic promotional
    'price_1S41c2KHJbtiKAzV8crsVNX1': 'professional', // Professional regular
    'price_1S41eGKHJbtiKAzV2c95F8ge': 'professional', // Professional promotional
    'price_1S41gQKHJbtiKAzV6qJdJIjN': 'school',    // School regular
    'price_1S41hDKHJbtiKAzVW0n8QUPU': 'school',    // School promotional
  };
  
  return priceIdMap[priceId] || 'basic';
}

// Important: This disables body parsing so we can access raw body for webhook verification
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};