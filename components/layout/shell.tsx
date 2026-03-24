"use client";

import { cn } from "@/lib/utils";
import { SidebarContext, useSidebarState } from "@/hooks/use-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SessionProvider } from "@/components/layout/session-provider";
import { useSidebar } from "@/hooks/use-sidebar";

function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={cn(
        "min-h-screen pb-16 transition-all duration-300 md:pb-0",
        collapsed ? "md:ml-[68px]" : "md:ml-64"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 2xl:max-w-[1400px]">
        {children}
      </div>
    </main>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const sidebarState = useSidebarState();

  return (
    <SessionProvider>
      <SidebarContext.Provider value={sidebarState}>
        <TooltipProvider>
          <Sidebar />
          <MainContent>{children}</MainContent>
          <MobileNav />
        </TooltipProvider>
      </SidebarContext.Provider>
    </SessionProvider>
  );
}
