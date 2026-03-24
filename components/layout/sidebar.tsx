"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Timer,
  Calendar,
  BarChart3,
  FolderKanban,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useSidebar } from "@/hooks/use-sidebar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workspace", label: "Workspace", icon: Briefcase },
  { href: "/planning", label: "Planning", icon: Calendar },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/stats", label: "Statistieken", icon: BarChart3 },
  { href: "/projects", label: "Projecten", icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 md:flex",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center py-5 transition-all duration-300",
          collapsed ? "justify-center px-3" : "justify-between px-5"
        )}
      >
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Productify</span>
          </div>
        )}
        {!collapsed && <ThemeToggle />}
      </div>

      <Separator className="bg-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed
                  ? "h-10 w-10 justify-center mx-auto"
                  : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-blue-600/15 text-blue-500"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger render={linkContent} />
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Bottom section */}
      <div className="space-y-2 px-2 pb-4">
        {/* Theme toggle when collapsed */}
        {collapsed && (
          <div className="flex justify-center">
            <ThemeToggle compact />
          </div>
        )}

        {/* FileMaker status */}
        {!collapsed && (
          <div className="mx-1 rounded-lg border border-border bg-accent p-3">
            <p className="text-xs text-muted-foreground">Verbonden met</p>
            <p className="text-sm font-medium">FileMaker</p>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className={cn(
            "flex items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            collapsed
              ? "mx-auto h-10 w-10 justify-center"
              : "w-full gap-3 px-4 py-2.5 text-sm"
          )}
          aria-label={collapsed ? "Menu uitklappen" : "Menu inklappen"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              <span>Inklappen</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
