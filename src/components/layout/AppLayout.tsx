import { PropsWithChildren } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
export default function AppLayout({ children }: PropsWithChildren) {
  const { profile, loading, getGreeting } = useProfile();
  const renderHeaderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      );
    }
    const greeting = getGreeting();
    const schoolName = profile?.school_name;
    return (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {greeting}
        </span>
        {schoolName && (
          <span className="text-xs text-muted-foreground">
            {schoolName}
          </span>
        )}
        {!schoolName && (
          <span className="text-xs text-muted-foreground">
            Sproutify School
          </span>
        )}
      </div>
    );
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="h-14 flex items-center justify-between border-b px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              {renderHeaderContent()}
            </div>
            <ThemeToggle />
          </header>
          <div className="p-4 container">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
