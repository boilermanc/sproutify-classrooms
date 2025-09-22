import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Zap, Loader2, ArrowLeft, CreditCard, FileText } from "lucide-react";
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
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual"); // Default to annual
  const [schoolDistrictTab, setSchoolDistrictTab] = useState<"school" | "district">("school");
  
  // Promo code state
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null);

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

  // Updated plans with both monthly and annual pricing
  const plans = [
    {
      id: "basic",
      name: "Basic",
      monthlyPrice: 999, // $9.99 in cents
      annualPrice: 10788, // $107.88 in cents (10% off from $119.88)
      originalMonthlyPrice: 1999, // $19.99 original
      originalAnnualPrice: 11988, // $119.88 original
      description: "Perfect for individual teachers starting their hydroponic journey.",
      features: [
        "1 Tower Management",
        "Basic Vitals Tracking",
        "Plant Lifecycle Logging",
        "Up to 15 Students"
      ],
      featureLimits: {
        towers: 1,
        students: 15
      }
    },
    {
      id: "professional", 
      name: "Professional",
      monthlyPrice: 1999, // $19.99 in cents
      annualPrice: 21588, // $215.88 in cents (10% off from $239.88)
      originalMonthlyPrice: 3999, // $39.99 original
      originalAnnualPrice: 23988, // $239.88 original
      description: "Ideal for teachers managing multiple towers with advanced tracking.",
      popular: true,
      features: [
        "Up to 3 Towers",
        "Complete Vitals & History",
        "Harvest & Waste Logging",
        "Photo Gallery"
      ],
      featureLimits: {
        towers: 3,
        students: 999999 // unlimited
      }
    },
    {
      id: "school",
      name: "Accelerator", 
      monthlyPrice: 4999, // $49.99 in cents
      annualPrice: 108000, // $1,080 in cents
      originalMonthlyPrice: 9999, // $99.99 original
      originalAnnualPrice: 108000, // $1,080 original
      description: "Comprehensive solution for full classroom hydroponic programs.",
      features: [
        "Unlimited Towers",
        "Classroom Management",
        "Pest Management System",
        "Gamified Leaderboards"
      ],
      featureLimits: {
        towers: -1, // unlimited
        students: -1 // unlimited
      }
    }
  ];


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

  const getButtonText = (planId: string) => {
    if (!isLoggedIn) {
      if (planId === 'school' && schoolDistrictTab === 'district') {
        return 'Start District Trial';
      }
      return 'Start Free Trial';
    }

    if (userSubscription?.subscription_status === 'trial') {
      return 'Subscribe Now';
    }

    if (userSubscription?.subscription_status === 'active') {
      if (userSubscription.subscription_plan === planId) {
        return 'Current Plan';
      }
      return 'Change Plan';
    }

    return 'Subscribe Now';
  };

  const isCurrentPlan = (planId: string) => {
    return userSubscription?.subscription_plan === planId && 
           userSubscription?.subscription_status === 'active';
  };

  // Simplified function to use Supabase Edge Function
  const createCheckoutSession = async (priceId: string, userEmail?: string, userId?: string) => {
    try {
      console.log('Creating checkout session with:', { priceId, userEmail, userId, billingPeriod });
      
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          priceId,
          customer_email: userEmail || undefined,
          userId: userId || undefined,
          billingPeriod: billingPeriod,
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
    // Don't allow action on current plan
    if (isCurrentPlan(planId)) {
      return;
    }

    setLoading(planId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Not logged in - redirect to registration
        const params = new URLSearchParams({ 
          plan: planId,
          billing: billingPeriod
        });
        if (appliedCode) {
          params.append('code', appliedCode);
        }
        // Add district tab info for Accelerator plan
        if (planId === 'school' && schoolDistrictTab === 'district') {
          params.append('district', 'true');
        }
        navigate(`/auth/register?${params.toString()}`);
        return;
      }

      // User is logged in - create checkout session for upgrade/subscription
      const priceId = getPriceId(planId as keyof typeof SUBSCRIPTION_PLANS, billingPeriod, false);
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

  const calculateDiscountedPrice = (originalPrice: number, code: string) => {
    const discounts: Record<string, { type: 'percentage' | 'amount', value: number }> = {
      'EDUCATOR20': { type: 'percentage', value: 20 },
      'PILOT25': { type: 'percentage', value: 100 },
    };

    const discount = discounts[code];
    if (!discount) return originalPrice;

    if (discount.type === 'percentage') {
      return originalPrice * (1 - discount.value / 100);
    } else {
      return Math.max(0, originalPrice - discount.value);
    }
  };

  // Helper function to get current pricing for a plan
  const getCurrentPlanPricing = (plan: typeof plans[0]) => {
    const basePrice = billingPeriod === "annual" ? plan.annualPrice : plan.monthlyPrice;
    const originalPrice = billingPeriod === "annual" ? plan.originalAnnualPrice : plan.originalMonthlyPrice;
    const period = billingPeriod === "annual" ? "/year" : "/month";
    const savings = billingPeriod === "annual" ? "Save 10%" : "50% OFF";
    
    return {
      price: basePrice,
      originalPrice,
      period,
      savings,
      annualSavings: billingPeriod === "annual" ? (originalPrice - basePrice) / 100 : null
    };
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading pricing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* September Promotion Banner */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium">
            🎒 Hurry! 50% off your first 3 months if you subscribe in September
          </p>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/app')}
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app/profile')}
              >
                Profile
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="py-12">
        <SEO
          title="Pricing | Sproutify School"
          description="Choose the perfect plan for your classroom aeroponic garden management."
          canonical="/pricing"
        />
        
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {isLoggedIn && userSubscription?.subscription_status === 'trial' 
                ? 'Upgrade Your Plan' 
                : 'Choose Your Plan'
              }
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              {isLoggedIn && userSubscription?.subscription_status === 'trial'
                ? 'Unlock more towers and students by upgrading your subscription.'
                : 'Manage your classroom aeroponic towers with confidence. All plans include a 7-day free trial.'
              }
            </p>
            
            {/* Key benefits */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CreditCard className="w-4 h-4" />
                No credit card needed for trial
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                <FileText className="w-4 h-4" />
                We accept purchase orders (POs)
              </div>
            </div>
            
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <Zap className="h-4 w-4 mr-1" />
              50% OFF Your First 3 Months
            </Badge>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={billingPeriod === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingPeriod("monthly")}
                className="px-6 py-2"
              >
                Monthly
              </Button>
              <Button
                variant={billingPeriod === "annual" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingPeriod("annual")}
                className="px-6 py-2 relative"
              >
                Annual
                <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-0">
                  Save 10%
                </Badge>
              </Button>
            </div>
          </div>

          {/* Trial Status for logged in users */}
          {isLoggedIn && userSubscription?.subscription_status === 'trial' && userSubscription.trial_ends_at && (
            <div className="max-w-md mx-auto mb-8">
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <CardContent className="pt-6 text-center">
                  <p className="text-base font-medium text-blue-900 dark:text-blue-100">
                    Your free trial ends on {new Date(userSubscription.trial_ends_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    Current plan: {formatPlanName(userSubscription.subscription_plan)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Coupon Code Input */}
          {(!isLoggedIn || userSubscription?.subscription_status !== 'active') && (
            <div className="max-w-md mx-auto mb-12">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">Have a coupon code?</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={appliedCode || ''}
                        onChange={(e) => setAppliedCode(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => appliedCode && handleCodeApplied(appliedCode, 'Discount applied')}
                        disabled={!appliedCode}
                      >
                        Apply
                      </Button>
                    </div>
                    {appliedCode && appliedDiscount && (
                      <div className="text-center p-2 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800 font-medium">
                          {appliedCode}: {appliedDiscount}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCodeRemoved}
                          className="text-xs text-green-700 h-auto p-1"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isPopular = plan.id === 'professional';
              const isLoading = loading === plan.id;
              const isCurrent = isCurrentPlan(plan.id);
              
              const pricing = getCurrentPlanPricing(plan);
              const basePrice = pricing.price;
              const discountedPrice = appliedCode ? 
                calculateDiscountedPrice(basePrice, appliedCode) : basePrice;
              const isFree = discountedPrice === 0;
              
              // Special rendering for the Accelerator plan with tabs
              if (plan.id === "school") {
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative ${
                      isCurrent ? 'border-green-500 bg-green-50' : ''
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-green-600 text-white">
                          Current Plan
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>
                        {plan.description}
                      </CardDescription>
                      
                      <div className="pt-4">
                        {(() => {
                          // District pricing when district tab is selected
                          if (schoolDistrictTab === "district") {
                            const districtBasePrice = billingPeriod === "annual" ? DISTRICT_PRICING.annualPrice : DISTRICT_PRICING.monthlyPrice;
                            const districtOriginalPrice = billingPeriod === "annual" ? DISTRICT_PRICING.originalAnnualPrice : DISTRICT_PRICING.originalMonthlyPrice;
                            const districtDiscountedPrice = appliedCode ? calculateDiscountedPrice(districtBasePrice, appliedCode) : districtBasePrice;
                            const districtIsFree = districtDiscountedPrice === 0;
                            const districtPeriod = billingPeriod === "annual" ? "/year" : "/month";
                            const districtSavings = billingPeriod === "annual" ? "Save 10%" : "50% OFF";
                            
                            return (
                              <>
                                {districtIsFree ? (
                                  <div className="text-4xl font-bold text-green-600">
                                    FREE
                                    <span className="text-lg font-normal text-muted-foreground">{districtPeriod}</span>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                      <span className="text-sm text-muted-foreground line-through">
                                        ${(districtOriginalPrice / 100).toFixed(2)}
                                      </span>
                                      <Badge variant="destructive" className="text-xs">
                                        {districtSavings}
                                      </Badge>
                                    </div>
                                    <div className="text-4xl font-bold text-green-600">
                                      ${(districtDiscountedPrice / 100).toFixed(2)}
                                      <span className="text-lg font-normal text-muted-foreground">{districtPeriod}</span>
                                    </div>
                                    {billingPeriod === "annual" && (
                                      <p className="text-sm text-green-600 font-medium mt-1">
                                        Save ${((districtOriginalPrice - districtBasePrice) / 100).toFixed(2)} per year
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                {appliedCode && !districtIsFree && (
                                  <div className="text-sm text-muted-foreground mt-2">
                                    <span className="line-through">${(districtBasePrice / 100).toFixed(2)}{districtPeriod}</span>
                                    <span className="text-green-600 font-medium ml-2">with {appliedCode}</span>
                                  </div>
                                )}
                                
                                <div className="text-xs text-green-600 font-medium mt-2">
                                  7-day FREE trial
                                </div>
                              </>
                            );
                          }
                          
                          // School pricing (default)
                          return (
                            <>
                              {isFree ? (
                                <div className="text-4xl font-bold text-green-600">
                                  FREE
                                  <span className="text-lg font-normal text-muted-foreground">{pricing.period}</span>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                    <span className="text-sm text-muted-foreground line-through">
                                      ${(pricing.originalPrice / 100).toFixed(2)}
                                    </span>
                                    <Badge variant="destructive" className="text-xs">
                                      {pricing.savings}
                                    </Badge>
                                  </div>
                                  <div className="text-4xl font-bold text-green-600">
                                    ${(discountedPrice / 100).toFixed(2)}
                                    <span className="text-lg font-normal text-muted-foreground">{pricing.period}</span>
                                  </div>
                                  {billingPeriod === "annual" && pricing.annualSavings && (
                                    <p className="text-sm text-green-600 font-medium mt-1">
                                      Save ${pricing.annualSavings.toFixed(2)} per year
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {appliedCode && !isFree && (
                                <div className="text-sm text-muted-foreground mt-2">
                                  <span className="line-through">${(basePrice / 100).toFixed(2)}{pricing.period}</span>
                                  <span className="text-green-600 font-medium ml-2">with {appliedCode}</span>
                                </div>
                              )}
                              
                              <div className="text-xs text-green-600 font-medium mt-2">
                                7-day FREE trial
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* School/District Tabs */}
                      <Tabs
                        value={schoolDistrictTab}
                        onValueChange={(v) => setSchoolDistrictTab(v as "school" | "district")}
                        className="mt-4"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="school">School</TabsTrigger>
                          <TabsTrigger value="district">District</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {(schoolDistrictTab === "district" ? [
                          "Multi-School Reporting",
                          "Bulk User Management", 
                          "Advanced Analytics",
                          "District Dashboard"
                        ] : plan.features).slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>• {feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <p className="mt-3 text-xs text-muted-foreground">
                        {schoolDistrictTab === "district"
                          ? "District plan: Multi-school reporting, bulk user management, advanced analytics, and district dashboard."
                          : "School plan: Unlimited towers, classroom management, pest management system, and gamified leaderboards."}
                      </p>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        onClick={() => handlePlanAction(plan.id)}
                        disabled={isLoading || isCurrent}
                        className={`w-full ${isCurrent ? 'opacity-50' : ''}`} 
                        size="lg"
                        variant={isCurrent ? 'outline' : 'default'}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          getButtonText(plan.id)
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              }
              
              // Default rendering for Basic/Professional plans
              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${
                    isPopular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''
                  } ${isCurrent ? 'border-green-500 bg-green-50' : ''}`}
                >
                  {isPopular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-600 text-white">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.description}
                    </CardDescription>
                    
                    <div className="pt-4">
                      {isFree ? (
                        <div className="text-4xl font-bold text-green-600">
                          FREE
                          <span className="text-lg font-normal text-muted-foreground">{pricing.period}</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground line-through">
                              ${(pricing.originalPrice / 100).toFixed(2)}
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              {pricing.savings}
                            </Badge>
                          </div>
                          <div className="text-4xl font-bold text-green-600">
                            ${(discountedPrice / 100).toFixed(2)}
                            <span className="text-lg font-normal text-muted-foreground">{pricing.period}</span>
                          </div>
                          {billingPeriod === "annual" && pricing.annualSavings && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              Save ${pricing.annualSavings.toFixed(2)} per year
                            </p>
                          )}
                        </div>
                      )}
                      
                      {appliedCode && !isFree && (
                        <div className="text-sm text-muted-foreground mt-2">
                          <span className="line-through">${(basePrice / 100).toFixed(2)}{pricing.period}</span>
                          <span className="text-green-600 font-medium ml-2">with {appliedCode}</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-green-600 font-medium mt-2">
                        7-day FREE trial
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>• {feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 3 && (
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>• +{plan.features.length - 3} more features</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      onClick={() => handlePlanAction(plan.id)}
                      disabled={isLoading || isCurrent}
                      className={`w-full ${isPopular && !isCurrent ? 'bg-primary' : ''} ${isCurrent ? 'opacity-50' : ''}`} 
                      size="lg"
                      variant={isCurrent ? 'outline' : 'default'}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        getButtonText(plan.id)
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Purchase Order Information */}
          <div className="text-center mt-20">
            <Card className="max-w-2xl mx-auto border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">Need a Purchase Order?</h2>
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                  We accept purchase orders from schools and districts. Contact us to set up your PO and get started with your free trial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => window.open('mailto:support@sproutify.app?subject=Purchase Order Inquiry', '_blank')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Contact Us for PO Setup
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('https://school.sproutify.app/', '_blank')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Visit Our Website
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;