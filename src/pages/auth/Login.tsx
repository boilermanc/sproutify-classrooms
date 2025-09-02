// src/pages/auth/Login.tsx - Updated for better UX and consistency

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react"; // Import the spinner icon

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Password reset state
  const [resetEmail, setResetEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      toast({ title: "Welcome back!" });
      navigate("/app");
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
              src="/lovable-uploads/689a7eca-ef5f-4820-8baa-d048f50e2773.png" 
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
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
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