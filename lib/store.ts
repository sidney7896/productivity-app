import { useState, useEffect, useCallback, useRef } from "react";

export function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Safe localStorage hook that prevents the race condition where
 * an empty initial state overwrites stored data before loading completes.
 */
export function useLocalStorage<T>(key: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getItem<T>(key, fallback);
    setData(stored);
    hasLoadedRef.current = true;
    setLoaded(true);
  }, [key]);

  // Save to localStorage only after initial load is complete
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (!loaded) return;
    setItem(key, data);
  }, [data, loaded, key]);

  return [data, setData, loaded] as const;
}
