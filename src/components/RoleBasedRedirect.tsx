// src/components/RoleBasedRedirect.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export default function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setIsLoading(false);
        return;
      }

      // Get user profile and roles
      const [{ data: profile }, { data: teamMember, error: teamMemberError }] = await Promise.all([
        supabase.from("profiles").select("id, district_id, school_id").eq("id", user.id).single(),
        supabase.from("team_members").select("role, active").eq("user_id", user.id).eq("active", true).maybeSingle()
      ]);

      if (!profile) {
        setIsLoading(false);
        return;
      }

      // Check if user is on the wrong dashboard based on their role
      const currentPath = window.location.pathname;

      // Check if user is super_admin or staff - they should be on admin dashboard
      if (!teamMemberError && teamMember && (teamMember.role === "super_admin" || teamMember.role === "staff")) {
        if (currentPath.startsWith("/app") || currentPath.startsWith("/district") || currentPath.startsWith("/school")) {
          setRedirectPath("/admin");
        }
        setIsLoading(false);
        return;
      }

      // Check regular user roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const userRoles = roles?.map(r => r.role) || [];
      
      if (userRoles.includes("district_admin") && profile.district_id && currentPath.startsWith("/app")) {
        // District admin is on teacher dashboard, redirect to district dashboard
        setRedirectPath("/district");
      } else if (userRoles.includes("school_admin") && profile.school_id && currentPath.startsWith("/app")) {
        // School admin is on teacher dashboard, redirect to school dashboard
        setRedirectPath("/school");
      } else if (userRoles.includes("teacher") && !userRoles.includes("district_admin") && !userRoles.includes("school_admin")) {
        // Regular teacher, ensure they're on teacher dashboard
        if (currentPath.startsWith("/district") || currentPath.startsWith("/school")) {
          setRedirectPath("/app");
        }
      }
      
    } catch (error) {
      console.error("Error checking user role:", error);
    } finally {
      setIsLoading(false);
    }
    };
    
    checkUserRole();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
