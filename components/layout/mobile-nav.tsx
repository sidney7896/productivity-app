"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Timer,
  Calendar,
  BarChart3,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/workspace", label: "Workspace", icon: Briefcase },
  { href: "/planning", label: "Plan", icon: Calendar },
  { href: "/pomodoro", label: "Timer", icon: Timer },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors",
                isActive ? "text-blue-500" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <div className="flex flex-col items-center gap-0.5 px-1 py-2">
          <ThemeToggle compact />
        </div>
      </div>
    </nav>
  );
}
