// src/pages/auth/StudentLoginPage.tsx - Fixed Version with Student Name + Kiosk PIN

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Loader2 } from "lucide-react";

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentName, setStudentName] = useState("");
  const [kioskPin, setKioskPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Find the classroom by kiosk PIN only
    const { data, error: queryError } = await supabase
      .from("classrooms")
      .select("id, name")
      .eq("kiosk_pin", kioskPin.trim())
      .single();

    if (queryError || !data) {
      console.error("Login failed:", queryError);
      setError("Invalid Kiosk PIN. Please check with your teacher.");
      setLoading(false);
      return;
    }

    // Store student info in localStorage
    localStorage.setItem("student_classroom_id", data.id);
    localStorage.setItem("student_classroom_name", data.name);
    localStorage.setItem("student_name", studentName.trim());
    
    toast({ title: `Welcome, ${studentName}!` });

    navigate("/student/dashboard");
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <SEO title="Student Login | Sproutify School" />
      <div className="w-full max-w-md">

        {/* Logo Link back to Home Page */}
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
            <CardTitle className="text-2xl">Student Login</CardTitle>
            <CardDescription>Enter your name and your classroom's PIN to begin.</CardDescription>
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
                <Input
                  id="kioskPin"
                  type="password"
                  value={kioskPin}
                  onChange={(e) => setKioskPin(e.target.value)}
                  placeholder="4-digit PIN from your teacher"
                  required
                />
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