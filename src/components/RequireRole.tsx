import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Allowed = Array<"super_admin"|"staff"|"teacher"|"school_admin"|"district_admin"|"student">;

export function RequireRole({ allow, children }: { allow: Allowed; children?: React.ReactNode }) {
  const [status, setStatus] = useState<"loading"|"allowed"|"denied">("loading");

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (!user) return setStatus("denied");
      
      // Check team_members table for super_admin and staff roles
      if (allow.includes("super_admin") || allow.includes("staff")) {
        const { data: teamMember, error: teamMemberError } = await supabase
          .from("team_members")
          .select("role, active")
          .eq("user_id", user.id)
          .eq("active", true)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully
        
        if (!isMounted) return;
        
        // If no error and we have a team member with the right role, allow access
        if (!teamMemberError && teamMember && allow.includes(teamMember.role)) {
          return setStatus("allowed");
        }
        
        // If user is not a team member, continue to check other roles
      }
      
      // Check user_roles table for other roles (teacher, school_admin, district_admin, student)
      const otherRoles = allow.filter(role => !["super_admin", "staff"].includes(role));
      if (otherRoles.length > 0) {
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        
        if (!isMounted) return;
        
        const roles = userRoles?.map(r => r.role) || [];
        const hasValidRole = roles.some(role => allow.includes(role));
        
        if (hasValidRole) {
          return setStatus("allowed");
        }
      }
      
      setStatus("denied");
    })();
    
    return () => {
      isMounted = false;
    };
  }, [allow]);

  if (status === "loading") return null;
  if (status === "denied") return <Navigate to="/auth/login" replace />;
  
  // If we have children, render them directly (for simple routes)
  if (children) {
    return <>{children}</>;
  }
  
  // Otherwise, use Outlet for nested routes
  return <Outlet />;
}
