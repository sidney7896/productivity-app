"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { getItem, setItem } from "@/lib/store";

const STORAGE_KEY = "productivity-sidebar-collapsed";

interface SidebarContextType {
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggle: () => {},
  close: () => {},
});

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(getItem<boolean>(STORAGE_KEY, false));
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      setItem(STORAGE_KEY, !prev);
      return !prev;
    });
  }, []);

  const close = useCallback(() => {
    setCollapsed(true);
    setItem(STORAGE_KEY, true);
  }, []);

  return { collapsed, toggle, close };
}

export function useSidebar() {
  return useContext(SidebarContext);
}
