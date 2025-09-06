import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { 
      priceId, 
      userId, 
      trialPeriodDays = 7, 
      promoCode 
    } = req.body;

    if (!priceId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create or get customer
    const customers = await stripe.customers.list({
      limit: 1,
      metadata: { userId }
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        metadata: { userId }
      });
    }

    // Build session config
    const sessionConfig: any = {
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: trialPeriodDays,
        metadata: { 
          userId,
          originalPromoCode: promoCode || 'none' 
        }
      },
      success_url: `${process.env.VITE_APP_URL}/app?subscription=success`,
      cancel_url: `${process.env.VITE_APP_URL}/pricing?subscription=canceled`,
      allow_promotion_codes: true,
      metadata: {
        userId,
        promoCode: promoCode || 'none'
      }
    };

    // Try to apply promo code automatically
    if (promoCode) {
      try {
        const promotionCodes = await stripe.promotionCodes.list({
          code: promoCode,
          active: true,
          limit: 1
        });

        if (promotionCodes.data.length > 0) {
          sessionConfig.discounts = [{
            promotion_code: promotionCodes.data[0].id
          }];
        }
      } catch (promoError) {
        console.warn('Promo code validation failed:', promoError);
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
}