// src/pages/auth/RegisterTeacher.tsx - Updated for better UX and consistency

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react"; // Import the spinner icon

export default function RegisterTeacher() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);

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
        school_id: schoolId,
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

      toast({ title: "Account created!", description: "Check your email to confirm your account." });
      navigate("/auth/login"); // Navigate to login page to sign in after confirmation
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
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Teacher Account</CardTitle>
            <CardDescription>Let's get your school and classroom set up.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" required placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" required placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-name">School name</Label>
                <Input id="school-name" required placeholder="Springfield Elementary" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="teacher@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (min. 6 characters)</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Student accounts are created by teachers after signup to protect privacy.
            </p>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/auth/login" className="underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}