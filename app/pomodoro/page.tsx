"use client";

import { useEffect } from "react";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, SkipForward, Settings, Coffee, Flame } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default function PomodoroPage() {
  const {
    settings,
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
  } = usePomodoro();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const totalSeconds =
    currentType === "work"
      ? settings.workMinutes * 60
      : settings.breakMinutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  if (!loaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pomodoro Timer</h1>
        <p className="text-sm text-muted-foreground">
          {todaySessions.length} sessies vandaag &middot;{" "}
          {todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0)} min focus
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timer */}
        <Card className="border-border bg-muted p-8 lg:col-span-2">
          <div className="flex flex-col items-center">
            <div className="mb-2 flex items-center gap-2">
              {currentType === "work" ? (
                <Flame className="h-5 w-5 text-orange-400" />
              ) : (
                <Coffee className="h-5 w-5 text-green-400" />
              )}
              <span
                className={cn(
                  "text-sm font-medium uppercase tracking-wider",
                  currentType === "work" ? "text-orange-400" : "text-green-400"
                )}
              >
                {currentType === "work" ? "Focus" : "Pauze"}
              </span>
            </div>

            {/* Circular progress */}
            <div className="relative mb-8 flex h-64 w-64 items-center justify-center">
              <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={currentType === "work" ? "#3b82f6" : "#22c55e"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="text-center">
                <span className="font-mono text-6xl font-bold tabular-nums">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sessie {sessionCount + 1}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <IconButton
                icon={<RotateCcw className="h-5 w-5" />}
                tooltip="Timer resetten"
                onClick={reset}
                variant="outline"
                className="h-12 w-12 rounded-full border-border"
              />
              <IconButton
                icon={isRunning ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
                tooltip={isRunning ? "Pauzeren" : "Starten"}
                onClick={isRunning ? pause : start}
                variant="default"
                className={cn(
                  "h-14 w-14 rounded-full text-white",
                  currentType === "work"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                )}
              />
              <IconButton
                icon={<SkipForward className="h-5 w-5" />}
                tooltip="Overslaan"
                onClick={skip}
                variant="outline"
                className="h-12 w-12 rounded-full border-border"
              />
            </div>
          </div>
        </Card>

        {/* Settings & Sessions */}
        <div className="space-y-4">
          <Card className="border-border bg-muted p-4">
            <div className="mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Instellingen</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Werk: {settings.workMinutes} min
                </Label>
                <Slider
                  value={[settings.workMinutes]}
                  onValueChange={(v) => updateSettings({ workMinutes: Array.isArray(v) ? v[0] : v })}
                  min={5}
                  max={60}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Pauze: {settings.breakMinutes} min
                </Label>
                <Slider
                  value={[settings.breakMinutes]}
                  onValueChange={(v) => updateSettings({ breakMinutes: Array.isArray(v) ? v[0] : v })}
                  min={1}
                  max={30}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Lange pauze: {settings.longBreakMinutes} min
                </Label>
                <Slider
                  value={[settings.longBreakMinutes]}
                  onValueChange={(v) =>
                    updateSettings({ longBreakMinutes: Array.isArray(v) ? v[0] : v })
                  }
                  min={5}
                  max={45}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-muted p-4">
            <h3 className="mb-3 text-sm font-medium">Vandaag</h3>
            {todaySessions.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nog geen sessies vandaag</p>
            ) : (
              <div className="space-y-2">
                {todaySessions.slice(0, 8).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">
                      {format(new Date(s.startedAt), "HH:mm", { locale: nl })}
                    </span>
                    <span className="text-muted-foreground">
                      {s.durationMinutes} min focus
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
