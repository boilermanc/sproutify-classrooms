import { PropsWithChildren, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/AdminHeader";

export default function AdminLayout({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [profile, setProfile] = useState<any>(null);

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

      // Check if user is a team member first
      const { data: teamMember, error: teamMemberError } = await supabase
        .from("team_members")
        .select("role, active")
        .eq("user_id", user.id)
        .eq("active", true)
        .maybeSingle();

      // If user is a team member, they have access regardless of profile
      if (!teamMemberError && teamMember && (teamMember.role === "super_admin" || teamMember.role === "staff")) {
        // Try to get profile, but don't require it for team members
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .eq("id", user.id)
          .single();

        // Create a minimal profile if none exists
        const profileData = profile || {
          id: user.id,
          first_name: user.email?.split('@')[0] || 'Admin',
          last_name: '',
          email: user.email || ''
        };

        setProfile(profileData);
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // For non-team members, require a profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      setProfile(profile);
      setHasAccess(false); // Non-team members don't have admin access
      
    } catch (error) {
      console.error("Error checking admin access:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader profile={profile} />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
