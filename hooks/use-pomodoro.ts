"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PomodoroSession, PomodoroSettings } from "@/types";
import { getItem, setItem, generateId } from "@/lib/store";

const SESSIONS_KEY = "productivity-pomodoro-sessions";
const SETTINGS_KEY = "productivity-pomodoro-settings";

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

export function usePomodoro() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SETTINGS.workMinutes * 60);
  const [currentType, setCurrentType] = useState<"work" | "break">("work");
  const [sessionCount, setSessionCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedSettings = getItem<PomodoroSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
    const savedSessions = getItem<PomodoroSession[]>(SESSIONS_KEY, []);
    setSettings(savedSettings);
    setSessions(savedSessions);
    setSecondsLeft(savedSettings.workMinutes * 60);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) setItem(SESSIONS_KEY, sessions);
  }, [sessions, loaded]);

  useEffect(() => {
    if (loaded) setItem(SETTINGS_KEY, settings);
  }, [settings, loaded]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentType]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    const session: PomodoroSession = {
      id: generateId(),
      startedAt: new Date(
        Date.now() -
          (currentType === "work"
            ? settings.workMinutes
            : settings.breakMinutes) *
            60000
      ).toISOString(),
      endedAt: new Date().toISOString(),
      type: currentType,
      durationMinutes:
        currentType === "work" ? settings.workMinutes : settings.breakMinutes,
      completed: true,
    };
    setSessions((prev) => [session, ...prev]);

    if (currentType === "work") {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      const isLongBreak = newCount % settings.sessionsBeforeLongBreak === 0;
      setCurrentType("break");
      setSecondsLeft(
        (isLongBreak ? settings.longBreakMinutes : settings.breakMinutes) * 60
      );
    } else {
      setCurrentType("work");
      setSecondsLeft(settings.workMinutes * 60);
    }

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(
        currentType === "work" ? "Pauze tijd!" : "Terug aan het werk!",
        { body: currentType === "work" ? "Goed gedaan! Neem een pauze." : "Pauze voorbij. Focus!" }
      );
    }
  }, [currentType, settings, sessionCount]);

  const start = useCallback(() => setIsRunning(true), []);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentType("work");
    setSecondsLeft(settings.workMinutes * 60);
  }, [settings]);

  const skip = useCallback(() => {
    setIsRunning(false);
    if (currentType === "work") {
      setCurrentType("break");
      setSecondsLeft(settings.breakMinutes * 60);
    } else {
      setCurrentType("work");
      setSecondsLeft(settings.workMinutes * 60);
    }
  }, [currentType, settings]);

  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (!isRunning) {
        setSecondsLeft(
          currentType === "work"
            ? updated.workMinutes * 60
            : updated.breakMinutes * 60
        );
      }
      return updated;
    });
  }, [isRunning, currentType]);

  const todaySessions = sessions.filter((s) => {
    const today = new Date().toDateString();
    return new Date(s.startedAt).toDateString() === today && s.type === "work" && s.completed;
  });

  return {
    settings,
    sessions,
    todaySessions,
    isRunning,
    secondsLeft,
    currentType,
    sessionCount,
    loaded,
    start,
    pause,
    reset,
    skip,
    updateSettings,
  };
}
