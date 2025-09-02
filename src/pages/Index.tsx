import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { GradientBackground } from "@/components/GradientBackground";
import { Footer } from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    loading: false
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    loading: false
  });

  // Student form state
  const [studentForm, setStudentForm] = useState({
    studentName: "",
    joinCode: "",
    loading: false
  });

  // Email signup form state
  const [emailForm, setEmailForm] = useState({
    email: "",
    firstName: "",
    schoolName: "",
    loading: false
  });

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    
    setRegForm(prev => ({ ...prev, loading: true }));
    
    try {
      // 1) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
        email: regForm.email, 
        password: regForm.password 
      });
      if (signUpError || !signUpData?.user) {
        throw new Error(signUpError?.message ?? "Sign up failed");
      }
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

      // 3) Profile - Use UPSERT to handle existing records
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        first_name: regForm.firstName,
        last_name: regForm.lastName,
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

      toast({ 
        title: "Account created!", 
        description: `Welcome to Sproutify School ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan. Check your email to confirm your account.`
      });
      navigate("/app");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message ?? "Something went wrong", variant: "destructive" });
    } finally {
      setRegForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginForm(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: loginForm.email, 
        password: loginForm.password 
      });
      if (error) throw new Error(error.message);
      toast({ title: "Welcome back!" });
      navigate("/app");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message ?? "Check your email/password", variant: "destructive" });
    } finally {
      setLoginForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentForm(prev => ({ ...prev, loading: true }));
    
    try {
      const joinCode = studentForm.joinCode.trim().toUpperCase();
      const studentName = studentForm.studentName.trim();

      if (!studentName) {
        throw new Error("Please enter your name");
      }

      // Query join_codes table for active code
      const { data: codes, error: codeError } = await supabase
        .from("join_codes")
        .select("classroom_id, is_active")
        .eq("code", joinCode)
        .eq("is_active", true)
        .limit(1);

      if (codeError) {
        throw new Error(codeError.message);
      }

      const classroomId = codes?.[0]?.classroom_id;
      if (!classroomId) {
        throw new Error("Invalid code. Ask your teacher for a new code.");
      }

      // Insert student into the classroom
      const { error: insertError } = await supabase
        .from("students")
        .insert({ display_name: studentName, classroom_id: classroomId });

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Store student info and navigate to student dashboard
      localStorage.setItem("student_classroom_id", classroomId);
      localStorage.setItem("student_display_name", studentName);
      
      toast({ title: "You're in!", description: "Welcome to the class garden." });
      navigate("/student/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setStudentForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailForm(prev => ({ ...prev, loading: true }));
    
    // Simulate API call - in real implementation, this would add to email list
    setTimeout(() => {
      toast({ 
        title: "Thanks for your interest!", 
        description: "We'll keep you updated on Sproutify School and send you educational resources."
      });
      setEmailForm(prev => ({ ...prev, loading: false }));
      // Reset form
      setEmailForm({
        email: "",
        firstName: "",
        schoolName: "",
        loading: false
      });
    }, 1500);
  };

  const plans = [
    {
      id: "basic",
      name: "Basic",
      originalPrice: "$19.99",
      promoPrice: "$9.99", 
      description: "Perfect for small classrooms and getting started with aeroponic education.",
      features: ["Up to 3 towers", "50 student accounts", "Basic curriculum modules", "Student progress tracking", "Email support"]
    },
    {
      id: "professional", 
      name: "Professional",
      originalPrice: "$39.99",
      promoPrice: "$19.99",
      description: "Ideal for larger classrooms and comprehensive agricultural education programs.",
      popular: true,
      features: ["Up to 10 towers", "200 student accounts", "Complete curriculum library", "Advanced analytics & reporting", "Teacher collaboration tools", "Priority email support"]
    },
    {
      id: "school",
      name: "School", 
      originalPrice: "$79.99",
      promoPrice: "$39.99",
      description: "Comprehensive solution for entire schools and district-wide implementations.",
      features: ["Unlimited towers", "Unlimited student accounts", "Custom curriculum development", "District-wide reporting", "Administrator dashboard", "Dedicated account manager"]
    }
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

            {/* Registration Tab */}
            <TabsContent value="register" className="mt-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Registration Form */}
                <Card className="order-2 lg:order-1">
                  <CardHeader>
                    <CardTitle>Create Your Teacher Account</CardTitle>
                    <p className="text-muted-foreground">Start your free trial with the {plans.find(p => p.id === selectedPlan)?.name} plan</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegistration} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First name</Label>
                          <Input 
                            id="firstName" 
                            required 
                            value={regForm.firstName}
                            onChange={(e) => setRegForm(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last name</Label>
                          <Input 
                            id="lastName" 
                            required 
                            value={regForm.lastName}
                            onChange={(e) => setRegForm(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          required 
                          value={regForm.email}
                          onChange={(e) => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schoolName">School name</Label>
                        <Input 
                          id="schoolName" 
                          required 
                          value={regForm.schoolName}
                          onChange={(e) => setRegForm(prev => ({ ...prev, schoolName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          required 
                          value={regForm.password}
                          onChange={(e) => setRegForm(prev => ({ ...prev, password: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          required 
                          value={regForm.confirmPassword}
                          onChange={(e) => setRegForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={regForm.loading}>
                        {regForm.loading ? "Creating Account..." : `Start 7-Day Free Trial - ${plans.find(p => p.id === selectedPlan)?.name}`}
                      </Button>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        Then 50% off for first 3 months • Cancel anytime
                      </p>
                    </form>
                  </CardContent>
                </Card>

                {/* Plan Selection */}
                <div className="order-1 lg:order-2">
                  <h3 className="text-xl font-semibold mb-4">Choose Your Plan</h3>
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <Card 
                        key={plan.id}
                        className={`cursor-pointer transition-all ${
                          selectedPlan === plan.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
                        } ${plan.popular ? 'border-secondary' : ''}`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {plan.name}
                                {plan.popular && <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground line-through">{plan.originalPrice}</span>
                                <p className="text-2xl font-bold text-green-600">{plan.promoPrice}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                                <Badge variant="destructive" className="text-xs">50% OFF</Badge>
                              </div>
                              <p className="text-xs text-green-600 font-medium">7-day FREE trial</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${selectedPlan === plan.id ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                          <ul className="text-xs text-muted-foreground">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx}>• {feature}</li>
                            ))}
                            {plan.features.length > 3 && <li>• +{plan.features.length - 3} more features</li>}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-8">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Teacher Sign In</CardTitle>
                  <p className="text-muted-foreground">Welcome back to your classroom dashboard</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loginEmail">Email</Label>
                      <Input 
                        id="loginEmail" 
                        type="email" 
                        required 
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginPassword">Password</Label>
                      <Input 
                        id="loginPassword" 
                        type="password" 
                        required 
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loginForm.loading}>
                      {loginForm.loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Login Tab */}
            <TabsContent value="student" className="mt-8">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Student Login</CardTitle>
                  <p className="text-muted-foreground">Enter your name and class join code to begin</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Your Name</Label>
                      <Input 
                        id="studentName" 
                        required 
                        placeholder="e.g. Alex Smith"
                        value={studentForm.studentName}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, studentName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinCode">Join Code</Label>
                      <Input 
                        id="joinCode" 
                        required 
                        placeholder="Enter code from teacher"
                        value={studentForm.joinCode}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, joinCode: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={studentForm.loading}>
                      {studentForm.loading ? "Joining Class..." : "Join Class"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Signup Tab */}
            <TabsContent value="info" className="mt-8">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Get Updates & Resources</CardTitle>
                  <p className="text-muted-foreground">Stay informed about Sproutify School and receive educational resources</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="infoEmail">Email Address</Label>
                      <Input 
                        id="infoEmail" 
                        type="email" 
                        required 
                        placeholder="teacher@school.edu"
                        value={emailForm.email}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="infoFirstName">First Name</Label>
                      <Input 
                        id="infoFirstName" 
                        required 
                        placeholder="Jane"
                        value={emailForm.firstName}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="infoSchoolName">School Name</Label>
                      <Input 
                        id="infoSchoolName" 
                        required 
                        placeholder="Springfield Elementary"
                        value={emailForm.schoolName}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, schoolName: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={emailForm.loading}>
                      {emailForm.loading ? "Subscribing..." : "Join Our Educator Community"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Get early access updates, curriculum resources, and educational tips. No spam, unsubscribe anytime.
                    </p>
                  </form>
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

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Educational Tools for Every Classroom</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Empower your students with hands-on learning through our aeroponic management platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Classroom Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Set up and track multiple vertical aeroponic gardens and classes for each teacher.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>→ Create and organize classes with aeroponic gardens</li>
                  <li>→ Invite students to join a specific class</li>
                  <li>→ Track individual and group progress across all classes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Tower Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Monitor and maintain your aeroponic towers with comprehensive tracking tools.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>→ Real-time tower status monitoring</li>
                  <li>→ Water level, nutrient, and pH tracking with student logs</li>
                  <li>→ System troubleshooting guides and educational resources</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Plant & Harvest Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Guide students through the complete growing cycle from seed to harvest.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>→ Planting schedules and seed-to-harvest timeline tracking</li>
                  <li>→ Harvest recording with weight, quality, and yield data</li>
                  <li>→ Growth stage documentation with photos and observations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Student Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Motivate students with gamified learning through achievement tracking and friendly competition.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>→ Achievement badges for garden care and learning milestones</li>
                  <li>→ Class challenges and seasonal growing competitions</li>
                  <li>→ Progress tracking with individual and team recognition</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Interactive Plant Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access a comprehensive database of plants with growing guides and educational content.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>→ Extensive plant database with growing specifications</li>
                  <li>→ Educational content about plant biology and nutrition</li>
                  <li>→ Seasonal planting recommendations and crop rotation guides</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Curriculum Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Seamlessly integrate garden activities with science, math, and environmental studies curricula.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>→ Standards-aligned lesson plans and educational activities</li>
                  <li>→ Data collection projects for math and science integration</li>
                  <li>→ Assessment tools and student portfolio management</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Back to School Promo */}
        <section className="text-center mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Badge className="mb-4 bg-secondary text-secondary-foreground">Back to School Special</Badge>
              <h3 className="text-2xl font-bold mb-2">50% Off First 3 Months</h3>
              <p className="text-muted-foreground mb-4">
                Start your classroom garden journey with our special back-to-school pricing. Valid through September 2025.
              </p>
              <p className="text-sm text-muted-foreground">
                7-day free trial, then 50% off your chosen plan for the first 3 months
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;