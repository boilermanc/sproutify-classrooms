import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  Sprout, 
  Gauge, 
  Trophy, 
  BookOpen, 
  Users, 
  HelpCircle, 
  User, 
  LogOut, 
  Settings, 
  Bug,
  Network,
  Building2,
  BarChart3,
  FileText,
  Award
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
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useState, useEffect } from "react";

// Feature flag for Garden Network
const FEATURE_FLAGS = {
  GARDEN_NETWORK: process.env.NODE_ENV === 'development' || import.meta.env.VITE_FEATURE_GARDEN_NETWORK === 'true',
};

const coreItems = [
  { title: "Dashboard", url: "/app", icon: Gauge },
  { title: "My Classrooms", url: "/app/classrooms", icon: Users },
  { title: "Towers", url: "/app/towers", icon: Sprout },
  { title: "Seeding", url: "/app/seeding", icon: Sprout },
  { title: "Plant Catalog", url: "/app/catalog", icon: BookOpen },
  { title: "Pest & Disease Guide", url: "/app/pest-disease-guide", icon: Bug },
  { title: "Milestones", url: "/app/milestones", icon: Award },
  { title: "Leaderboard", url: "/app/leaderboard", icon: Trophy },
];

// Garden Network items (conditionally included)
const networkItems = [
  { title: "Garden Network", url: "/app/network", icon: Network },
];

const settingsItems = [
  { title: "Profile", url: "/app/profile", icon: User },
  { title: "Settings", url: "/app/settings", icon: Settings },
  { title: "Help", url: "/app/help", icon: HelpCircle },
];

// Admin navigation items
const adminItems = [
  { title: "District Admin", url: "/district", icon: Building2, role: "district_admin" },
  { title: "School Admin", url: "/school", icon: BarChart3, role: "school_admin" },
];

// Combine all items based on feature flags
const getItems = (hasDistrictAccess: boolean, hasSchoolAccess: boolean) => [
  ...coreItems,
  ...(FEATURE_FLAGS.GARDEN_NETWORK ? networkItems : []),
  ...settingsItems,
  ...(hasSchoolAccess ? [{ title: "School Guide", url: "/app/school-guide", icon: Building2 }] : []),
  ...(hasDistrictAccess ? [{ title: "District Guide", url: "/app/district-guide", icon: Building2 }] : [])
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // Check if user has district access
  const hasDistrictAccess = profile?.district_id || userRoles.includes('district_admin');
  
  // Check if user has school access
  const hasSchoolAccess = userRoles.includes('school_admin');
  
  // Get items based on access
  const items = getItems(hasDistrictAccess, hasSchoolAccess);

  // Check user roles on mount
  useEffect(() => {
    const checkUserRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoadingRoles(false);
          return;
        }

        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        setUserRoles(roles?.map(r => r.role) || []);
      } catch (error) {
        console.error("Error fetching user roles:", error);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    checkUserRoles();
  }, []);

  // Check if current path matches the item URL
  const isActiveItem = (itemUrl: string) => {
    if (itemUrl === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(itemUrl);
  };

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

  // Group items for better organization when Garden Network is enabled
  const mainNavItems = FEATURE_FLAGS.GARDEN_NETWORK 
    ? coreItems 
    : items.filter(item => !settingsItems.includes(item));

  const networkNavItems = FEATURE_FLAGS.GARDEN_NETWORK ? networkItems : [];
  const settingsNavItems = FEATURE_FLAGS.GARDEN_NETWORK ? settingsItems : [];

  // Filter admin items based on user roles
  const availableAdminItems = adminItems.filter(item => userRoles.includes(item.role));

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-14" : "w-60"}>
      {/* Make the content a flex column that fills height */}
      <SidebarContent className="flex h-full flex-col">
        {/* Header with logo placeholder */}
        <SidebarHeader className="border-b pb-2">
          <div className="flex items-center gap-3 px-2">
            {/* Logo placeholder - replace src with your actual logo */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {profile?.school_name || "Sproutify School"}
                </span>
                <span className="text-xs text-muted-foreground">Garden Management</span>
              </div>
            )}
          </div>
        </SidebarHeader>

        {/* Main Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(FEATURE_FLAGS.GARDEN_NETWORK ? mainNavItems : items).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActiveItem(item.url)}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink to={item.url} end={item.url === "/app"}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Garden Network Group (only when feature enabled) */}
        {FEATURE_FLAGS.GARDEN_NETWORK && (
          <SidebarGroup>
            <SidebarGroupLabel>Network</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {networkNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActiveItem(item.url)}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin Group (only when user has admin roles) */}
        {availableAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {availableAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActiveItem(item.url)}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings Group (only when Garden Network enabled for better organization) */}
        {FEATURE_FLAGS.GARDEN_NETWORK && (
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActiveItem(item.url)}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Spacer pushes the next group to the bottom */}
        <div className="mt-auto" />

        {/* Bottom pinned logout */}
        <SidebarGroup className="pb-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  tooltip={collapsed ? "Logout" : undefined}
                >
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}