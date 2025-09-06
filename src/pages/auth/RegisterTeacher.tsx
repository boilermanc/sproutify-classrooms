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
import { Loader2, Crown, Gift } from "lucide-react";

export default function RegisterTeacher() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get plan and promo code from URL
  const selectedPlan = searchParams.get('plan');
  const promoCode = searchParams.get('code');

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [schoolName, setSchoolName] = useState("");
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

    setLoading(true);
    try {
      // 1) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError || !signUpData?.user) {
        throw new Error(signUpError?.message ?? "Sign up failed");
      }
      const userId = signUpData.user.id;

      // 2) Upsert/find school
      const { data: existingSchools, error: schoolLookupError } = await supabase
        .from("schools")
        .select("id")
        .eq("name", schoolName.trim())
        .limit(1);
      if (schoolLookupError) throw new Error(schoolLookupError.message);

      let schoolId: string;
      if (existingSchools && existingSchools.length > 0) {
        schoolId = existingSchools[0].id;
      } else {
        const { data: newSchool, error: schoolInsertError } = await supabase
          .from("schools")
          .insert({ name: schoolName.trim() })
          .select()
          .single();
        if (schoolInsertError || !newSchool) throw new Error(schoolInsertError?.message ?? "School insert failed");
        schoolId = newSchool.id;
      }

      // 3) Profile - Use UPSERT to handle existing records
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        school_id: schoolId,
        // Set initial subscription status
        subscription_status: 'free',
        subscription_plan: 'free'
      }, {
        onConflict: 'id'
      });
      if (profileError) throw new Error(profileError.message);

      // 4) Role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "teacher",
      });
      if (roleError) throw new Error(roleError.message);

      // Success message and navigation logic
      if (selectedPlan) {
        toast({ 
          title: "Account created!", 
          description: "Please check your email to confirm your account, then complete your subscription." 
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