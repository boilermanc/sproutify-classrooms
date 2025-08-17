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
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Create the teacher's account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !signUpData.user) {
      toast({
        title: "Signup failed",
        description: signUpError?.message ?? "No user returned",
        variant: "destructive",
      });
      return;
    }

    const userId = signUpData.user.id;

    // 2. Check if school exists by name
    const { data: existingSchools, error: schoolLookupError } = await supabase
      .from("schools")
      .select("id")
      .eq("name", schoolName)
      .limit(1);

    if (schoolLookupError) {
      toast({
        title: "School lookup failed",
        description: schoolLookupError.message,
        variant: "destructive",
      });
      return;
    }

    let schoolId: string;

    if (existingSchools.length > 0) {
      // Found a match, use existing school
      schoolId = existingSchools[0].id;
    } else {
      // Insert new school
      const { data: newSchool, error: schoolInsertError } = await supabase
        .from("schools")
        .insert({ name: schoolName })
        .select()
        .single();

      if (schoolInsertError || !newSchool) {
        toast({
          title: "School creation failed",
          description: schoolInsertError?.message ?? "Insert failed",
          variant: "destructive",
        });
        return;
      }

      schoolId = newSchool.id;
    }

    // 3. Insert into profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      school_id: schoolId,
    });

    if (profileError) {
      toast({
        title: "Profile creation failed",
        description: profileError.message,
        variant: "destructive",
      });
      return;
    }

    // 4. Assign 'teacher' role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "teacher",
    });

    if (roleError) {
      toast({
        title: "Role assignment failed",
        description: roleError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account created!",
      description: "Check your email to confirm your account.",
    });

    navigate("/app");
  };

  return (
    <div className="container max-w-xl py-10">
      <SEO
        title="Register | Sproutify School"
        description="Teacher sign up for Sproutify School."
        canonical="/auth/register"
      />
      <Card>
        <CardHeader>
          <CardTitle>Teacher Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                required
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                required
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="teacher@school.edu"
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
            <div className="space-y-2">
              <Label htmlFor="school-name">School name</Label>
              <Input
                id="school-name"
                required
                placeholder="Springfield Elementary"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <Button type="submit" variant="default" className="w-full">
              Create account
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
