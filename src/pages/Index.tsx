import { useState, useEffect } from "react";
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
import { findClassroomByPin } from "@/utils/kiosk-login";
import { Eye, EyeOff } from "lucide-react";
import { sendRegistrationWebhook } from "@/utils/webhooks";

/**
 * MailerLiteForm Component
 * Encapsulates the MailerLite form's styles, markup, and script logic.
 */
const MailerLiteForm = () => {
  useEffect(() => {
    // Add MailerLite's font stylesheet to the document head
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.type = 'text/css';
    fontLink.href = 'https://assets.mlcdn.com/fonts.css?version=1756385';
    document.head.appendChild(fontLink);

    // The external MailerLite script calls this function on success.
    // We must define it on the window object to make it globally accessible.
    (window as any).ml_webform_success_30265605 = function () {
      const successMsg = document.querySelector('.ml-subscribe-form-30265605 .row-success');
      const form = document.querySelector('.ml-subscribe-form-30265605 .row-form');
      if (successMsg) (successMsg as HTMLElement).style.display = 'block';
      if (form) (form as HTMLElement).style.display = 'none';
    };

    // Create and append the main MailerLite webforms script to the body
    const script = document.createElement('script');
    script.src = 'https://groot.mailerlite.com/js/w/webforms.min.js?v176e10baa5e7ed80d35ae235be3d5024';
    script.async = true;
    document.body.appendChild(script);

    // Trigger the tracking fetch call
    fetch("https://assets.mailerlite.com/jsonp/829365/forms/164107087019771240/takel").catch(console.error);

    // Cleanup function to run when the component unmounts
    return () => {
      if (document.head.contains(fontLink)) {
        document.head.removeChild(fontLink);
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete (window as any).ml_webform_success_30265605;
    };
  }, []);

  const mailerLiteCSS = `
    .ml-form-embedSubmitLoad { display: inline-block; width: 20px; height: 20px; }
    .g-recaptcha { transform: scale(1); -webkit-transform: scale(1); transform-origin: 0 0; -webkit-transform-origin: 0 0; height: ; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
    .ml-form-embedSubmitLoad:after { content: " "; display: block; width: 11px; height: 11px; margin: 1px; border-radius: 50%; border: 4px solid #fff; border-color: #ffffff #ffffff #ffffff transparent; animation: ml-form-embedSubmitLoad 1.2s linear infinite; }
    @keyframes ml-form-embedSubmitLoad { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    #mlb2-30265605.ml-form-embedContainer { box-sizing: border-box; display: table; margin: 0 auto; position: static; width: 100% !important; }
    #mlb2-30265605.ml-form-embedContainer h4, #mlb2-30265605.ml-form-embedContainer p, #mlb2-30265605.ml-form-embedContainer span, #mlb2-30265605.ml-form-embedContainer button { text-transform: none !important; letter-spacing: normal !important; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper { background-color: transparent; border-width: 0px; border-color: transparent; border-radius: 4px; border-style: solid; box-sizing: border-box; display: inline-block !important; margin: 0; padding: 0; position: relative; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper.embedPopup, #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper.embedDefault { width: 400px; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper.embedForm { max-width: 400px; width: 100%; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-align-left { text-align: left; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-align-center { text-align: center; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-align-default { display: table-cell !important; vertical-align: middle !important; text-align: center !important; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-align-right { text-align: right; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedHeader img { border-top-left-radius: 4px; border-top-right-radius: 4px; height: auto; margin: 0 auto !important; max-width: 100%; width: undefinedpx; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody, #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody { padding: 20px 20px 0 20px; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody.ml-form-embedBodyHorizontal { padding-bottom: 0; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent, #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent { text-align: left; margin: 0 0 20px 0; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent h4, #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent h4 { color: inherit; font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; text-align: left; word-break: break-word; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent p, #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p { color: inherit; font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 400; line-height: 20px; margin: 0 0 10px 0; text-align: left; opacity: 0.7; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group label { margin-bottom: 5px; color: #333333; font-size: 14px; font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-weight: bold; font-style: normal; text-decoration: none;; display: inline-block; line-height: 20px; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent p:last-child, #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p:last-child { margin: 0; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody form { margin: 0; width: 100%; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent, #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow { margin: 0 0 20px 0; width: 100%; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow { margin: 0 0 10px 0; width: 100%; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow input { background-color: #ffffff !important; color: #333333 !important; border-color: #cccccc; border-radius: 4px !important; border-style: solid !important; border-width: 1px !important; font-family: 'Open Sans', Arial, Helvetica, sans-serif; font-size: 14px !important; height: auto; line-height: 21px !important; margin-bottom: 0; margin-top: 0; margin-left: 0; margin-right: 0; padding: 10px 10px !important; width: 100% !important; box-sizing: border-box !important; max-width: 100% !important; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit { margin: 0 0 20px 0; float: left; width: 100%; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button { background-color: #000000 !important; border: none !important; border-radius: 4px !important; box-shadow: none !important; color: #ffffff !important; cursor: pointer; font-family: 'Open Sans', Arial, Helvetica, sans-serif !important; font-size: 14px !important; font-weight: 700 !important; line-height: 21px !important; height: auto; padding: 10px !important; width: 100% !important; box-sizing: border-box !important; }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button:hover { background-color: #333333 !important; }
    .ml-error input { border-color: red!important; }
    @media only screen and (max-width: 400px) { .ml-form-embedWrapper.embedDefault, .ml-form-embedWrapper.embedPopup { width: 100%!important; } }
    #mlb2-30265605.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedPermissions .ml-form-embedPermissionsContent p { font-size: 12px !important; line-height: 18px !important; }
  `;
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mailerLiteCSS }} />
      <div id="mlb2-30265605" className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-30265605">
        <div className="ml-form-align-center">
          <div className="ml-form-embedWrapper embedForm">
            <div className="ml-form-embedBody ml-form-embedBodyDefault row-form">
              <div className="ml-form-embedContent" style={{}}>
                <h4>Ready to Transform Your Classroom?</h4>
                <p>
                  Join the waitlist for Sproutify School and be the first to access our educational aeroponic platform designed for teachers and students.
                </p>
              </div>
              <form className="ml-block-form" action="https://assets.mailerlite.com/jsonp/829365/forms/164107087019771240/subscribe" data-code="" method="post" target="_blank">
                <div className="ml-form-formContent">
                  <div className="ml-form-fieldRow">
                    <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                      <input aria-label="email" aria-required="true" type="email" className="form-control" data-inputmask="" name="fields[email]" placeholder="Email" autoComplete="email" />
                    </div>
                  </div>
                  <div className="ml-form-fieldRow">
                    <div className="ml-field-group ml-field-name ml-validate-required">
                      <input aria-label="name" aria-required="true" type="text" className="form-control" data-inputmask="" name="fields[name]" placeholder="First Name" autoComplete="given-name" />
                    </div>
                  </div>
                  <div className="ml-form-fieldRow ml-last-item">
                    <div className="ml-field-group ml-field-school_name ml-validate-required">
                      <input aria-label="school_name" aria-required="true" type="text" className="form-control" data-inputmask="" name="fields[school_name]" placeholder="School Name" autoComplete="" />
                    </div>
                  </div>
                </div>
                <input type="hidden" name="ml-submit" value="1" />
                <div className="ml-form-embedSubmit">
                  <button type="submit" className="primary">Join Waitlist</button>
                  <button disabled={true} style={{ display: "none" }} type="button" className="loading">
                    <div className="ml-form-embedSubmitLoad"></div>
                    <span className="sr-only">Loading...</span>
                  </button>
                </div>
                <input type="hidden" name="anticsrf" value="true" />
              </form>
            </div>
            <div className="ml-form-successBody row-success" style={{ display: "none" }}>
              <div className="ml-form-successContent">
                <h4>Thank you!</h4>
                <p>You have successfully joined our waitlist.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function to generate district join codes
const generateDistrictJoinCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/** Gate promos through the end of September (adjust year if needed) */
const isBackToSchoolActive = () => {
  const now = new Date();
  const end = new Date("2025-09-30T23:59:59-04:00");
  return now <= end;
};

type LoginPanel = "teacher" | "student" | "info" | null;

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual"); // Default to annual
  const [schoolDistrictTab, setSchoolDistrictTab] = useState<"school" | "district">("school");
  const [openLogin, setOpenLogin] = useState<LoginPanel>(null);

  // Registration form state
  const [regForm, setRegForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    schoolName: "",
    districtJoinCode: "",
    loading: false,
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Teacher login
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    loading: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  // Student login
  const [studentForm, setStudentForm] = useState({
    studentName: "",
    kioskPin: "",
    studentPin: "",
    loading: false,
  });
  const [showStudentKioskPin, setShowStudentKioskPin] = useState(false);
  const [showStudentStudentPin, setShowStudentStudentPin] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginForm((prev) => ({ ...prev, loading: true }));
    
    // Basic validation
    if (!loginForm.email.trim()) {
      toast({ 
        title: "Email required", 
        description: "Please enter your email address", 
        variant: "destructive" 
      });
      setLoginForm((prev) => ({ ...prev, loading: false }));
      return;
    }
    
    if (!loginForm.password.trim()) {
      toast({ 
        title: "Password required", 
        description: "Please enter your password", 
        variant: "destructive" 
      });
      setLoginForm((prev) => ({ ...prev, loading: false }));
      return;
    }
    
    try {
      console.log('Attempting login with email:', loginForm.email);
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });
      if (error) {
        console.error('Supabase auth error:', error);
        throw new Error(error.message);
      }
      
      toast({ title: "Welcome back!" });
      
      // Check user role to determine correct redirect path
      if (user) {
        // First check if user is super_admin or staff
        const { data: teamMember, error: teamMemberError } = await supabase
          .from("team_members")
          .select("role, active")
          .eq("user_id", user.id)
          .eq("active", true)
          .maybeSingle();

        // If no error and we have a team member, redirect to admin
        if (!teamMemberError && teamMember && (teamMember.role === "super_admin" || teamMember.role === "staff")) {
          navigate("/admin");
          return;
        }

        // Check regular user roles
        const [{ data: profile }, { data: roles }] = await Promise.all([
          supabase.from("profiles").select("id, district_id, school_id").eq("id", user.id).single(),
          supabase.from("user_roles").select("role").eq("user_id", user.id)
        ]);

        const userRoles = roles?.map(r => r.role) || [];
        
        if (userRoles.includes("district_admin") && profile?.district_id) {
          navigate("/district");
        } else if (userRoles.includes("school_admin") && profile?.school_id) {
          navigate("/school");
        } else {
          navigate("/app");
        }
      } else {
        navigate("/app");
      }
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
      const studentPin = studentForm.studentPin.trim();
      
      if (!studentName) throw new Error("Please enter your name");
      if (!kioskPin) throw new Error("Please enter the Classroom PIN");
      if (!studentPin) throw new Error("Please enter your student PIN");
      if (!/^\d{4}$/.test(kioskPin)) throw new Error("Classroom PIN must be exactly 4 digits");
      if (!/^\d{4,6}$/.test(studentPin)) throw new Error("Student PIN must be 4-6 digits");

      // Use direct fetch for kiosk login
      const { data: classroom, error: classroomErr } = await findClassroomByPin(kioskPin);
      if (classroomErr || !classroom) throw new Error("Invalid Classroom PIN. Please check with your teacher.");

      // Check if student exists in this classroom with matching PIN
      const { data: student, error: studentErr } = await supabase
        .from("students")
        .select("id, display_name, has_logged_in, student_pin")
        .eq("classroom_id", classroom.id)
        .eq("display_name", studentName)
        .single();

      if (studentErr || !student) {
        throw new Error(`We couldn't find a student named "${studentName}" in ${classroom.name}. Please check your name spelling, or ask your teacher for help.`);
      }

      // Verify the student PIN matches
      if (student.student_pin !== studentPin) {
        throw new Error(`The PIN you entered doesn't match the PIN for "${studentName}". Please check with your teacher.`);
      }

      // Update login tracking
      const isFirstLogin = !student.has_logged_in;
      const now = new Date().toISOString();
      
      const { error: updateErr } = await supabase
        .from("students")
        .update({
          has_logged_in: true,
          first_login_at: isFirstLogin ? now : undefined,
          last_login_at: now
        })
        .eq("id", student.id);

      if (updateErr) {
        throw new Error("Could not record your login. Please try again.");
      }

      localStorage.setItem("student_classroom_id", classroom.id);
      localStorage.setItem("student_classroom_name", classroom.name);
      localStorage.setItem("student_name", studentName);

      toast({ title: `Welcome, ${studentName}!` });
      navigate("/student/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setStudentForm((prev) => ({ ...prev, loading: false }));
    }
  };

  // Helper function to get plan limits
  const getPlanLimits = (planId: string) => {
    switch (planId) {
      case "basic":
        return { max_towers: 1, max_students: 15 };
      case "professional":
        return { max_towers: 3, max_students: 999999 }; // "Unlimited" students
      case "school":
        return { max_towers: 999999, max_students: 999999 }; // "Unlimited"
      default:
        return { max_towers: 1, max_students: 15 };
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    
    // Add password validation
    if (regForm.password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    
    // Add email validation
    if (!regForm.email.trim()) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    
    // Add name validation
    if (!regForm.firstName.trim() || !regForm.lastName.trim()) {
      toast({ title: "Name required", description: "Please enter your first and last name.", variant: "destructive" });
      return;
    }
    
    // Add school name validation
    if (!regForm.schoolName.trim()) {
      toast({ title: "School name required", description: "Please enter your school name.", variant: "destructive" });
      return;
    }
    
    setRegForm((prev) => ({ ...prev, loading: true }));

    try {
      // 1) Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: regForm.email.trim(),
        password: regForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login`
        }
      });
      if (signUpError) {
        console.error('Supabase signup error:', signUpError);
        throw new Error(signUpError.message ?? "Sign up failed");
      }
      
      // Check if user needs email confirmation
      if (signUpData.user && !signUpData.user.email_confirmed_at) {
        toast({ 
          title: "Check your email", 
          description: "We've sent you a confirmation link. Please check your email and click the link to activate your account." 
        });
        setRegForm((prev) => ({ ...prev, loading: false }));
        return;
      }
      
      if (!signUpData?.user) {
        throw new Error("Sign up failed - no user created");
      }
      const userId = signUpData.user.id;

      // Calculate trial end date (7 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      // Check if this is a district registration (School plan + District tab selected)
      const isDistrictRegistration = selectedPlan === "school" && schoolDistrictTab === "district";

      if (isDistrictRegistration) {
        // DISTRICT REGISTRATION FLOW
        
        // 2) Create district
        const joinCode = generateDistrictJoinCode();
        const { data: newDistrict, error: districtError } = await supabase
          .from("districts")
          .insert({
            name: regForm.schoolName, // Using schoolName field for district name
            join_code: joinCode,
            contact_email: regForm.email,
            max_teachers: 999999, // Unlimited for now
            subscription_status: 'trial',
            subscription_tier: 'district',
            trial_start_date: new Date().toISOString(),
            trial_end_date: trialEndsAt.toISOString(),
          })
          .select()
          .single();
        if (districtError || !newDistrict) throw new Error(districtError?.message ?? "District creation failed");

        // 3) Create profile for district admin
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            first_name: regForm.firstName,
            last_name: regForm.lastName,
            district_id: newDistrict.id,
            // Subscription fields
            subscription_status: 'trial',
            subscription_plan: `school_${billingPeriod}`, // Same plan, different role
            trial_ends_at: trialEndsAt.toISOString(),
            max_towers: 999999,
            max_students: 999999,
            // Initialize Stripe fields as null
            stripe_customer_id: null,
            stripe_subscription_id: null,
            subscription_ends_at: null,
            // Set default avatar
            avatar_url: "https://rsndonfydqhykowljuyn.supabase.co/storage/v1/object/public/avatars/3ed72cee-a334-4c41-ba1d-49437aa1144f/BCO.52a99b16-ea69-4a75-93cd-dbdd2eda7c65.png"
          },
          { onConflict: "id" }
        );
        if (profileError) throw new Error(profileError.message);

        // 4) Assign district_admin role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: "district_admin",
        });
        if (roleError) throw new Error(roleError.message);

        toast({
          title: "District Account created!",
          description: `Welcome to Sproutify School District plan. Your 7-day free trial has started!`,
        });

      } else {
        // SCHOOL REGISTRATION FLOW (Basic, Professional, or School plan)
        
        // 2) Handle district lookup if join code provided
        let districtId: string | null = null;
        if (regForm.districtJoinCode.trim()) {
          const { data: district, error: districtError } = await supabase
            .from("districts")
            .select("id")
            .eq("join_code", regForm.districtJoinCode.trim())
            .single();
          
          if (districtError || !district) {
            throw new Error("Invalid district join code. Please check with your district administrator.");
          }
          districtId = district.id;
        }
        
        // 3) Upsert/find school
        const { data: existingSchools, error: schoolLookupError } = await supabase
          .from("schools")
          .select("id, district_id")
          .eq("name", regForm.schoolName)
          .limit(1);
        if (schoolLookupError) throw new Error(schoolLookupError.message);

        let schoolId: string;
        if (existingSchools && existingSchools.length > 0) {
          schoolId = existingSchools[0].id;
          
          // If school exists but doesn't have district_id and we have one, update it
          if (districtId && !existingSchools[0].district_id) {
            const { error: updateError } = await supabase
              .from("schools")
              .update({ district_id: districtId })
              .eq("id", schoolId);
            if (updateError) console.warn("Failed to link school to district:", updateError);
          }
        } else {
          const { data: newSchool, error: schoolInsertError } = await supabase
            .from("schools")
            .insert({ 
              name: regForm.schoolName,
              district_id: districtId // Link new school to district if provided
            })
            .select()
            .single();
          if (schoolInsertError || !newSchool) throw new Error(schoolInsertError?.message ?? "School insert failed");
          schoolId = newSchool.id;
        }

        // 4) Get plan limits
        const planLimits = getPlanLimits(selectedPlan);

        // 5) Profile with subscription setup including billing period
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            first_name: regForm.firstName,
            last_name: regForm.lastName,
            school_id: schoolId,
            district_id: districtId, // Include district_id if provided
            // Subscription fields
            subscription_status: 'trial',
            subscription_plan: `${selectedPlan}_${billingPeriod}`,
            billing_period: billingPeriod, // Add billing period
            trial_ends_at: trialEndsAt.toISOString(),
            max_towers: planLimits.max_towers,
            max_students: planLimits.max_students,
            // Initialize Stripe fields as null (will be set when they actually subscribe)
            stripe_customer_id: null,
            stripe_subscription_id: null,
            subscription_ends_at: null,
            // Set default avatar
            avatar_url: "https://rsndonfydqhykowljuyn.supabase.co/storage/v1/object/public/avatars/3ed72cee-a334-4c41-ba1d-49437aa1144f/BCO.52a99b16-ea69-4a75-93cd-dbdd2eda7c65.png"
          },
          { onConflict: "id" }
        );
        if (profileError) throw new Error(profileError.message);

        // 6) Role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: "teacher",
        });
        if (roleError) throw new Error(roleError.message);

        const planName = plans.find((p) => p.id === selectedPlan)?.name;
        const period = billingPeriod === "annual" ? "Annual" : "Monthly";
        
        toast({
          title: "Account created!",
          description: `Welcome to Sproutify School ${planName} ${period} plan. Your 7-day free trial has started!`,
        });
      }
      
      // Send registration webhook to n8n
      try {
        await sendRegistrationWebhook({
          id: userId,
          email: regForm.email,
          firstName: regForm.firstName,
          lastName: regForm.lastName,
          schoolName: regForm.schoolName,
          plan: selectedPlan as 'basic' | 'professional' | 'school' | 'district',
          trialEndsAt: trialEndsAt.toISOString(),
        });
      } catch (webhookError) {
        console.error('Failed to send registration webhook:', webhookError);
        // Don't fail the registration if webhook fails
      }
      
      navigate("/app");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message ?? "Something went wrong", variant: "destructive" });
    } finally {
      setRegForm((prev) => ({ ...prev, loading: false }));
    }
  };

  const plans = [
    {
      id: "basic",
      name: "Basic",
      monthlyPrice: "$9.99",
      annualPrice: "$107.88",
      originalMonthlyPrice: "$19.99",
      originalAnnualPrice: "$119.88",
      description: "Perfect for individual teachers starting their hydroponic journey.",
      features: ["1 Tower Management", "Basic Vitals Tracking", "Plant Lifecycle Logging", "Up to 15 Students"],
    },
    {
      id: "professional",
      name: "Professional",
      monthlyPrice: "$19.99",
      annualPrice: "$215.88",
      originalMonthlyPrice: "$39.99",
      originalAnnualPrice: "$239.88",
      description: "Ideal for teachers managing multiple towers with advanced tracking.",
      popular: true,
      features: [
        "Up to 3 Towers",
        "Complete Vitals & History",
        "Harvest & Waste Logging",
        "Photo Gallery",
      ],
    },
    {
      id: "school",
      name: "Accelerator",
      monthlyPrice: "$49.99",
      annualPrice: "$1,080",
      originalMonthlyPrice: "$99.99",
      originalAnnualPrice: "$1,200",
      description: "Comprehensive solution for full classroom hydroponic programs.",
      features: [
        "Unlimited Towers",
        "Classroom Management",
        "Pest Management System",
        "Gamified Leaderboards",
      ],
    },
  ];

  // Helper function to get the current plan's display pricing
  const getCurrentPlanPricing = (plan: typeof plans[0]) => {
    if (billingPeriod === "annual") {
      return {
        price: plan.annualPrice,
        originalPrice: plan.originalAnnualPrice,
        period: "/year",
        savings: "10% OFF"
      };
    } else {
      return {
        price: plan.monthlyPrice,
        originalPrice: plan.originalMonthlyPrice,
        period: "/month",
        savings: "50% OFF"
      };
    }
  };

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
            <Button
              variant={openLogin === "info" ? "default" : "secondary"}
              onClick={() => setOpenLogin((p) => (p === "info" ? null : "info"))}
            >
              Get Info
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
                      <div className="relative">
                        <Input
                          id="loginPasswordTop"
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginForm.password}
                          onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
                  <p className="text-muted-foreground">Enter your name, classroom PIN, and student PIN to begin</p>
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
                      <div className="relative">
                        <Input
                          id="kioskPinTop"
                          type={showStudentKioskPin ? "text" : "password"}
                          required
                          placeholder="4-digit PIN from your teacher"
                          value={studentForm.kioskPin}
                          onChange={(e) => setStudentForm((p) => ({ ...p, kioskPin: e.target.value }))}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowStudentKioskPin(!showStudentKioskPin)}
                        >
                          {showStudentKioskPin ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentPinTop">Your Student PIN</Label>
                      <div className="relative">
                        <Input
                          id="studentPinTop"
                          type={showStudentStudentPin ? "text" : "password"}
                          required
                          placeholder="4-6 digit PIN assigned by your teacher"
                          value={studentForm.studentPin}
                          onChange={(e) => setStudentForm((p) => ({ ...p, studentPin: e.target.value }))}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowStudentStudentPin(!showStudentStudentPin)}
                        >
                          {showStudentStudentPin ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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

        {openLogin === "info" && (
          <div className="border-t">
            <div className="container mx-auto px-6 py-4">
              <Card className="max-w-xl mx-auto">
                <CardHeader>
                  <CardTitle>Get Updates & Resources</CardTitle>
                  <p className="text-muted-foreground">Join our waitlist for educational resources and platform updates</p>
                </CardHeader>
                <CardContent>
                  <MailerLiteForm />
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" type="button" onClick={() => setOpenLogin(null)}>
                      Close
                    </Button>
                  </div>
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
              poster="https://rsndonfydqhykowljuyn.supabase.co/storage/v1/object/public/site-videos/hero-poster.jpg"
            >
              <source src="https://rsndonfydqhykowljuyn.supabase.co/storage/v1/object/public/site-videos/hero-1080p.mp4" type="video/mp4" />
              <source src="https://rsndonfydqhykowljuyn.supabase.co/storage/v1/object/public/site-videos/hero-720p.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        {/* Registration Section */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Registration Form */}
                <Card className="order-2 lg:order-1">
                  <CardHeader>
                    <CardTitle>Create Your Teacher Account</CardTitle>
                    <p className="text-muted-foreground">
                      Start your free trial with the {plans.find((p) => p.id === selectedPlan)?.name} plan
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        No credit card needed for 7-day trial
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        We accept purchase orders (POs)
                      </div>
                    </div>
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
                            onChange={(e) => setRegForm((p) => ({ ...p, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last name</Label>
                          <Input
                            id="lastName"
                            required
                            value={regForm.lastName}
                            onChange={(e) => setRegForm((p) => ({ ...p, lastName: e.target.value }))}
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
                          onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schoolName">
                          {selectedPlan === "school" && schoolDistrictTab === "district" ? "District name" : "School name"}
                        </Label>
                        <Input
                          id="schoolName"
                          required
                          placeholder={selectedPlan === "school" && schoolDistrictTab === "district" ? "e.g. Springfield School District" : "e.g. Roosevelt Elementary School"}
                          value={regForm.schoolName}
                          onChange={(e) => setRegForm((p) => ({ ...p, schoolName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="districtJoinCode">District join code (optional)</Label>
                        <Input
                          id="districtJoinCode"
                          placeholder="Enter district join code if provided"
                          value={regForm.districtJoinCode}
                          onChange={(e) => setRegForm((p) => ({ ...p, districtJoinCode: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">
                          If your school is part of a district, enter the join code provided by your district administrator.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showRegPassword ? "text" : "password"}
                            required
                            value={regForm.password}
                            onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                          >
                            {showRegPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={regForm.confirmPassword}
                            onChange={(e) => setRegForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={regForm.loading}>
                        {regForm.loading
                          ? "Creating Account..."
                          : `Start 7-Day Free Trial - ${
                              selectedPlan === "school" && schoolDistrictTab === "district" 
                                ? "District" 
                                : plans.find((p) => p.id === selectedPlan)?.name
                            }`}
                      </Button>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        Then 50% off for first 3 months • Cancel anytime
                      </p>
                    </form>
                  </CardContent>
                </Card>

                {/* Plan Selection */}
                <div className="order-1 lg:order-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Choose Your Plan</h3>
                    
                    {/* Billing Period Toggle */}
                    <div className="flex items-center bg-muted rounded-lg p-1">
                      <Button
                        variant={billingPeriod === "monthly" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setBillingPeriod("monthly")}
                        className="text-xs px-3 py-1"
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={billingPeriod === "annual" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setBillingPeriod("annual")}
                        className="text-xs px-3 py-1 relative"
                      >
                        Annual
                        <Badge className="ml-1 bg-green-500 text-white text-[10px] px-1 py-0">
                          Save 10%
                        </Badge>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {plans.map((plan) => {
                      const pricing = getCurrentPlanPricing(plan);

                      // Special rendering for the "School" plan: make the card a tabbed box (School/District)
                      if (plan.id === "school") {
                        return (
                          <Card
                            key={plan.id}
                            className={`cursor-pointer transition-all ${
                              selectedPlan === plan.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedPlan(plan.id)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    Accelerator
                                  </CardTitle>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground line-through">
                                      {schoolDistrictTab === "district" 
                                        ? (billingPeriod === "annual" ? "$3,240" : "$299.99")
                                        : pricing.originalPrice
                                      }
                                    </span>
                                    <p className="text-2xl font-bold text-green-600">
                                      {schoolDistrictTab === "district" 
                                        ? (billingPeriod === "annual" ? "$3,240" : "$149.99")
                                        : pricing.price
                                      }
                                      <span className="text-sm font-normal text-muted-foreground">{pricing.period}</span>
                                    </p>
                                    <Badge variant="destructive" className="text-xs">
                                      {pricing.savings}
                                    </Badge>
                                  </div>
                                  {billingPeriod === "annual" && (
                                    <p className="text-xs text-green-600 font-medium">
                                      Save {schoolDistrictTab === "district" 
                                        ? "$358.80" 
                                        : (parseFloat(pricing.originalPrice.replace(/[$,]/g, '')) - parseFloat(pricing.price.replace(/[$,]/g, ''))).toFixed(2)
                                      } per year
                                    </p>
                                  )}
                                  <p className="text-xs text-green-600 font-medium">7-day FREE trial</p>
                                </div>
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${
                                    selectedPlan === plan.id ? "bg-primary border-primary" : "border-muted-foreground"
                                  }`}
                                />
                              </div>

                              {/* Inline Tabs inside the School card */}
                              <Tabs
                                value={schoolDistrictTab}
                                onValueChange={(v) => setSchoolDistrictTab(v as "school" | "district")}
                                className="mt-4"
                              >
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="school">School</TabsTrigger>
                                  <TabsTrigger value="district">District</TabsTrigger>
                                </TabsList>
                              </Tabs>
                            </CardHeader>

                            <CardContent className="pt-0">
                              {/* Same description/features for both tabs for now */}
                              <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                              <ul className="text-xs text-muted-foreground">
                                {(schoolDistrictTab === "district" ? [
                                  "Multi-School Reporting",
                                  "Bulk User Management", 
                                  "Advanced Analytics",
                                  "District Dashboard"
                                ] : plan.features).slice(0, 4).map((feature, idx) => (
                                  <li key={idx}>• {feature}</li>
                                ))}
                              </ul>
                              <p className="mt-3 text-xs text-muted-foreground">
                                {schoolDistrictTab === "district"
                                  ? "District plan: Multi-school reporting, bulk user management, advanced analytics, and district dashboard."
                                  : "School plan: Unlimited towers, classroom management, pest management system, and gamified leaderboards."}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      }

                      // Default rendering for Basic/Professional
                      return (
                        <Card
                          key={plan.id}
                          className={`cursor-pointer transition-all ${
                            selectedPlan === plan.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
                          } ${plan.popular ? "border-secondary" : ""}`}
                          onClick={() => setSelectedPlan(plan.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {plan.name}
                                  {plan.popular && (
                                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                                  )}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground line-through">{pricing.originalPrice}</span>
                                  <p className="text-2xl font-bold text-green-600">
                                    {pricing.price}
                                    <span className="text-sm font-normal text-muted-foreground">{pricing.period}</span>
                                  </p>
                                  <Badge variant="destructive" className="text-xs">
                                    {pricing.savings}
                                  </Badge>
                                </div>
                                {billingPeriod === "annual" && (
                                  <p className="text-xs text-green-600 font-medium">
                                    Save {(parseFloat(pricing.originalPrice.replace('$', '')) - parseFloat(pricing.price.replace('$', ''))).toFixed(2)} per year
                                  </p>
                                )}
                                <p className="text-xs text-green-600 font-medium">7-day FREE trial</p>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  selectedPlan === plan.id ? "bg-primary border-primary" : "border-muted-foreground"
                                }`}
                              />
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
                      );
                    })}
                  </div>
                </div>
              </div>
          </div>
        </section>

        {/* Back to School Promo Banner (date-gated) */}
        {isBackToSchoolActive() && (
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
        )}

        {/* Features */}
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

        {/* Second Back to Schoo
           l Promo (date-gated) */}
        {isBackToSchoolActive() && (
          <section className="text-center mb-12">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <Badge className="mb-4 bg-secondary text-secondary-foreground">Back to School Special</Badge>
                <h3 className="text-2xl font-bold mb-2">50% Off First 3 Months</h3>
                <p className="text-muted-foreground mb-4">
                  Start your classroom gar den journey with our special back-to-school pricing. Valid through September 2025.
                </p>
                <p className="text-sm text-muted-foreground">
                  7-day free trial, then 50% off your chosen plan for the first 3 months
                </p>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
