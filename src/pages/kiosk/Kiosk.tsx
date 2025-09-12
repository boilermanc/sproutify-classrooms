// src/pages/kiosk/Kiosk.tsx - Updated for new student management system with dashboard redirect

import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { anonymousSupabase } from "@/integrations/supabase/anonymous-client";
import { findClassroomByPin } from "@/utils/kiosk-login";
import { Link } from "react-router-dom";

export default function Kiosk() {
  const { toast } = useToast();
  const [studentName, setStudentName] = useState("");
  const [kioskPin, setKioskPin] = useState("");
  const [studentPin, setStudentPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const name = studentName.trim();
    const classroomPin = kioskPin.trim();
    const pin = studentPin.trim();

    // Basic validation
    if (!name) {
      toast({ title: "Enter your name", description: "Please enter your full name as your teacher has it listed." });
      setSubmitting(false);
      return;
    }

    if (!classroomPin) {
      toast({ title: "Enter classroom PIN", description: "Ask your teacher for the classroom PIN." });
      setSubmitting(false);
      return;
    }

    if (!pin) {
      toast({ title: "Enter your student PIN", description: "Ask your teacher for your personal student PIN." });
      setSubmitting(false);
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      toast({ title: "Invalid student PIN", description: "Student PIN must be 4-6 digits." });
      setSubmitting(false);
      return;
    }

    try {
      // Step 1: Find classroom by PIN using direct fetch (fallback approach)
      const { data: classroom, error: classroomErr } = await findClassroomByPin(classroomPin);

      if (classroomErr || !classroom) {
        console.error("Classroom lookup failed:", classroomErr);
        toast({ 
          title: "Invalid PIN", 
          description: "That PIN doesn't match any classroom. Please check with your teacher." 
        });
        setSubmitting(false);
        return;
      }

      // Step 2: Check if student exists in this classroom with matching PIN
      const { data: student, error: studentErr } = await anonymousSupabase
        .from("students")
        .select("id, display_name, has_logged_in, student_pin")
        .eq("classroom_id", classroom.id)
        .eq("display_name", name)
        .single();

      if (studentErr || !student) {
        console.error("Student lookup failed:", studentErr);
        toast({ 
          title: "Student not found", 
          description: `We couldn't find a student named "${name}" in ${classroom.name}. Please check your name spelling, or ask your teacher for help.` 
        });
        setSubmitting(false);
        return;
      }

      // Verify the student PIN matches
      if (student.student_pin !== pin) {
        toast({ 
          title: "Invalid PIN", 
          description: `The PIN you entered doesn't match the PIN for "${name}". Please check with your teacher.` 
        });
        setSubmitting(false);
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
        toast({ 
          title: "Login error", 
          description: "Could not record your login. Please try again." 
        });
        setSubmitting(false);
        return;
      }

      // Success! Store student session data and redirect
      localStorage.setItem("student_classroom_id", classroom.id);
      localStorage.setItem("student_classroom_name", classroom.name);
      localStorage.setItem("student_id", student.id);
      localStorage.setItem("student_name", name);
      
      const welcomeMessage = isFirstLogin 
        ? `Welcome to ${classroom.name}, ${name}! This is your first time logging in.`
        : `Welcome back to ${classroom.name}, ${name}!`;
      
      toast({ 
        title: "Login successful!", 
        description: welcomeMessage 
      });

      // Redirect to student dashboard after brief delay for toast
      setTimeout(() => {
        window.location.href = "/student/dashboard";
      }, 1500);

    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast({ 
        title: "Login error", 
        description: "Something went wrong. Please try again." 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen container max-w-xl py-8">
      <SEO 
        title="Kiosk Mode | Sproutify School" 
        description="Students log in with their name, classroom PIN, and personal student PIN." 
        canonical="/app/kiosk" 
      />
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Login</h1>
        <Button asChild variant="outline">
          <Link to="/app/help#kiosk-mode">Help</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Sign in to your class</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                value={studentName} 
                onChange={(e) => setStudentName(e.target.value)} 
                placeholder="Enter your full name exactly as your teacher has it"
                required 
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Use your full name exactly as your teacher entered it in the class list.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">Classroom PIN</Label>
              <Input 
                id="pin" 
                type="password" 
                value={kioskPin} 
                onChange={(e) => setKioskPin(e.target.value)} 
                placeholder="Ask your teacher for this PIN"
                required 
              />
              <p className="text-xs text-muted-foreground">
                Your teacher will share this PIN with the class.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentPin">Your Student PIN</Label>
              <Input 
                id="studentPin" 
                type="password" 
                value={studentPin} 
                onChange={(e) => setStudentPin(e.target.value)} 
                placeholder="Your personal 4-6 digit PIN"
                maxLength={6}
                required 
              />
              <p className="text-xs text-muted-foreground">
                Your teacher will give you this personal PIN when they add you to the class.
              </p>
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Updated help text */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Make sure your teacher has added you to the class list</li>
            <li>• Check that you're spelling your name exactly as your teacher entered it</li>
            <li>• Ask your teacher for the correct classroom PIN</li>
            <li>• Ask your teacher for your personal student PIN</li>
            <li>• If you're still having trouble, ask your teacher for help</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}