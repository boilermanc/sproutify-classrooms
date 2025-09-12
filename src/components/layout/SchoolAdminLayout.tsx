import { PropsWithChildren, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SchoolSidebar } from "@/components/SchoolSidebar";
import SchoolAdminWelcomeModal from "@/components/SchoolAdminWelcomeModal";

export default function SchoolAdminLayout({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showSchoolAdminModal, setShowSchoolAdminModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // Get user profile and roles
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, school_id, first_name, last_name, subscription_plan, subscription_status, onboarding_completed").eq("id", user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", user.id)
      ]);

      if (!profile || !profile.school_id) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      const userRoles = roles?.map(r => r.role) || [];
      
      // Allow school_admin or teacher with school_id
      const hasValidRole = userRoles.includes("school_admin") || 
                          (userRoles.includes("teacher") && profile.school_id);
      
      setProfile(profile);
      setHasAccess(hasValidRole);
      
      // Check if we should show the school admin welcome modal
      if (hasValidRole && userRoles.includes("school_admin") && !profile.onboarding_completed) {
        // Fetch school information for the modal
        const { data: schoolData } = await supabase
          .from("schools")
          .select("id, name, join_code")
          .eq("id", profile.school_id)
          .single();
        
        const userRole = roles?.find(r => r.role === 'school_admin')?.role || 'school_admin';
        const profileWithRole = { 
          ...profile, 
          user_role: userRole,
          schools: schoolData ? { name: schoolData.name } : null
        };
        setUserProfile(profileWithRole);
        setShowSchoolAdminModal(true);
      }
      
    } catch (error) {
      console.error("Error checking access:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolAdminModalClose = async () => {
    setShowSchoolAdminModal(false);
    // Refresh user profile to get updated onboarding status
    await refreshUserProfile();
  };

  const refreshUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return;
      }

      // Get updated user profile and roles
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, school_id, first_name, last_name, subscription_plan, subscription_status, onboarding_completed").eq("id", user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", user.id)
      ]);

      if (profile) {
        const userRoles = roles?.map(r => r.role) || [];
        const userRole = roles?.find(r => r.role === 'school_admin')?.role || 'school_admin';
        const profileWithRole = { 
          ...profile, 
          user_role: userRole,
          schools: profile.schools
        };
        setUserProfile(profileWithRole);
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <div className="w-64 border-r bg-muted/40">
            <div className="p-4">
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <SidebarInset>
            <header className="h-14 flex items-center gap-3 border-b px-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </header>
            <div className="p-4">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/app" replace />;
  }

  const renderHeaderContent = () => {
    if (!profile) return null;
    
    return (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          Welcome, {profile.first_name}
        </span>
        <span className="text-xs text-muted-foreground">
          School Administration
        </span>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SchoolSidebar />
        <SidebarInset>
          <header className="h-14 flex items-center gap-3 border-b px-4">
            <SidebarTrigger />
            {renderHeaderContent()}
          </header>
          <div className="p-4 container">{children}</div>
        </SidebarInset>
      </div>
      
      {/* School Admin Welcome Modal */}
      {userProfile && (
        <SchoolAdminWelcomeModal
          isOpen={showSchoolAdminModal}
          onClose={handleSchoolAdminModalClose}
          userProfile={userProfile}
        />
      )}
    </SidebarProvider>
  );
}
