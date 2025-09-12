import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard,
  Users,
  Building2,
  School,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  Database,
  Activity,
  FileText,
  HelpCircle,
  Video,
  LogOut,
  Palette
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const adminItems = [
  { 
    title: "Dashboard", 
    url: "/admin", 
    icon: LayoutDashboard,
    description: "Overview and key metrics"
  },
  { 
    title: "Super Admin", 
    url: "/admin/super", 
    icon: Shield,
    description: "Advanced admin tools"
  },
  { 
    title: "Users", 
    url: "/admin/users", 
    icon: Users,
    description: "Manage all users and roles"
  },
  { 
    title: "Videos", 
    url: "/admin/videos", 
    icon: Video,
    description: "Manage educational videos and content"
  },
  { 
    title: "Districts", 
    url: "/admin/districts", 
    icon: Building2,
    description: "Manage districts and district admins"
  },
  { 
    title: "Schools", 
    url: "/admin/schools", 
    icon: School,
    description: "Manage schools and school admins"
  },
  { 
    title: "Subscriptions", 
    url: "/admin/subscriptions", 
    icon: CreditCard,
    description: "Manage billing and subscriptions"
  },
  { 
    title: "Analytics", 
    url: "/admin/analytics", 
    icon: BarChart3,
    description: "Platform analytics and reports"
  },
  { 
    title: "System", 
    url: "/admin/system", 
    icon: Database,
    description: "System health and monitoring"
  },
  { 
    title: "Activity Log", 
    url: "/admin/activity", 
    icon: Activity,
    description: "User activity and audit logs"
  },
  { 
    title: "Reports", 
    url: "/admin/reports", 
    icon: FileText,
    description: "Generate and view reports"
  },
  { 
    title: "Settings", 
    url: "/admin/settings", 
    icon: Settings,
    description: "Platform settings and configuration"
  },
  { 
    title: "Style Guide", 
    url: "/admin/style-guide", 
    icon: Palette,
    description: "Design system and style reference"
  },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
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
    <Sidebar className="border-r w-64">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Sproutify Admin</h2>
            <p className="text-xs text-muted-foreground">Team Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors ${
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/admin/help"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors ${
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`
                    }
                  >
                    <HelpCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium truncate">Help & Support</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
