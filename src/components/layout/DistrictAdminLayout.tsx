import { PropsWithChildren, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import DistrictAdminWelcomeModal from "@/components/DistrictAdminWelcomeModal";
import { DistrictSidebar } from "@/components/DistrictSidebar";

export default function DistrictAdminLayout({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showDistrictAdminModal, setShowDistrictAdminModal] = useState(false);
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
        supabase.from("profiles").select("id, district_id, first_name, last_name, subscription_plan, subscription_status, onboarding_completed").eq("id", user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", user.id)
      ]);

      if (!profile || !profile.district_id) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      const userRoles = roles?.map(r => r.role) || [];
      
      // Allow district_admin role
      const hasValidRole = userRoles.includes("district_admin");
      
      setProfile(profile);
      setHasAccess(hasValidRole);
      
      // Check if we should show the district admin welcome modal
      if (hasValidRole && !profile.onboarding_completed) {
        // Fetch district information for the modal
        const { data: districtData } = await supabase
          .from("districts")
          .select("id, name, join_code")
          .eq("id", profile.district_id)
          .single();
        
        const userRole = roles?.find(r => r.role === 'district_admin')?.role || 'district_admin';
        const profileWithRole = { 
          ...profile, 
          user_role: userRole,
          district: districtData
        };
        setUserProfile(profileWithRole);
        setShowDistrictAdminModal(true);
      }
      
    } catch (error) {
      console.error("Error checking access:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistrictAdminModalClose = async () => {
    setShowDistrictAdminModal(false);
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
        supabase.from("profiles").select("id, district_id, first_name, last_name, subscription_plan, subscription_status, onboarding_completed").eq("id", user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", user.id)
      ]);

      if (profile) {
        const userRoles = roles?.map(r => r.role) || [];
        const userRole = roles?.find(r => r.role === 'district_admin')?.role || 'district_admin';
        const profileWithRole = { 
          ...profile, 
          user_role: userRole,
          districts: profile.districts
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
          District Administration
        </span>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DistrictSidebar />
        <SidebarInset>
          <header className="h-14 flex items-center gap-3 border-b px-4">
            <SidebarTrigger />
            {renderHeaderContent()}
          </header>
          <div className="p-4 container">{children}</div>
        </SidebarInset>
      </div>
      
      {/* District Admin Welcome Modal */}
      {userProfile && (
        <DistrictAdminWelcomeModal
          isOpen={showDistrictAdminModal}
          onClose={handleDistrictAdminModalClose}
          userProfile={userProfile}
        />
      )}
    </SidebarProvider>
  );
}
