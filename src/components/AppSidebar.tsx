import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Sprout, Gauge, Trophy, BookOpen, Users, HelpCircle, User, LogOut, Settings, Bug } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";

const items = [
  { title: "Dashboard", url: "/app", icon: Gauge },
  { title: "My Classrooms", url: "/app/classrooms", icon: Users },
  { title: "Towers", url: "/app/towers", icon: Sprout },
  { title: "Plant Catalog", url: "/app/catalog", icon: BookOpen },
  { title: "Pest & Disease Guide", url: "/app/pest-disease-guide", icon: Bug },
  { title: "Leaderboard", url: "/app/leaderboard", icon: Trophy },
  { title: "Profile", url: "/app/profile", icon: User },
  { title: "Settings", url: "/app/settings", icon: Settings },
  { title: "Help", url: "/app/help", icon: HelpCircle },
];

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
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    navigate("/auth/login");
  };

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

        {/* Top nav group */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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