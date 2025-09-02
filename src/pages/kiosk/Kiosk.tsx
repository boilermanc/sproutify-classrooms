// src/pages/kiosk/Kiosk.tsx - Updated for new student management system

import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
const sb = supabase as any;
import { Link } from "react-router-dom";

export default function Kiosk() {
  const { toast } = useToast();
  const [studentName, setStudentName] = useState("");
  const [kioskPin, setKioskPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successName, setSuccessName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessName(null);

    const name = studentName.trim();
    const pin = kioskPin.trim();

    // Basic validation
    if (!name) {
      toast({ title: "Enter your name", description: "Please enter your full name as your teacher has it listed." });
      setSubmitting(false);
      return;
    }

    if (!pin) {
      toast({ title: "Enter classroom PIN", description: "Ask your teacher for the classroom PIN." });
      setSubmitting(false);
      return;
    }

    try {
      // Step 1: Find classroom by PIN
      const { data: classroom, error: classroomErr } = await sb
        .from("classrooms")
        .select("id, name")
        .eq("kiosk_pin", pin)
        .single();

      if (classroomErr || !classroom) {
        console.error("Classroom lookup failed:", classroomErr);
        toast({ 
          title: "Invalid PIN", 
          description: "That PIN doesn't match any classroom. Please check with your teacher." 
        });
        setSubmitting(false);
        return;
      }

      // Step 2: Check if student exists in this classroom
      const { data: student, error: studentErr } = await sb
        .from("students")
        .select("id, display_name, has_logged_in")
        .eq("classroom_id", classroom.id)
        .eq("display_name", name)
        .single();

      if (studentErr || !student) {
        console.error("Student lookup failed:", studentErr);
        toast({ 
          title: "Student not found", 
          description: `We couldn't find "${name}" in ${classroom.name}. Please check the spelling or ask your teacher to add you to the class.` 
        });
        setSubmitting(false);
        return;
      }

      // Step 3: Update login tracking
      const isFirstLogin = !student.has_logged_in;
      const now = new Date().toISOString();
      
      const { error: updateErr } = await sb
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

      // Success!
      setSuccessName(name);
      setStudentName("");
      setKioskPin("");
      
      const welcomeMessage = isFirstLogin 
        ? `Welcome to ${classroom.name}, ${name}! This is your first time logging in.`
        : `Welcome back to ${classroom.name}, ${name}!`;
      
      toast({ 
        title: "Login successful!", 
        description: welcomeMessage 
      });

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
        description="Students log in with their name and classroom PIN." 
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
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
            {successName && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Success!</strong> {successName}, you're now logged in. 
                  You can hand the device to the next student or continue using the garden features.
                </p>
              </div>
            )}
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
            <li>• If you're still having trouble, ask your teacher for help</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}