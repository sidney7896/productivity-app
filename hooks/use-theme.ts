"use client";

import { useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "@/lib/store";

const STORAGE_KEY = "productivity-theme";

export function useTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = getItem<"dark" | "light">(STORAGE_KEY, "dark");
    setThemeState(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
    setLoaded(true);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      setItem(STORAGE_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return { theme, loaded, toggle };
}
