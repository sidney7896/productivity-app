"use client";

import { useMemo } from "react";
import { useTodos } from "@/hooks/use-todos";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Timer,
  Target,
  TrendingUp,
} from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { nl } from "date-fns/locale";

function MiniBarChart({ data, max }: { data: { label: string; value: number }[]; max: number }) {
  return (
    <div className="flex items-end gap-1" style={{ height: 120 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-blue-500/60 transition-all"
            style={{
              height: max > 0 ? `${(d.value / max) * 100}px` : "2px",
              minHeight: "2px",
            }}
          />
          <span className="text-[9px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  const { todos, loaded: todosLoaded } = useTodos();
  const { sessions, loaded: pomodoroLoaded } = usePomodoro();

  const stats = useMemo(() => {
    const now = new Date();
    const days7 = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    });

    const todosPerDay = days7.map((day) => {
      const dayStr = startOfDay(day).toISOString().split("T")[0];
      const count = todos.filter(
        (t) =>
          t.completedAt &&
          t.completedAt.startsWith(dayStr)
      ).length;
      return {
        label: format(day, "EEE", { locale: nl }),
        value: count,
      };
    });

    const pomodoroPerDay = days7.map((day) => {
      const dayStr = day.toDateString();
      const count = sessions.filter(
        (s) =>
          s.type === "work" &&
          s.completed &&
          new Date(s.startedAt).toDateString() === dayStr
      ).length;
      return {
        label: format(day, "EEE", { locale: nl }),
        value: count,
      };
    });

    const focusPerDay = days7.map((day) => {
      const dayStr = day.toDateString();
      const mins = sessions
        .filter(
          (s) =>
            s.type === "work" &&
            s.completed &&
            new Date(s.startedAt).toDateString() === dayStr
        )
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      return {
        label: format(day, "EEE", { locale: nl }),
        value: mins,
      };
    });

    const totalCompleted = todos.filter((t) => t.completed).length;
    const totalSessions = sessions.filter(
      (s) => s.type === "work" && s.completed
    ).length;
    const totalFocusMinutes = sessions
      .filter((s) => s.type === "work" && s.completed)
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return {
      todosPerDay,
      pomodoroPerDay,
      focusPerDay,
      totalCompleted,
      totalSessions,
      totalFocusMinutes,
    };
  }, [todos, sessions]);

  const loaded = todosLoaded && pomodoroLoaded;

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
        <h1 className="text-2xl font-bold">Statistieken</h1>
        <p className="text-sm text-muted-foreground">Je productiviteitsoverzicht</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Taken voltooid</p>
            </div>
          </div>
        </Card>
        <Card className="border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
              <Timer className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
              <p className="text-xs text-muted-foreground">Pomodoro sessies</p>
            </div>
          </div>
        </Card>
        <Card className="border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(stats.totalFocusMinutes / 60)}u
              </p>
              <p className="text-xs text-muted-foreground">Focus tijd</p>
            </div>
          </div>
        </Card>
        <Card className="border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todos.length}</p>
              <p className="text-xs text-muted-foreground">Totaal taken</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="todos">
        <TabsList className="bg-muted">
          <TabsTrigger value="todos">Taken</TabsTrigger>
          <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
          <TabsTrigger value="focus">Focus tijd</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <Card className="border-border bg-muted p-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">
              Voltooide taken (afgelopen 7 dagen)
            </h3>
            <MiniBarChart
              data={stats.todosPerDay}
              max={Math.max(...stats.todosPerDay.map((d) => d.value), 1)}
            />
          </Card>
        </TabsContent>

        <TabsContent value="pomodoro">
          <Card className="border-border bg-muted p-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">
              Pomodoro sessies (afgelopen 7 dagen)
            </h3>
            <MiniBarChart
              data={stats.pomodoroPerDay}
              max={Math.max(...stats.pomodoroPerDay.map((d) => d.value), 1)}
            />
          </Card>
        </TabsContent>

        <TabsContent value="focus">
          <Card className="border-border bg-muted p-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">
              Focus minuten (afgelopen 7 dagen)
            </h3>
            <MiniBarChart
              data={stats.focusPerDay}
              max={Math.max(...stats.focusPerDay.map((d) => d.value), 1)}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
