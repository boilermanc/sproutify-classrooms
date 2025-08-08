import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Auth not connected",
      description: "Connect Supabase from the top right to enable secure login.",
    });
    navigate("/app");
  };

  return (
    <div className="container max-w-xl py-10">
      <SEO title="Sign In | Sproutify School" description="Sign in to Sproutify School." canonical="/auth/login" />
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">New here? <Link to="/auth/register" className="underline">Register your teacher account</Link>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
