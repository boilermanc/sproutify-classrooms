// src/pages/auth/AcceptInvite.tsx - Teacher invite acceptance page

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { sendRegistrationWebhook } from "@/utils/webhooks";
import { Loader2 } from "lucide-react";

export default function AcceptInvite() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const inviteId = searchParams.get('invite');
  
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!inviteId) {
      toast({ title: "Invalid invite link", variant: "destructive" });
      navigate("/auth/login");
      return;
    }

    // Fetch invite details
    const fetchInvite = async () => {
      try {
        const { data, error } = await supabase
          .from("pending_invites")
          .select(`
            id,
            email,
            full_name,
            role,
            school_id,
            district_id,
            schools(name),
            districts(name)
          `)
          .eq("id", inviteId)
          .single();

        if (error || !data) {
          toast({ title: "Invite not found or expired", variant: "destructive" });
          navigate("/auth/login");
          return;
        }

        setInvite(data);
        setFirstName(data.full_name?.split(' ')[0] || '');
        setLastName(data.full_name?.split(' ').slice(1).join(' ') || '');
      } catch (err) {
        console.error("Error fetching invite:", err);
        toast({ title: "Error loading invite", variant: "destructive" });
        navigate("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [inviteId, navigate, toast]);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // 1) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
        email: invite.email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login`
        }
      });
      
      if (signUpError) {
        throw new Error(signUpError.message ?? "Sign up failed");
      }
      
      // Check if user needs email confirmation
      if (signUpData.user && !signUpData.user.email_confirmed_at) {
        toast({ 
          title: "Check your email", 
          description: "We've sent you a confirmation link. Please check your email and click the link to activate your account." 
        });
        setSubmitting(false);
        return;
      }
      
      if (!signUpData?.user) {
        throw new Error("Sign up failed - no user created");
      }
      
      const userId = signUpData.user.id;

      // 2) Create profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        email: invite.email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        school_id: invite.school_id,
        district_id: invite.district_id,
        subscription_status: 'trial',
        subscription_plan: 'free',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        max_towers: 3,
        max_students: 30,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_ends_at: null,
        avatar_url: "https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/avatars/3ed72cee-a334-4c41-ba1d-49437aa1144f/BCO.52a99b16-ea69-4a75-93cd-dbdd2eda7c65.png"
      }, { onConflict: "id" });
      
      if (profileError) throw new Error(profileError.message);

      // 3) Assign role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: invite.role,
        school_id: invite.school_id,
        district_id: invite.district_id,
      });
      
      if (roleError) throw new Error(roleError.message);

      // 4) Delete the pending invite
      const { error: deleteError } = await supabase
        .from("pending_invites")
        .delete()
        .eq("id", inviteId);
      
      if (deleteError) console.warn("Failed to delete invite:", deleteError);

      // Send registration webhook to n8n
      try {
        const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await sendRegistrationWebhook({
          id: userId,
          email: invite.email,
          firstName: firstName,
          lastName: lastName,
          schoolName: invite.school_name || '',
          plan: 'basic', // Default plan for invited users
          trialEndsAt: trialEndsAt,
        });
      } catch (webhookError) {
        console.error('Failed to send registration webhook:', webhookError);
        // Don't fail the registration if webhook fails
      }

      toast({ title: "Account created successfully! Welcome!" });
      
      // Redirect based on role
      if (invite.role === 'school_admin') {
        navigate("/school");
      } else {
        navigate("/app");
      }
      
    } catch (err: any) {
      console.error("Error accepting invite:", err);
      toast({ 
        title: "Failed to create account", 
        description: err.message,
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading invite...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return null;
  }

  return (
    <>
      <SEO title="Accept Invite" description="Accept your teacher invitation" />
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Accept Invitation</CardTitle>
            <CardDescription>
              You've been invited to join {invite.schools?.name || invite.districts?.name} as a {invite.role}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcceptInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={invite.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
