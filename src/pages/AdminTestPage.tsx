import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function AdminTestPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const createSchoolAdminProfile = async () => {
    setLoading('school');
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({ title: "Error", description: "No authenticated user found", variant: "destructive" });
        return;
      }

      // Create or find a test school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({ name: 'Test School for Admin' })
        .select()
        .single();

      let schoolId = school?.id;
      
      if (schoolError && schoolError.message.includes('duplicate')) {
        const { data: existingSchool } = await supabase
          .from('schools')
          .select('id')
          .eq('name', 'Test School for Admin')
          .single();
        schoolId = existingSchool?.id;
      }

      if (!schoolId) {
        toast({ title: "Error", description: "Could not create or find test school", variant: "destructive" });
        return;
      }

      // Update profile with school_id
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          school_id: schoolId,
          first_name: 'School',
          last_name: 'Admin',
          email: user.email,
        }, { onConflict: 'id' });

      if (profileError) {
        toast({ title: "Error", description: `Profile error: ${profileError.message}`, variant: "destructive" });
        return;
      }

      // Add school_admin role (this will fail if the role doesn't exist yet)
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'school_admin',
          school_id: schoolId,
        }, { onConflict: 'user_id,role' });

      if (roleError) {
        console.log('Role error (expected if migration not run):', roleError);
        toast({ 
          title: "Partial Success", 
          description: "Profile updated, but school_admin role needs database migration first" 
        });
      } else {
        toast({ title: "Success", description: "School admin profile created! You can now access /school" });
      }

    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to create school admin profile", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const createDistrictAdminProfile = async () => {
    setLoading('district');
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({ title: "Error", description: "No authenticated user found", variant: "destructive" });
        return;
      }

      // Create or find a test district
      const { data: district, error: districtError } = await supabase
        .from('districts')
        .insert({ 
          name: 'Test District for Admin',
          join_code: 'TEST1234',
          contact_email: user.email,
          max_teachers: 100,
          subscription_status: 'trial',
          subscription_tier: 'district',
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      let districtId = district?.id;
      
      if (districtError && districtError.message.includes('duplicate')) {
        const { data: existingDistrict } = await supabase
          .from('districts')
          .select('id')
          .eq('name', 'Test District for Admin')
          .single();
        districtId = existingDistrict?.id;
      }

      if (!districtId) {
        toast({ title: "Error", description: "Could not create or find test district", variant: "destructive" });
        return;
      }

      // Update profile with district_id
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          district_id: districtId,
          first_name: 'District',
          last_name: 'Admin',
          email: user.email,
        }, { onConflict: 'id' });

      if (profileError) {
        toast({ title: "Error", description: `Profile error: ${profileError.message}`, variant: "destructive" });
        return;
      }

      // Add district_admin role (this will fail if the role doesn't exist yet)
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'district_admin',
          district_id: districtId,
        }, { onConflict: 'user_id,role' });

      if (roleError) {
        console.log('Role error (expected if migration not run):', roleError);
        toast({ 
          title: "Partial Success", 
          description: "Profile updated, but district_admin role needs database migration first" 
        });
      } else {
        toast({ title: "Success", description: "District admin profile created! You can now access /district" });
      }

    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to create district admin profile", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const fixCurrentUserRole = async () => {
    setLoading('fix-role');
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({ title: "Error", description: "No authenticated user found", variant: "destructive" });
        return;
      }

      // Get current user's profile to find their district_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('district_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.district_id) {
        toast({ title: "Error", description: "User doesn't have a district_id", variant: "destructive" });
        return;
      }

      // Add district_admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'district_admin',
          district_id: profile.district_id,
        });

      if (roleError) {
        console.log('Role error:', roleError);
        toast({ 
          title: "Error", 
          description: `Failed to add role: ${roleError.message}`,
          variant: "destructive"
        });
      } else {
        toast({ title: "Success", description: "District admin role added! Please refresh the page." });
      }

    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to fix user role", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const fixCurrentUserSchoolRole = async () => {
    setLoading('fix-school-role');
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({ title: "Error", description: "No authenticated user found", variant: "destructive" });
        return;
      }

      // Get current user's profile to find their school_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.school_id) {
        toast({ title: "Error", description: "User doesn't have a school_id", variant: "destructive" });
        return;
      }

      // Add school_admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'school_admin',
          school_id: profile.school_id,
        });

      if (roleError) {
        console.log('Role error:', roleError);
        toast({ 
          title: "Error", 
          description: `Failed to add role: ${roleError.message}`,
          variant: "destructive"
        });
      } else {
        toast({ title: "Success", description: "School admin role added! Please refresh the page." });
      }

    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to fix user role", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const checkCurrentProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({ title: "Error", description: "No authenticated user found", variant: "destructive" });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('school_id, district_id, first_name, last_name')
        .eq('id', user.id)
        .single();

      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role, school_id, district_id')
        .eq('user_id', user.id);

      console.log('Current user:', user.email);
      console.log('Profile:', profile);
      console.log('Roles:', roles);

      toast({ 
        title: "Profile Info", 
        description: `Profile: ${profile?.first_name} ${profile?.last_name}, Roles: ${roles?.map(r => r.role).join(', ') || 'None'}` 
      });

    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to check profile", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Admin Profile Test Setup</CardTitle>
          <p className="text-muted-foreground">
            Use this page to create test admin profiles for testing the admin dashboards.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Step 1: Check Current Profile</h3>
            <Button onClick={checkCurrentProfile} variant="outline">
              Check Current Profile & Roles
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Fix Current User Role</h3>
            <p className="text-sm text-muted-foreground">
              If you have a district_id but missing district_admin role, click this to fix it.
            </p>
            <Button 
              onClick={fixCurrentUserRole} 
              disabled={loading === 'fix-role'}
              className="w-full"
              variant="secondary"
            >
              {loading === 'fix-role' ? 'Fixing...' : 'Fix District Admin Role'}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Fix School Admin Role</h3>
            <p className="text-sm text-muted-foreground">
              If you have a school_id but missing school_admin role, click this to fix it.
            </p>
            <Button 
              onClick={fixCurrentUserSchoolRole} 
              disabled={loading === 'fix-school-role'}
              className="w-full"
              variant="secondary"
            >
              {loading === 'fix-school-role' ? 'Fixing...' : 'Fix School Admin Role'}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Step 2: Create School Admin Profile</h3>
            <p className="text-sm text-muted-foreground">
              This will create a test school and assign you the school_admin role.
            </p>
            <Button 
              onClick={createSchoolAdminProfile} 
              disabled={loading === 'school'}
              className="w-full"
            >
              {loading === 'school' ? 'Creating...' : 'Create School Admin Profile'}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Step 3: Create District Admin Profile</h3>
            <p className="text-sm text-muted-foreground">
              This will create a test district and assign you the district_admin role.
            </p>
            <Button 
              onClick={createDistrictAdminProfile} 
              disabled={loading === 'district'}
              className="w-full"
            >
              {loading === 'district' ? 'Creating...' : 'Create District Admin Profile'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Testing Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>First, run the database migration: <code>npx supabase db push</code></li>
              <li>Create a test account by registering normally</li>
              <li>Use the buttons above to create admin profiles</li>
              <li>Navigate to <code>/school</code> to test school admin dashboard</li>
              <li>Navigate to <code>/district</code> to test district admin dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
