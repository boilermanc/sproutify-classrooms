// src/pages/auth/StudentLoginPage.tsx

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
  const [className, setClassName] = useState("");
  const [kioskPin, setKioskPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("classrooms")
      .select("id, name")
      .eq("name", className.trim())
      .eq("kiosk_pin", kioskPin.trim())
      .single();

    if (queryError || !data) {
      console.error("Login failed:", queryError);
      setError("Invalid Classroom Name or PIN. Please check with your teacher.");
      setLoading(false);
      return;
    }

    localStorage.setItem("student_classroom_id", data.id);
    localStorage.setItem("student_classroom_name", data.name);
    
    toast({ title: `Welcome, ${data.name}!` });

    navigate("/student/dashboard");
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <SEO title="Student Login | Sproutify School" />
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Student & Team Login or something</CardTitle>
            <CardDescription>Enter your class name and PIN to begin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="className">Classroom Name</Label>
                <Input
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. The Mighty Growers"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kioskPin">Kiosk PIN</Label>
                <Input
                  id="kioskPin"
                  type="password"
                  value={kioskPin}
                  onChange={(e) => setKioskPin(e.target.value)}
                  placeholder="4-digit PIN"
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
          {/* THIS IS THE CORRECTED LINE */}
          <Link to="/auth/login" className="underline">
            Teacher Login
          </Link>
        </div>
      </div>
    </div>
  );
}
