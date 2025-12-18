// src/pages/auth/Login.tsx - Updated for better UX and consistency

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Eye, EyeOff } from "lucide-react"; // Import the spinner icon

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Password reset state
  const [resetEmail, setResetEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation
    if (!email.trim()) {
      toast({ 
        title: "Email required", 
        description: "Please enter your email address", 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }
    
    if (!password.trim()) {
      toast({ 
        title: "Password required", 
        description: "Please enter your password", 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting login with email:', email);
      const { data: { user }, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        console.error('Supabase auth error:', error);
        throw new Error(error.message);
      }
      
      toast({ title: "Welcome back!" });
      
      // Check user role to determine correct redirect path
      if (user) {
        // First check if user is super_admin or staff
        const { data: teamMember, error: teamMemberError } = await supabase
          .from("team_members")
          .select("role, active")
          .eq("user_id", user.id)
          .eq("active", true)
          .maybeSingle();

        // If no error and we have a team member, redirect to admin
        if (!teamMemberError && teamMember && (teamMember.role === "super_admin" || teamMember.role === "staff")) {
          navigate("/admin");
          return;
        }

        // Check regular user roles
        const [{ data: profile }, { data: roles }] = await Promise.all([
          supabase.from("profiles").select("id, district_id, school_id").eq("id", user.id).single(),
          supabase.from("user_roles").select("role").eq("user_id", user.id)
        ]);

        const userRoles = roles?.map(r => r.role) || [];
        
        if (userRoles.includes("district_admin") && profile?.district_id) {
          navigate("/district");
        } else if (userRoles.includes("school_admin") && profile?.school_id) {
          navigate("/school");
        } else {
          navigate("/app");
        }
      } else {
        navigate("/app");
      }
    } catch (err: any) {
      toast({ 
        title: "Sign in failed", 
        description: err.message ?? "Check your email/password", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }

    setSendingReset(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw new Error(error.message);

      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password."
      });

      setResetDialogOpen(false);
      setResetEmail("");
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Reset failed",
        description: error.message || "Could not send reset email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="container min-h-screen flex items-center justify-center py-10">
      <SEO 
        title="Sign In | Sproutify School" 
        description="Sign in to your Sproutify School teacher account." 
        canonical="/auth/login" 
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img 
              src="/images/logo.png" 
              alt="Sproutify School Logo" 
              className="h-16 inline-block" 
            />
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Teacher Sign In</CardTitle>
            <CardDescription>Welcome back! Please enter your details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-sm p-0 h-auto">
                    Forgot your password?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Reset Password
                    </DialogTitle>
                    <DialogDescription>
                      Enter your email address and we'll send you a link to reset your password.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePasswordReset} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Your Account Email</Label>
                      <Input
                        id="reset-email" type="email" value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="teacher@school.edu" required
                      />
                    </div>
                    <Button type="submit" disabled={sendingReset || !resetEmail} className="w-full">
                      {sendingReset ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm space-y-2">
          <p>
            New here?{" "}
            <Link to="/auth/register" className="underline">Create an account</Link>
          </p>
          <p>
            Are you a student?{" "}
            <Link to="/auth/student-login" className="underline">Login with a PIN</Link>
          </p>
        </div>
      </div>
    </div>
  );
}