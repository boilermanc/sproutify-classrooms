import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Zap, Loader2, ArrowLeft, CreditCard, FileText, Shield, Users, ArrowRight, Info } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { SUBSCRIPTION_PLANS, getPriceId } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { formatPlanName } from "@/lib/utils";
import { DISTRICT_PRICING } from "@/config/pricing";

interface UserSubscription {
  subscription_status: string | null;
  subscription_plan: string | null;
  trial_ends_at: string | null;
}

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [schoolDistrictTab, setSchoolDistrictTab] = useState<"school" | "district">("school");
  
  // Tower-based pricing state
  const [towers, setTowers] = useState(1);
  const basePrice = 10; // $10 base cost
  const towerPrice = 100; // $100 per tower
  
  // Promo code state
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null);

  // Calculate pricing
  const monthlyTotal = basePrice + (towers * towerPrice);
  const annualTotal = monthlyTotal * 12;
  const annualSavings = annualTotal * 0.20; // 20% discount

  const handleTowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setTowers(Math.max(1, Math.min(1000, value)));
  };

  // Check for promo code in URL
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      handleCodeApplied(urlCode, 'Special discount applied');
    }
  }, [searchParams]);

  // Check user authentication and subscription status
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setIsLoggedIn(true);
          
          // Fetch user's current subscription status
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('subscription_status, subscription_plan, trial_ends_at')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching user subscription:', error);
          } else {
            setUserSubscription(profile);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUserStatus();
  }, []);


  const handleCodeApplied = (code: string, discount: string) => {
    setAppliedCode(code);
    setAppliedDiscount(discount);
    toast({
      title: "Promo code applied!",
      description: `${code}: ${discount}`,
    });
  };

  const handleCodeRemoved = () => {
    setAppliedCode(null);
    setAppliedDiscount(null);
    toast({
      title: "Promo code removed",
      description: "Regular pricing will apply",
    });
  };

  // Simplified function to use Supabase Edge Function
  const createCheckoutSession = async (priceId: string, userEmail?: string, userId?: string) => {
    try {
      const totalPrice = billingPeriod === 'annual' ? 
        Math.round((annualTotal - annualSavings) * 100) : // Convert to cents
        Math.round(monthlyTotal * 100);
      
      console.log('Creating checkout session with:', { 
        priceId, 
        userEmail, 
        userId, 
        billingPeriod, 
        towers, 
        totalPrice 
      });
      
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          priceId,
          customer_email: userEmail || undefined,
          userId: userId || undefined,
          billingPeriod: billingPeriod,
          towers: towers,
          totalPrice: totalPrice,
          basePrice: basePrice,
          towerPrice: towerPrice,
        },
      });

      if (error) {
        console.error("Checkout create failed:", error);
        throw new Error(`Checkout failed: ${error.message || 'Unknown error'}`);
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      console.log('Checkout URL received:', data.url);
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const handlePlanAction = async (planId: string) => {
    setLoading(planId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Not logged in - redirect to registration
        const params = new URLSearchParams({ 
          plan: planId,
          billing: billingPeriod,
          towers: towers.toString()
        });
        if (appliedCode) {
          params.append('code', appliedCode);
        }
        navigate(`/auth/register?${params.toString()}`);
        return;
      }

      // User is logged in - create checkout session for upgrade/subscription
      // Use the professional plan as the base and calculate pricing dynamically based on towers
      const priceId = getPriceId('professional' as keyof typeof SUBSCRIPTION_PLANS, billingPeriod, false);
      await createCheckoutSession(priceId, session.user.email, session.user.id);
      
    } catch (error: any) {
      console.error('Error processing plan action:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };


  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading pricing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
          <p className="text-gray-600">Select the subscription plan that best fits your farm's needs</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Free Trial Info */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-6 mb-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500 rounded-full p-2">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Free Trial Active</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                You're currently on your 7-day free trial. Choose a plan to continue after your trial ends.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Full access to all features during trial</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">No payment required until you choose a plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Cancel anytime after subscribing</span>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">What's Included</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Unlimited Harvests</p>
                    <p className="text-xs text-gray-500">Track unlimited harvest cycles</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Premium Support</p>
                    <p className="text-xs text-gray-500">Priority customer support</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Analytics Dashboard</p>
                    <p className="text-xs text-gray-500">Advanced insights and reporting</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Center Column - Pricing Calculator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border-2 border-green-500 shadow-lg">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-lg">
                <h2 className="text-lg font-bold">Sproutify Farm - Core</h2>
                <p className="text-sm opacity-90">Flexible tower scaling for growing operations</p>
              </div>
              
              <div className="p-6">
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      billingPeriod === 'monthly' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('annual')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                      billingPeriod === 'annual' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Annual
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      Save 20%
                    </span>
                  </button>
                </div>

                {/* Tower Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Towers
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={towers}
                      onChange={handleTowerChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-lg font-medium"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-sm text-gray-500">Min: 1, Max: 1,000</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base cost:</span>
                      <span className="font-medium">${basePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{towers} tower{towers !== 1 ? 's' : ''} × ${towerPrice}:</span>
                      <span className="font-medium">${towers * towerPrice}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Monthly total:</span>
                        <span className="font-bold text-lg text-gray-900">${monthlyTotal}</span>
                      </div>
                    </div>
                    {billingPeriod === 'annual' && (
                      <>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Annual total:</span>
                            <span className="line-through text-gray-400">${annualTotal}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600 font-medium">With 20% discount:</span>
                            <span className="font-bold text-green-600">${(annualTotal - annualSavings).toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-green-600">You save:</span>
                            <span className="text-green-600 font-medium">${annualSavings.toFixed(0)}/year</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <button 
                  onClick={() => handlePlanAction('core')}
                  disabled={loading !== null}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Continue to Secure Payment (Stripe)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-start gap-2 mt-4">
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">
                    You'll be redirected to Stripe's secure checkout. Your subscription will start after your free trial ends.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Flexible Scaling:</strong> You can adjust your tower count anytime. Changes take effect at the next billing cycle.
                  </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>No Hidden Fees:</strong> Simple, transparent pricing. Just a base platform fee plus your tower costs.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Cancel Anytime:</strong> No long-term contracts. Cancel your subscription whenever you need.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-gray-900 text-white rounded-xl p-4 mt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="font-semibold">Secure Checkout</span>
              </div>
              <p className="text-xs opacity-80">
                Powered by Stripe • PCI Compliant • SSL Encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;