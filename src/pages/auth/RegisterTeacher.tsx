// src/pages/auth/RegisterTeacher.tsx - Updated for better UX and subscription plan handling

import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { sendRegistrationWebhook } from "@/utils/webhooks";
import { Loader2, Crown, Gift } from "lucide-react";
import { getPlanLimits } from "@/config/plans";

export default function RegisterTeacher() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get plan, billing period, and promo code from URL
  const selectedPlan = searchParams.get('plan');
  const billingPeriod = searchParams.get('billing') as 'monthly' | 'annual' || 'monthly';
  const promoCode = searchParams.get('code');

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [districtJoinCode, setDistrictJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const getPlanDisplayName = (planId: string) => {
    switch (planId) {
      case 'basic': return 'Basic';
      case 'professional': return 'Professional';
      case 'school': return 'School';
      default: return planId.charAt(0).toUpperCase() + planId.slice(1);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Please confirm your password.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    
    // Add email validation
    if (!email.trim()) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    
    // Add name validation
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: "Name required", description: "Please enter your first and last name.", variant: "destructive" });
      return;
    }
    
    // Add school name validation
    if (!schoolName.trim()) {
      toast({ title: "School name required", description: "Please enter your school name.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login`
        }
      });
      if (signUpError) {
        console.error('Supabase signup error:', signUpError);
        throw new Error(signUpError.message ?? "Sign up failed");
      }
      
      // Check if user needs email confirmation
      if (signUpData.user && !signUpData.user.email_confirmed_at) {
        toast({ 
          title: "Check your email", 
          description: "We've sent you a confirmation link. Please check your email and click the link to activate your account." 
        });
        navigate("/auth/login");
        return;
      }
      
      if (!signUpData?.user) {
        throw new Error("Sign up failed - no user created");
      }
      const userId = signUpData.user.id;

      // 2) Handle district lookup if join code provided
      let districtId: string | null = null;
      if (districtJoinCode.trim()) {
        const { data: district, error: districtError } = await supabase
          .from("districts")
          .select("id")
          .eq("join_code", districtJoinCode.trim())
          .single();
        
        if (districtError || !district) {
          console.warn("District lookup failed:", districtError);
          toast({
            title: "Invalid district join code",
            description: "The district join code you entered is invalid. You can continue without it and link your district later.",
            variant: "destructive"
          });
          // Continue without district association
        } else {
          districtId = district.id;
        }
      }

      // 3) Upsert/find school
      const { data: existingSchools, error: schoolLookupError } = await supabase
        .from("schools")
        .select("id, district_id")
        .eq("name", schoolName.trim())
        .limit(1);
      if (schoolLookupError) throw new Error(schoolLookupError.message);

      let schoolId: string;
      if (existingSchools && existingSchools.length > 0) {
        schoolId = existingSchools[0].id;
        
        // If school exists but doesn't have district_id and we have one, update it
        if (districtId && !existingSchools[0].district_id) {
          const { error: updateError } = await supabase
            .from("schools")
            .update({ district_id: districtId })
            .eq("id", schoolId);
          if (updateError) console.warn("Failed to link school to district:", updateError);
        }
      } else {
        const { data: newSchool, error: schoolInsertError } = await supabase
          .from("schools")
          .insert({ 
            name: schoolName.trim(),
            district_id: districtId // Link new school to district if provided
          })
          .select()
          .single();
        if (schoolInsertError || !newSchool) throw new Error(schoolInsertError?.message ?? "School insert failed");
        schoolId = newSchool.id;
      }

      // 3) Get plan limits
      const planLimits = getPlanLimits(selectedPlan || 'free');
      
      // 4) Profile - Use UPSERT to handle existing records
      console.log('Registration plan values:', { selectedPlan, billingPeriod, combinedPlan: selectedPlan ? `${selectedPlan}_${billingPeriod}` : 'free' });
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        school_id: schoolId,
        district_id: districtId, // Include district_id if provided
        // Set initial subscription status based on selected plan
        subscription_status: selectedPlan ? 'trial' : 'free',
        subscription_plan: selectedPlan ? `${selectedPlan}_${billingPeriod}` : 'free',
        billing_period: selectedPlan ? billingPeriod : null,
        // Set trial end date if they selected a plan
        trial_ends_at: selectedPlan ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        // Set plan limits
        max_towers: planLimits.max_towers,
        max_students: planLimits.max_students,
        // Initialize Stripe fields as null
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_ends_at: null,
        // Set default avatar
        avatar_url: "https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/avatars/3ed72cee-a334-4c41-ba1d-49437aa1144f/BCO.52a99b16-ea69-4a75-93cd-dbdd2eda7c65.png"
      }, {
        onConflict: 'id'
      });
      if (profileError) throw new Error(profileError.message);

      // 5) Role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "teacher",
      });
      if (roleError) throw new Error(roleError.message);

      // Send registration webhook to n8n
      try {
        const trialEndsAt = selectedPlan ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString();
        await sendRegistrationWebhook({
          id: userId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          schoolName: schoolName,
          plan: selectedPlan as 'basic' | 'professional' | 'school' | 'district' || 'basic',
          trialEndsAt: trialEndsAt,
        });
      } catch (webhookError) {
        console.error('Failed to send registration webhook:', webhookError);
        // Don't fail the registration if webhook fails
      }

      // Success message and navigation logic
      if (selectedPlan) {
        const planName = getPlanDisplayName(selectedPlan);
        const period = billingPeriod === "annual" ? "Annual" : "Monthly";
        toast({ 
          title: "Account created!", 
          description: `Welcome to Sproutify School ${planName} ${period} plan. Please check your email to confirm your account, then complete your subscription.` 
        });
        
        // Wait a moment for the toast to show, then navigate
        setTimeout(() => {
          // Build the pricing URL with plan and promo code
          const pricingUrl = new URL('/pricing', window.location.origin);
          pricingUrl.searchParams.set('plan', selectedPlan);
          if (promoCode) {
            pricingUrl.searchParams.set('code', promoCode);
          }
          // Add a flag to indicate they just registered
          pricingUrl.searchParams.set('registered', 'true');
          
          window.location.href = pricingUrl.toString();
        }, 2000);
      } else {
        toast({ 
          title: "Account created!", 
          description: "Check your email to confirm your account, then sign in to get started." 
        });
        navigate("/auth/login");
      }
      
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message ?? "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-h-screen flex items-center justify-center py-10">
      <SEO title="Register | Sproutify School" description="Teacher sign up for Sproutify School." canonical="/auth/register" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img 
              src="/lovable-uploads/689a7eca-ef5f-4820-8baa-d048f50e2773.png" 
              alt="Sproutify School Logo" 
              className="h-16 inline-block" 
            />
          </Link>
        </div>

        {/* Plan Selection Display */}
        {selectedPlan && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Selected Plan
                </h3>
                <Badge className="text-lg px-4 py-2 mb-2">
                  {getPlanDisplayName(selectedPlan)} Plan
                </Badge>
                {promoCode && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <Gift className="h-3 w-3 mr-1" />
                      Promo: {promoCode}
                    </Badge>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Complete registration to start your 7-day free trial
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Teacher Account</CardTitle>
            <CardDescription>
              {selectedPlan 
                ? "Complete your registration to start your subscription" 
                : "Let's get your school and classroom set up"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input 
                    id="first-name" 
                    required 
                    placeholder="Jane" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input 
                    id="last-name" 
                    required 
                    placeholder="Doe" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-name">School name</Label>
                <Input 
                  id="school-name" 
                  required 
                  placeholder="Springfield Elementary" 
                  value={schoolName} 
                  onChange={(e) => setSchoolName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district-code">District join code (optional)</Label>
                <Input 
                  id="district-code" 
                  placeholder="Enter district join code if provided" 
                  value={districtJoinCode} 
                  onChange={(e) => setDistrictJoinCode(e.target.value)} 
                />
                <p className="text-xs text-muted-foreground">
                  If your school is part of a district, enter the join code provided by your district administrator.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  placeholder="teacher@school.edu" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (min. 6 characters)</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input 
                  id="confirm" 
                  type="password" 
                  required 
                  value={confirm} 
                  onChange={(e) => setConfirm(e.target.value)} 
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : selectedPlan ? (
                  "Create Account & Continue to Subscription"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {selectedPlan ? (
                "After registration, you'll be redirected to complete your subscription setup."
              ) : (
                "Student accounts are created by teachers after signup to protect privacy."
              )}
            </p>
          </CardContent>
        </Card>
        
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link 
            to={selectedPlan ? `/auth/login?plan=${selectedPlan}${promoCode ? `&code=${promoCode}` : ''}` : "/auth/login"} 
            className="underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}