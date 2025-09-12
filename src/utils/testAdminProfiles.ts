// Test script to create admin profiles
// Run this in your browser console while logged in as a test user

import { supabase } from '@/integrations/supabase/client';

// Test function to create a school admin profile
export async function createSchoolAdminTestProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No authenticated user found');
      return;
    }

    console.log('Creating school admin profile for user:', user.email);

    // First, create or find a test school
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({ name: 'Test School for Admin' })
      .select()
      .single();

    if (schoolError && !schoolError.message.includes('duplicate')) {
      console.error('Error creating school:', schoolError);
      return;
    }

    const schoolId = school?.id || (await supabase.from('schools').select('id').eq('name', 'Test School for Admin').single()).data?.id;

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
      console.error('Error updating profile:', profileError);
      return;
    }

    // Add school_admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role: 'school_admin',
        school_id: schoolId,
      }, { onConflict: 'user_id,role' });

    if (roleError) {
      console.error('Error adding role:', roleError);
      return;
    }

    console.log('✅ School admin profile created successfully!');
    console.log('You can now access /school dashboard');

  } catch (error) {
    console.error('Error creating school admin profile:', error);
  }
}

// Test function to create a district admin profile
export async function createDistrictAdminTestProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No authenticated user found');
      return;
    }

    console.log('Creating district admin profile for user:', user.email);

    // First, create or find a test district
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

    if (districtError && !districtError.message.includes('duplicate')) {
      console.error('Error creating district:', districtError);
      return;
    }

    const districtId = district?.id || (await supabase.from('districts').select('id').eq('name', 'Test District for Admin').single()).data?.id;

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
      console.error('Error updating profile:', profileError);
      return;
    }

    // Add district_admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role: 'district_admin',
        district_id: districtId,
      }, { onConflict: 'user_id,role' });

    if (roleError) {
      console.error('Error adding role:', roleError);
      return;
    }

    console.log('✅ District admin profile created successfully!');
    console.log('You can now access /district dashboard');

  } catch (error) {
    console.error('Error creating district admin profile:', error);
  }
}

// Helper function to check current user roles
export async function checkUserRoles() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No authenticated user found');
      return;
    }

    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, school_id, district_id')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('Error fetching roles:', roleError);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, district_id, first_name, last_name')
      .eq('id', user.id)
      .single();

    console.log('Current user:', user.email);
    console.log('Profile:', profile);
    console.log('Roles:', roles);

  } catch (error) {
    console.error('Error checking user roles:', error);
  }
}
