import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminSetup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const addTeamMember = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, find the user by email
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        throw new Error(`Failed to fetch users: ${userError.message}`);
      }

      const user = users.users.find(u => u.email === email);
      if (!user) {
        throw new Error("User not found with that email address");
      }

      // Add the user to team_members table
      const { error: insertError } = await supabase
        .from("team_members")
        .insert({
          user_id: user.id,
          role: "super_admin",
          active: true
        });

      if (insertError) {
        throw new Error(`Failed to add team member: ${insertError.message}`);
      }

      setSuccess(true);
      toast({
        title: "Success",
        description: "Team member added successfully! You can now access the admin panel.",
      });
    } catch (error: any) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Setup Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You have been successfully added as a super admin. You can now access the admin panel.
            </p>
            <Button 
              onClick={() => window.location.href = "/admin"}
              className="w-full"
            >
              Go to Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Setup</CardTitle>
          <p className="text-muted-foreground">
            Add yourself as a super admin to access the admin panel
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This page allows you to add yourself as a super admin. Enter the email address of the user you want to make an admin.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={addTeamMember}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Adding..." : "Add as Super Admin"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
