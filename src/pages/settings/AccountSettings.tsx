import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Shield, Scale, Info } from "lucide-react";

export default function AccountSettings() {
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Password change form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Weight unit preference state
  const [weightUnit, setWeightUnit] = useState<'grams' | 'ounces'>('grams');
  const [savingWeightUnit, setSavingWeightUnit] = useState(false);

  // Load current user info and preferences
  useEffect(() => {
    const loadUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        setUserId(user.id);
        
        // Load current weight unit preference from profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("preferred_weight_unit")
          .eq("id", user.id)
          .single();
          
        if (profileError) {
          console.log("Profile error (this might be expected if preferred_weight_unit doesn't exist):", profileError);
        }
          
        if (profileData?.preferred_weight_unit) {
          setWeightUnit(profileData.preferred_weight_unit as 'grams' | 'ounces');
        }
      }
      setLoading(false);
    };
    loadUserInfo();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure your new passwords match.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (!currentPassword) {
      toast({
        title: "Current password required",
        description: "Please enter your current password to verify your identity.",
        variant: "destructive"
      });
      return;
    }

    setChangingPassword(true);

    try {
      // First verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword
      });

      if (verifyError) {
        throw new Error("Current password is incorrect");
      }

      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Success - clear form and show success message
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been changed."
      });

    } catch (error: any) {
      console.error("Password change error:", error);
      toast({
        title: "Password change failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleWeightUnitChange = async (newUnit: 'grams' | 'ounces') => {
    setSavingWeightUnit(true);
    
    try {
      // Update profile with new weight unit preference
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ preferred_weight_unit: newUnit })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Also update all classrooms owned by this teacher
      const { error: classroomError } = await supabase
        .from("classrooms")
        .update({ preferred_weight_unit: newUnit })
        .eq("teacher_id", userId);

      if (classroomError) throw classroomError;

      setWeightUnit(newUnit);
      toast({
        title: "Preference saved",
        description: `Weight unit updated to ${newUnit}. This applies to all your harvest and waste forms.`
      });

    } catch (error: any) {
      console.error("Weight unit update error:", error);
      toast({
        title: "Update failed",
        description: "Could not save weight unit preference. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingWeightUnit(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Account Settings</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO 
        title="Account Settings | Sproutify School" 
        description="Manage your account security and teaching preferences" 
        canonical="/app/settings" 
      />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Account Settings</h1>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={userEmail} 
              disabled 
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Your email address cannot be changed. Contact support if you need to update it.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Teaching Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Teaching Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">Preferred Weight Unit</Label>
            <Select 
              value={weightUnit} 
              onValueChange={(value) => handleWeightUnitChange(value as 'grams' | 'ounces')}
              disabled={savingWeightUnit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grams">
                  <div className="flex items-center justify-between w-full">
                    <span>Grams (g)</span>
                    <span className="text-xs text-muted-foreground ml-2">Metric</span>
                  </div>
                </SelectItem>
                <SelectItem value="ounces">
                  <div className="flex items-center justify-between w-full">
                    <span>Ounces (oz)</span>
                    <span className="text-xs text-muted-foreground ml-2">Imperial</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This setting applies to all harvest and waste forms in your classrooms. 
                Data is stored consistently but displayed in your preferred unit.
                <br />
                <strong>Conversion:</strong> 1 ounce = 28.35 grams
              </AlertDescription>
            </Alert>
          </div>

          {savingWeightUnit && (
            <div className="text-sm text-muted-foreground">Saving preference...</div>
          )}
        </CardContent>
      </Card>

      {/* Password Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              For your security, we'll verify your current password before making any changes.
            </AlertDescription>
          </Alert>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                minLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Password must be at least 6 characters long.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {changingPassword ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• Use a unique password that you don't use for other accounts</p>
            <p>• Include a mix of letters, numbers, and special characters</p>
            <p>• Avoid using personal information like birthdays or names</p>
            <p>• Consider using a password manager to generate and store secure passwords</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}