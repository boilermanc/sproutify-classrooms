// src/pages/auth/StudentLoginPage.tsx - Fixed Version with Student Name + Kiosk PIN

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { anonymousSupabase } from "@/integrations/supabase/anonymous-client";
import { findClassroomByPin } from "@/utils/kiosk-login";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentName, setStudentName] = useState("");
  const [kioskPin, setKioskPin] = useState("");
  const [studentPin, setStudentPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showKioskPin, setShowKioskPin] = useState(false);
  const [showStudentPin, setShowStudentPin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const name = studentName.trim();
    const classroomPin = kioskPin.trim();
    const pin = studentPin.trim();

    // Validate all fields
    if (!name) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }

    if (!classroomPin) {
      setError("Please enter the Classroom PIN.");
      setLoading(false);
      return;
    }

    if (!pin) {
      setError("Please enter your Student PIN.");
      setLoading(false);
      return;
    }

    // Validate PIN formats
    if (!/^\d{4}$/.test(classroomPin)) {
      setError("Classroom PIN must be exactly 4 digits.");
      setLoading(false);
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      setError("Student PIN must be 4-6 digits.");
      setLoading(false);
      return;
    }

    try {
      console.log("Starting student login process...");
      console.log("Student name:", name);
      console.log("Classroom PIN:", classroomPin);
      console.log("Student PIN:", pin);
      
      // Step 1: Find classroom by PIN using direct fetch
      const { data: classroom, error: classroomErr } = await findClassroomByPin(classroomPin);
      console.log("Classroom lookup result:", { classroom, classroomErr });

      if (classroomErr || !classroom) {
        console.error("Classroom lookup failed:", classroomErr);
        setError("Invalid Classroom PIN. Please check with your teacher.");
        setLoading(false);
        return;
      }

      // Step 2: Check if student exists in this classroom with matching PIN
      const { data: student, error: studentErr } = await anonymousSupabase
        .from("students")
        .select("id, display_name, has_logged_in, student_pin")
        .eq("classroom_id", classroom.id)
        .eq("display_name", name)
        .single();
      
      console.log("Student lookup result:", { student, studentErr });

      if (studentErr || !student) {
        console.error("Student lookup failed:", studentErr);
        setError(`We couldn't find a student named "${name}" in ${classroom.name}. Please check your name spelling, or ask your teacher for help.`);
        setLoading(false);
        return;
      }

      // Verify the student PIN matches
      if (student.student_pin !== pin) {
        setError(`The PIN you entered doesn't match the PIN for "${name}". Please check with your teacher.`);
        setLoading(false);
        return;
      }

      // Step 3: Update login tracking
      const isFirstLogin = !student.has_logged_in;
      const now = new Date().toISOString();
      
      const { error: updateErr } = await anonymousSupabase
        .from("students")
        .update({
          has_logged_in: true,
          first_login_at: isFirstLogin ? now : undefined, // Only set on first login
          last_login_at: now
        })
        .eq("id", student.id);

      if (updateErr) {
        console.error("Login tracking update failed:", updateErr);
        setError("Could not record your login. Please try again.");
        setLoading(false);
        return;
      }

      // Success! Store student session data and redirect
      console.log("StudentLoginPage - Setting localStorage data:");
      console.log("  student_classroom_id:", classroom.id);
      console.log("  student_classroom_name:", classroom.name);
      console.log("  student_name:", name);
      
      localStorage.setItem("student_classroom_id", classroom.id);
      localStorage.setItem("student_classroom_name", classroom.name);
      localStorage.setItem("student_name", name);
      
      // Verify the data was set
      console.log("StudentLoginPage - Verifying localStorage:");
      console.log("  student_classroom_id:", localStorage.getItem("student_classroom_id"));
      console.log("  student_classroom_name:", localStorage.getItem("student_classroom_name"));
      console.log("  student_name:", localStorage.getItem("student_name"));
      
      toast({ title: `Welcome, ${name}!` });
      console.log("StudentLoginPage - Navigating to /student/dashboard");
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <SEO title="Student Login | Sproutify School" />
      <div className="w-full max-w-md">

        {/* Logo Link back to Home Page */}
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
            <CardTitle className="text-2xl">Student Login</CardTitle>
            <CardDescription>Enter your name, classroom PIN, and student PIN to begin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Your Name</Label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kioskPin">Classroom PIN</Label>
                <div className="relative">
                  <Input
                    id="kioskPin"
                    type={showKioskPin ? "text" : "password"}
                    value={kioskPin}
                    onChange={(e) => setKioskPin(e.target.value)}
                    placeholder="4-digit PIN from your teacher"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowKioskPin(!showKioskPin)}
                  >
                    {showKioskPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentPin">Your Student PIN</Label>
                <div className="relative">
                  <Input
                    id="studentPin"
                    type={showStudentPin ? "text" : "password"}
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value)}
                    placeholder="4-6 digit PIN assigned by your teacher"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowStudentPin(!showStudentPin)}
                  >
                    {showStudentPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log In"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          Are you a teacher?{" "}
          <Link to="/auth/login" className="underline">
            Teacher Login
          </Link>
        </div>
      </div>
    </div>
  );
}