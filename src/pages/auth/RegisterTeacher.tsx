import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";

export default function RegisterTeacher() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Connect Supabase to enable sign up",
      description: "Use the green Supabase button in the top right to connect. Then I’ll wire up auth and privacy.",
    });
    navigate("/app");
  };

  return (
    <div className="container max-w-xl py-10">
      <SEO title="Register | Sproutify School" description="Teacher sign up for Sproutify School." canonical="/auth/register" />
      <Card>
        <CardHeader>
          <CardTitle>Teacher Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="teacher@school.edu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" variant="default" className="w-full">Create account</Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">Student accounts will be created by teachers to protect privacy.</p>
        </CardContent>
      </Card>
    </div>
  );
}
