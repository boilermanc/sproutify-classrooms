import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      toast({ title: "Welcome back!" });
      navigate("/app");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message ?? "Check your email/password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-xl py-10">
      <SEO title="Sign In Now | Sproutify School" description="Sign in to Sproutify School." canonical="/auth/login" />
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            New here? <Link to="/auth/register" className="underline">Register your teacher account</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
