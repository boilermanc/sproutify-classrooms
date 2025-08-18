import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

export default function RegisterTeacher() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading]     = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don’t match", description: "Please confirm your password.", variant: "destructive" });
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
        .eq("name", schoolName)
        .limit(1);
      if (schoolLookupError) throw new Error(schoolLookupError.message);

      let schoolId: string;
      if (existingSchools && existingSchools.length > 0) {
        schoolId = existingSchools[0].id;
      } else {
        const { data: newSchool, error: schoolInsertError } = await supabase
          .from("schools")
          .insert({ name: schoolName })
          .select()
          .single();
        if (schoolInsertError || !newSchool) throw new Error(schoolInsertError?.message ?? "School insert failed");
        schoolId = newSchool.id;
      }

      // 3) Profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        school_id: schoolId,
      });
      if (profileError) throw new Error(profileError.message);

      // 4) Role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "teacher",
      });
      if (roleError) throw new Error(roleError.message);

      toast({ title: "Account created", description: "Check your email to confirm your account." });
      navigate("/app");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message ?? "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
              <Label htmlFor="first-name">First name</Label>
              <Input id="first-name" required placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input id="last-name" required placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="teacher@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-name">School name</Label>
              <Input id="school-name" required placeholder="Springfield Elementary" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            Student accounts will be created by teachers to protect privacy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
