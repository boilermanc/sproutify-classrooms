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
  Network
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

// DEBUG: Check environment variables
console.log('🌱 GARDEN_NETWORK feature flag:', process.env.VITE_ENABLE_GARDEN_NETWORK);
console.log('🌱 NODE_ENV:', process.env.NODE_ENV);
console.log('🌱 Feature flag result:', process.env.NODE_ENV === 'development' || process.env.VITE_ENABLE_GARDEN_NETWORK === 'true');

// Feature flag for Garden Network - HARDCODED TO TRUE
const FEATURE_FLAGS = {
  GARDEN_NETWORK: true, // Hardcoded to always enable Garden Network
};

console.log('🌱 FEATURE_FLAGS.GARDEN_NETWORK:', FEATURE_FLAGS.GARDEN_NETWORK);

const coreItems = [
  { title: "Dashboard", url: "/app", icon: Gauge },
  { title: "My Classrooms", url: "/app/classrooms", icon: Users },
  { title: "Towers", url: "/app/towers", icon: Sprout },
  { title: "Plant Catalog", url: "/app/catalog", icon: BookOpen },
  { title: "Pest & Disease Guide", url: "/app/pest-disease-guide", icon: Bug },
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

// Combine all items based on feature flags
const items = [
  ...coreItems,
  ...(FEATURE_FLAGS.GARDEN_NETWORK ? networkItems : []),
  ...settingsItems
];

console.log('🌱 Final items array:', items.map(item => item.title));

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  console.log('🌱 Rendering sidebar with network items:', networkNavItems.map(item => item.title));

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
                <span className="text-sm font-semibold">Sproutify School</span>
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