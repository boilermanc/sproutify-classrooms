// src/pages/pricing/PricingPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    name: 'Basic',
    price: '$9.99',
    period: 'month',
    priceId: 'price_basic_monthly', // Replace with your actual Stripe Price ID
    features: [
      'Up to 3 aeroponic towers',
      'Basic vitals tracking',
      'Student photo uploads',
      'Harvest & waste logging',
      'Email support'
    ]
  },
  {
    name: 'Pro',
    price: '$19.99',
    period: 'month',
    priceId: 'price_pro_monthly', // Replace with your actual Stripe Price ID
    features: [
      'Unlimited aeroponic towers',
      'Advanced analytics',
      'Multiple classrooms',
      'Custom plant catalog',
      'Pest management tracking',
      'Priority support'
    ],
    popular: true
  },
  {
    name: 'School',
    price: '$49.99',
    period: 'month',
    priceId: 'price_school_monthly', // Replace with your actual Stripe Price ID
    features: [
      'Everything in Pro',
      'Multi-teacher accounts',
      'School-wide reporting',
      'Admin dashboard',
      'Dedicated support',
      'Custom integrations'
    ]
  }
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      setLoading(priceId);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Please sign in",
          description: "You need to sign in before subscribing.",
          variant: "destructive"
        });
        navigate('/auth/login');
        return;
      }

      // Call the Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          priceId,
          customer_email: session.user.email || undefined,
          userId: session.user.id,
          billingPeriod: "monthly", // Default to monthly for this page
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing | Sproutify School"
        description="Choose the perfect plan for your classroom aeroponic garden management."
        canonical="/pricing"
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your classroom aeroponic garden. 
            Start growing with your students today!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  disabled={loading !== null}
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {loading === plan.priceId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}