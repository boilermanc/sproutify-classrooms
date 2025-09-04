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
import MailerLiteEmbed from "@/components/MailerLiteEmbed";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("professional");

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

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    loading: false,
  });

  // Student form state
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
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: regForm.email,
        password: regForm.password,
      });
      if (signUpError || !signUpData?.user) {
        throw new Error(signUpError?.message ?? "Sign up failed");
      }
      const userId = signUpData.user.id;

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
        if (schoolInsertError || !newSchool)
          throw new Error(schoolInsertError?.message ?? "School insert failed");
        schoolId = newSchool.id;
      }

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
      toast({
        title: "Signup failed",
        description: err.message ?? "Something went wrong",
        variant: "destructive",
      });
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
      toast({
        title: "Sign in failed",
        description: err.message ?? "Check your email/password",
        variant: "destructive",
      });
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

      if (queryError || !data) {
        throw new Error("Invalid Kiosk PIN. Please check with your teacher.");
      }

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

      <main className="relative container mx-auto px-6 py-16 sm:py-24 flex-1">
        {/* Hero Section */}
        <section className="text-center mb-20">
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
              <source
                src="https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/site-videos/hero-1080p.mp4"
                type="video/mp4"
              />
              <source
                src="https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/site-videos/hero-720p.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        {/* Auth Section */}
        <section className="mb-20">
          <Tabs defaultValue="register" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="register">Start Free Trial</TabsTrigger>
              <TabsTrigger value="login">Teacher Login</TabsTrigger>
              <TabsTrigger value="student">Student Login</TabsTrigger>
              <TabsTrigger value="info">Get Info</TabsTrigger>
            </TabsList>

            {/* Registration Tab ... unchanged */}
            {/* Login Tab ... unchanged */}
            {/* Student Login Tab ... unchanged */}

            {/* Info Tab with MailerLite embed */}
            <TabsContent value="info" className="mt-8">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Get Updates & Resources</CardTitle>
                  <p className="text-muted-foreground">
                    Stay informed about Sproutify School and receive educational resources
                  </p>
                </CardHeader>
                <CardContent>
                  <MailerLiteEmbed formId="C39UIG" inline />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Back to School Promo Banner */}
        <section className="text-center mb-12">
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20 max-w-3xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge className="bg-red-500 text-white">Limited Time</Badge>
                <Badge className="bg-green-500 text-white">Back to School</Badge>
              </div>
              <h3 className="text-xl font-bold mb-2">50% Off First 3 Months + 7-Day Free Trial</h3>
              <p className="text-muted-foreground text-sm">
                Start your classroom garden journey with our special back-to-school pricing. Valid through September 2025.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Features Section ... unchanged */}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
