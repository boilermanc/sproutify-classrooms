import { PropsWithChildren } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="h-14 flex items-center gap-3 border-b px-4">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">Sproutify School</span>
          </header>
          <div className="p-4 container">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
