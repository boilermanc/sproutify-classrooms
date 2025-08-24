import { NavLink, useNavigate } from "react-router-dom";
import { Sprout, Gauge, Trophy, BookOpen, Users, HelpCircle, User, LogOut, Settings } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const items = [
  { title: "Dashboard", url: "/app", icon: Gauge },
  { title: "Classrooms", url: "/app/classrooms", icon: Users },
  { title: "Towers", url: "/app/towers", icon: Sprout },
  { title: "Plant Catalog", url: "/app/catalog", icon: BookOpen },
  { title: "Leaderboard", url: "/app/leaderboard", icon: Trophy },
  { title: "Profile", url: "/app/profile", icon: User },
  { title: "Settings", url: "/app/settings", icon: Settings }, // NEW
  { title: "Help", url: "/app/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { toast } = useToast();
  const navigate = useNavigate();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    navigate("/auth/login");
  };

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-14" : "w-60"}>
      {/* Make the content a flex column that fills height */}
      <SidebarContent className="flex h-full flex-col">
        {/* Top nav group */}
        <SidebarGroup>
          <SidebarGroupLabel>Sproutify School</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
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
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
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