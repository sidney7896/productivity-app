"use client";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ compact }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Schakel naar licht thema" : "Schakel naar donker thema"}
      className={cn(
        "group relative flex items-center justify-center rounded-lg transition-all duration-200",
        compact ? "h-8 w-8" : "h-9 w-9",
        "hover:bg-accent"
      )}
    >
      {/* Sun - warm yellow/orange */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "absolute h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100",
          "stroke-amber-500"
        )}
      >
        <circle cx="12" cy="12" r="4" className="fill-amber-400/30" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>

      {/* Moon - cool blue/purple */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "absolute h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0",
          "stroke-blue-400"
        )}
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" className="fill-blue-400/20" />
      </svg>

      {/* Click ripple */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-lg",
          "after:absolute after:inset-0 after:rounded-lg after:opacity-0",
          "group-active:after:animate-ping group-active:after:opacity-100",
          isDark ? "after:bg-amber-400/20" : "after:bg-blue-400/20"
        )}
      />
    </button>
  );
}
