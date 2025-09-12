import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Settings, 
  Users, 
  GraduationCap, 
  Sprout,
  Building2,
  LogOut,
  School,
  Code,
  HelpCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const schoolNavItems = [
  {
    title: "Dashboard",
    url: "/school/dashboard",
    icon: School,
  },
  {
    title: "Towers",
    url: "/school/towers",
    icon: Sprout,
  },
  {
    title: "Classrooms",
    url: "/school/classrooms",
    icon: GraduationCap,
  },
  {
    title: "Teachers",
    url: "/school/teachers",
    icon: Users,
  },
  {
    title: "Reports",
    url: "/school/reports",
    icon: BarChart3,
  },
  {
    title: "Join Codes",
    url: "/school/join-codes",
    icon: Code,
  },
  {
    title: "Settings",
    url: "/school/settings",
    icon: Settings,
  },
  {
    title: "Help",
    url: "/app/help",
    icon: HelpCircle,
  },
];

export function SchoolSidebar() {
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    console.log('🚪 Starting forced logout...');
    
    // Don't wait for Supabase - just clear everything and redirect
    try {
      // Fire and forget - don't wait for the result
      supabase.auth.signOut().catch(err => console.log('Supabase logout error (ignored):', err));
    } catch (err) {
      console.log('Supabase logout failed (ignored):', err);
    }
    
    // Clear all local storage immediately
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('🧹 Storage cleared');
    
    // Show immediate feedback
    toast({ title: "Signing out..." });
    
    // Force immediate redirect
    console.log('🔄 Forcing redirect...');
    window.location.replace('/auth/login');
  };

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>School Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {schoolNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/app">
                    <Building2 />
                    <span>Back to App</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
