import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { formatPlanName, capitalizeSubscriptionStatus } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, CreditCard } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Updated form state to match actual database structure
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("");
  const [district, setDistrict] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [schoolImageUrl, setSchoolImageUrl] = useState<string | null>(null);

  // Subscription info (read-only display)
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [maxTowers, setMaxTowers] = useState<number | null>(null);
  const [maxStudents, setMaxStudents] = useState<number | null>(null);

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    email: "",
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
    timezone: "",
    district: "",
    avatarUrl: null as string | null,
    schoolImageUrl: null as string | null,
  });

  // Check if there are unsaved changes
  const hasUnsavedChanges = 
    email !== originalValues.email ||
    firstName !== originalValues.firstName ||
    lastName !== originalValues.lastName ||
    bio !== originalValues.bio ||
    phone !== originalValues.phone ||
    timezone !== originalValues.timezone ||
    avatarUrl !== originalValues.avatarUrl ||
    schoolImageUrl !== originalValues.schoolImageUrl;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Updated query to get all the fields from the actual database structure
      const { data: prof, error } = await supabase
        .from("profiles")
        .select(`
          email,
          first_name,
          last_name,
          full_name,
          bio,
          phone,
          timezone,
          district_id,
          avatar_url,
          school_image_url,
          subscription_status,
          subscription_plan,
          trial_ends_at,
          max_towers,
          max_students,
          schools(name),
          districts(name)
        `)
        .eq("id", userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error loading profile:", error);
        toast({ title: "Error", description: "Could not load your profile.", variant: "destructive" });
      } else if (prof) {
        console.log("Profile data loaded:", prof);
        // Populate form with database data
        setEmail(prof.email ?? "");
        setFirstName(prof.first_name ?? "");
        setLastName(prof.last_name ?? "");
        setFullName(prof.full_name ?? "");
        setBio(prof.bio ?? "");
        setPhone(prof.phone ?? "");
        setTimezone(prof.timezone ?? "");
        setDistrict(prof.districts?.name ?? "");
        setAvatarUrl(prof.avatar_url ?? null);
        setSchoolImageUrl(prof.school_image_url ?? null);
        
        // Get school name from the relationship
        setSchoolName(prof.schools?.name ?? "");
        
        // Set subscription info (read-only)
        console.log("Subscription data:", {
          status: prof.subscription_status,
          plan: prof.subscription_plan,
          trialEndsAt: prof.trial_ends_at,
          maxTowers: prof.max_towers,
          maxStudents: prof.max_students
        });
        setSubscriptionStatus(prof.subscription_status ?? "");
        setSubscriptionPlan(prof.subscription_plan ?? "");
        setTrialEndsAt(prof.trial_ends_at ?? null);
        setMaxTowers(prof.max_towers ?? null);
        setMaxStudents(prof.max_students ?? null);

        // Set original values for change detection
        setOriginalValues({
          email: prof.email ?? "",
          firstName: prof.first_name ?? "",
          lastName: prof.last_name ?? "",
          bio: prof.bio ?? "",
          phone: prof.phone ?? "",
          timezone: prof.timezone ?? "",
          district: prof.districts?.name ?? "",
          avatarUrl: prof.avatar_url ?? null,
          schoolImageUrl: prof.school_image_url ?? null,
        });
      } else {
        console.log("No profile data found for user:", userId);
      }
      setLoading(false);
    };

    loadProfile();
  }, [userId, toast]);

  const save = async () => {
    if (!userId) {
      toast({ title: "Not logged in", description: "You must be logged in to save your profile.", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    
    // Update profile with the correct field names
    // Note: district field is now read-only as it comes from the districts table
    const { error } = await supabase
      .from("profiles")
      .update({ 
        email,
        first_name: firstName,
        last_name: lastName,
        // full_name will be auto-generated by the trigger
        bio, 
        phone, 
        timezone, 
        avatar_url: avatarUrl, 
        school_image_url: schoolImageUrl 
      })
      .eq("id", userId);
    
    setSaving(false);
    
    if (error) {
      console.error(error);
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
      
      // Update original values to reflect saved state
      setOriginalValues({
        email,
        firstName,
        lastName,
        bio,
        phone,
        timezone,
        district,
        avatarUrl,
        schoolImageUrl,
      });
      
      // Update the fullName state to reflect the saved values
      setFullName(`${firstName.trim()} ${lastName.trim()}`.trim());
    }
  };

  const upload = async (file: File, bucket: string, key: string): Promise<string | null> => {
    if (!userId) return null;
    const path = `${userId}/${key}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      console.error(upErr);
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !userId) return;
    const url = await upload(f, "avatars", `avatar.${f.name.split(".").pop() || "jpg"}`);
    if (url) setAvatarUrl(url);
  };

  const onSchoolImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !userId) return;
    const url = await upload(f, "school-logos", `school.${f.name.split(".").pop() || "jpg"}`);
    if (url) setSchoolImageUrl(url);
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-4">
      <SEO title="Profile | Sproutify" description="Manage your profile, school details and images" canonical={window.location.href} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profile</h1>
        {hasUnsavedChanges && (
          <Button onClick={save} disabled={saving || loading || !userId}>
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>

      {/* Account Status Card */}
      <Card>
        <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Subscription Status</Label>
            <Input value={capitalizeSubscriptionStatus(subscriptionStatus)} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <Input value={formatPlanName(subscriptionPlan)} disabled className="bg-muted" />
          </div>
          {trialEndsAt && (
            <div className="space-y-2">
              <Label>Trial Ends</Label>
              <Input value={new Date(trialEndsAt).toLocaleDateString()} disabled className="bg-muted" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Tower Limit</Label>
            <Input value={maxTowers?.toString() ?? ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Student Limit</Label>
            <Input value={maxStudents?.toString() ?? ""} disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Stripe Customer Dashboard Callout */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Manage Your Subscription</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Access your Stripe customer dashboard to view invoices, update payment methods, and manage your subscription details.
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2 mt-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
            onClick={() => {
              const billingPortalUrl = process.env.REACT_APP_STRIPE_BILLING_PORTAL || 'https://billing.stripe.com/p/login/9B68wQ3E4g6a7XS4km9MY00';
              if (billingPortalUrl) {
                window.open(billingPortalUrl, '_blank');
              } else {
                toast({
                  title: "Billing portal unavailable",
                  description: "Billing portal URL is not configured. Please contact support.",
                  variant: "destructive"
                });
              }
            }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open Billing Portal
          </Button>
        </AlertDescription>
      </Alert>

      {/* Personal Info Card */}
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@school.edu" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-5555" />
          </div>
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Full Name (auto-generated)</Label>
            <Input value={fullName} disabled className="bg-gray-50" placeholder="Will be generated from first and last name" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about your classroom..." />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="America/Chicago" />
          </div>
          <div className="space-y-2">
            <Label>District</Label>
            <Input 
              value={district || ""} 
              disabled 
              className="bg-gray-50" 
              placeholder="District name from registration" 
            />
            <p className="text-sm text-gray-500">District is set during registration and cannot be changed here.</p>
          </div>
        </CardContent>
      </Card>

      {/* School & Images Card */}
      <Card>
        <CardHeader><CardTitle>School & Images</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Avatar</Label>
            {avatarUrl && <img src={avatarUrl} alt="Profile avatar" className="h-24 w-24 rounded-full object-cover" />}
            <Input type="file" accept="image/*" onChange={onAvatarChange} />
          </div>
          <div className="space-y-2">
            <Label>School Image</Label>
            {schoolImageUrl && <img src={schoolImageUrl} alt="School" className="h-24 w-24 rounded-md object-cover" />}
            <Input type="file" accept="image/*" onChange={onSchoolImgChange} />
          </div>
          <div className="space-y-2">
            <Label>School Name</Label>
            <Input value={schoolName} disabled className="bg-gray-50" placeholder="Set during registration" />
            <p className="text-sm text-gray-500">School name is set during registration and cannot be changed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}