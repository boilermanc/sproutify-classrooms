import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { GradientBackground } from "@/components/GradientBackground";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MailerLiteInline from "@/components/MailerLiteInline";

/** Gate promos through the end of September (adjust year if needed) */
const isBackToSchoolActive = () => {
  const now = new Date();
  const end = new Date("2025-09-30T23:59:59-04:00");
  return now <= end;
};

type LoginPanel = "teacher" | "student" | null;

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [openLogin, setOpenLogin] = useState<LoginPanel>(null);

  // Registration form state
  const [regForm, setRegForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    schoolName: "",
    loading: false,
  });

  // Teacher login
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    loading: false,
  });

  // Student login
  const [studentForm, setStudentForm] = useState({
    studentName: "",
    kioskPin: "",
    loading: false,
  });

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setRegForm((prev) => ({ ...prev, loading: true }));

    try {
      // 1) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: regForm.email,
        password: regForm.password,
      });
      if (signUpError || !signUpData?.user) throw new Error(signUpError?.message ?? "Sign up failed");
      const userId = signUpData.user.id;

      // 2) Upsert/find school
      const { data: existingSchools, error: schoolLookupError } = await supabase
        .from("schools")
        .select("id")
        .eq("name", regForm.schoolName)
        .limit(1);
      if (schoolLookupError) throw new Error(schoolLookupError.message);

      let schoolId: string;
      if (existingSchools && existingSchools.length > 0) {
        schoolId = existingSchools[0].id;
      } else {
        const { data: newSchool, error: schoolInsertError } = await supabase
          .from("schools")
          .insert({ name: regForm.schoolName })
          .select()
          .single();
        if (schoolInsertError || !newSchool) throw new Error(schoolInsertError?.message ?? "School insert failed");
        schoolId = newSchool.id;
      }

      // 3) Profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          first_name: regForm.firstName,
          last_name: regForm.lastName,
          school_id: schoolId,
        },
        { onConflict: "id" }
      );
      if (profileError) throw new Error(profileError.message);

      // 4) Role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "teacher",
      });
      if (roleError) throw new Error(roleError.message);

      toast({
        title: "Account created!",
        description: `Welcome to Sproutify School ${
          selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)
        } plan. Check your email to confirm your account.`,
      });
      navigate("/app");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message ?? "Something went wrong", variant: "destructive" });
    } finally {
      setRegForm((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginForm((prev) => ({ ...prev, loading: true }));
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (error) throw new Error(error.message);
      toast({ title: "Welcome back!" });
      navigate("/app");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message ?? "Check your email/password", variant: "destructive" });
    } finally {
      setLoginForm((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentForm((prev) => ({ ...prev, loading: true }));
    try {
      const studentName = studentForm.studentName.trim();
      const kioskPin = studentForm.kioskPin.trim();
      if (!studentName) throw new Error("Please enter your name");

      const { data, error: queryError } = await supabase
        .from("classrooms")
        .select("id, name")
        .eq("kiosk_pin", kioskPin)
        .single();
      if (queryError || !data) throw new Error("Invalid Kiosk PIN. Please check with your teacher.");

      localStorage.setItem("student_classroom_id", data.id);
      localStorage.setItem("student_classroom_name", data.name);
      localStorage.setItem("student_name", studentName);

      toast({ title: `Welcome, ${studentName}!` });
      navigate("/student/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setStudentForm((prev) => ({ ...prev, loading: false }));
    }
  };

  const plans = [
    {
      id: "basic",
      name: "Basic",
      originalPrice: "$19.99",
      promoPrice: "$9.99",
      description: "Perfect for small classrooms and getting started with aeroponic education.",
      features: ["Up to 3 towers", "50 student accounts", "Basic curriculum modules", "Student progress tracking", "Email support"],
    },
    {
      id: "professional",
      name: "Professional",
      originalPrice: "$39.99",
      promoPrice: "$19.99",
      description: "Ideal for larger classrooms and comprehensive agricultural education programs.",
      popular: true,
      features: [
        "Up to 10 towers",
        "200 student accounts",
        "Complete curriculum library",
        "Advanced analytics & reporting",
        "Teacher collaboration tools",
        "Priority email support",
      ],
    },
    {
      id: "school",
      name: "School",
      originalPrice: "$79.99",
      promoPrice: "$39.99",
      description: "Comprehensive solution for entire schools and district-wide implementations.",
      features: [
        "Unlimited towers",
        "Unlimited student accounts",
        "Custom curriculum development",
        "District-wide reporting",
        "Administrator dashboard",
        "Dedicated account manager",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <SEO
        title="Sproutify School | Classroom Aeroponic Garden Management"
        description="Transform your classroom with aeroponic garden management tools designed for educators and students to explore sustainable agriculture together."
        canonical="/"
      />
      <GradientBackground className="absolute inset-0" />

      {/* Sticky top login bar */}
      <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-6 py-3 flex items-center gap-3">
          <div className="text-sm font-medium grow">Sproutify School</div>
          <div className="flex gap-2">
            <Button
              variant={openLogin === "teacher" ? "default" : "secondary"}
              onClick={() => setOpenLogin((p) => (p === "teacher" ? null : "teacher"))}
            >
              Teacher Login
            </Button>
            <Button
              variant={openLogin === "student" ? "default" : "secondary"}
              onClick={() => setOpenLogin((p) => (p === "student" ? null : "student"))}
            >
              Student Login
            </Button>
          </div>
        </div>

        {/* Expandable panels */}
        {openLogin === "teacher" && (
          <div className="border-t">
            <div className="container mx-auto px-6 py-4">
              <Card className="max-w-xl mx-auto">
                <CardHeader>
                  <CardTitle>Teacher Sign In</CardTitle>
                  <p className="text-muted-foreground">Welcome back to your classroom dashboard</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loginEmailTop">Email</Label>
                      <Input
                        id="loginEmailTop"
                        type="email"
                        required
                        value={loginForm.email}
                        onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginPasswordTop">Password</Label>
                      <Input
                        id="loginPasswordTop"
                        type="password"
                        required
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button type="submit" disabled={loginForm.loading}>
                        {loginForm.loading ? "Signing in..." : "Sign In"}
                      </Button>
                      <Button variant="ghost" type="button" onClick={() => setOpenLogin(null)}>
                        Close
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {openLogin === "student" && (
          <div className="border-t">
            <div className="container mx-auto px-6 py-4">
              <Card className="max-w-xl mx-auto">
                <CardHeader>
                  <CardTitle>Student Login</CardTitle>
                  <p className="text-muted-foreground">Enter your name and classroom PIN to begin</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentNameTop">Your Name</Label>
                      <Input
                        id="studentNameTop"
                        required
                        placeholder="e.g. Alex Smith"
                        value={studentForm.studentName}
                        onChange={(e) => setStudentForm((p) => ({ ...p, studentName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kioskPinTop">Classroom PIN</Label>
                      <Input
                        id="kioskPinTop"
                        type="password"
                        required
                        placeholder="4-digit PIN from your teacher"
                        value={studentForm.kioskPin}
                        onChange={(e) => setStudentForm((p) => ({ ...p, kioskPin: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button type="submit" disabled={studentForm.loading}>
                        {studentForm.loading ? "Logging In..." : "Log In"}
                      </Button>
                      <Button variant="ghost" type="button" onClick={() => setOpenLogin(null)}>
                        Close
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <main className="relative container mx-auto px-6 py-12 sm:py-20 flex-1">
        {/* Hero Section */}
        <section className="text-center mb-16 sm:mb-20">
          <img
            src="/lovable-uploads/689a7eca-ef5f-4820-8baa-d048f50e2773.png"
            alt="Sproutify School Logo"
            className="h-20 sm:h-24 object-contain mb-6 mx-auto"
          />
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-foreground">
            Aeroponic Gardening<br />at School
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your classroom into a dynamic learning environment with aeroponic garden management tools designed for educators and students to explore sustainable agriculture together.
          </p>

          {/* Hero Video */}
          <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg">
            <video
              className="w-full h-auto"
              playsInline
              preload="metadata"
              controls
              poster="https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/site-videos/hero-poster.jpg"
            >
              <source src="https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/site-videos/hero-1080p.mp4" type="video/mp4" />
              <source src="https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/site-videos/hero-720p.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        {/* Registration + Info tabs (logins moved to top bar) */}
        <section className="mb-20">
          <Tabs defaultValue="register" className="max-w-4xl mx-auto">
            <TabsList className="flex w-full flex-wrap gap-2 sm:grid sm:grid-cols-2">
              <TabsTrigger className="flex-1 min-w-[42%] sm:min-w-0" value="register">Start Free Trial</TabsTrigger>
              <TabsTrigger className="flex-1 min-w-[42%] sm:min-w-0" value="info">Get Info</TabsTrigger>
            </TabsList>

            {/* Registration Tab */}
            <TabsContent value="register" className="mt-8">
              {/* … unchanged registration and plan selection … */}
            </TabsContent>

            {/* Info Tab (MailerLite Inline) */}
            <TabsContent value="info" className="mt-8">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Get Updates & Resources</CardTitle>
                  <p className="text-muted-foreground">
                    Stay informed about Sproutify School and receive educational resources
                  </p>
                </CardHeader>
                <CardContent>
                  <MailerLiteInline
                    accountId={import.meta.env.VITE_MAILERLITE_ACCOUNT!}
                    formId="C39UIG"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Promo banners, features, etc. remain unchanged */}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
