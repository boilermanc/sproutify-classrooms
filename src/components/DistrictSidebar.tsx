import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Settings, 
  Users, 
  Building2, 
  Sprout,
  FileText,
  Key,
  LogOut,
  HelpCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const districtNavItems = [
  {
    title: "Dashboard",
    url: "/district",
    icon: BarChart3,
  },
  {
    title: "Schools",
    url: "/district/schools",
    icon: Building2,
  },
  {
    title: "Teachers",
    url: "/district/teachers",
    icon: Users,
  },
  {
    title: "Towers",
    url: "/district/towers",
    icon: Sprout,
  },
  {
    title: "Reports",
    url: "/district/reports",
    icon: FileText,
  },
  {
    title: "Join Codes",
    url: "/district/join-codes",
    icon: Key,
  },
  {
    title: "District Settings",
    url: "/district/settings",
    icon: Settings,
  },
  {
    title: "Help",
    url: "/app/help",
    icon: HelpCircle,
  },
];

export function DistrictSidebar() {
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    console.log('🚪 Starting logout...');
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Logout timeout')), 5000);
      });
      
      // Race between signOut and timeout
      await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ]);
      
      console.log('✅ Supabase logout successful');
    } catch (error) {
      console.log('⚠️ Supabase logout failed or timed out:', error);
    }
    
    // Clear all local storage
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 Storage cleared');
    } catch (error) {
      console.log('⚠️ Failed to clear storage:', error);
    }
    
    // Show feedback
    toast({ 
      title: "Signed out successfully",
      description: "You have been logged out"
    });
    
    // Always redirect, even if signOut failed
    console.log('🔄 Redirecting to login...');
    window.location.replace('/auth/login');
  };

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>District Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {districtNavItems.map((item) => (
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
