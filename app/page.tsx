"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTodos } from "@/hooks/use-todos";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { useNotes } from "@/hooks/use-notes";
import { usePlanning } from "@/hooks/use-planning";
import { useCalendar } from "@/hooks/use-calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  CheckCircle2,
  Timer,
  StickyNote,
  Calendar,
  CalendarDays,
  ArrowRight,
  Flame,
  Target,
  Zap,
  Clock,
} from "lucide-react";
import { parseISO } from "date-fns";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { todos, loaded: todosLoaded } = useTodos();
  const { todaySessions, isRunning, secondsLeft, currentType, loaded: pomodoroLoaded } =
    usePomodoro();
  const { notes, loaded: notesLoaded } = useNotes();
  const { getBlocksForDate, loaded: planningLoaded } = usePlanning();
  const { events: calendarEvents, fetchDay } = useCalendar();

  const loaded = todosLoaded && pomodoroLoaded && notesLoaded && planningLoaded;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayBlocks = getBlocksForDate(todayStr);

  useEffect(() => {
    if (session) fetchDay(new Date());
  }, [session, fetchDay]);

  const activeTodos = todos.filter((t) => !t.completed);
  const todayCompletedTodos = todos.filter(
    (t) =>
      t.completed &&
      t.completedAt &&
      t.completedAt.startsWith(todayStr)
  );
  const todayFocusMinutes = todaySessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );

  const pomodoroMinutes = Math.floor(secondsLeft / 60);
  const pomodoroSeconds = secondsLeft % 60;

  if (!loaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Goedemorgen{" "}
          <span className="inline-block animate-pulse">
            <Zap className="inline h-6 w-6 text-yellow-400" />
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: nl })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeTodos.length}</p>
              <p className="text-xs text-muted-foreground">Open taken</p>
            </div>
          </div>
        </Card>
        <Card className="border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <Target className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayCompletedTodos.length}</p>
              <p className="text-xs text-muted-foreground">Vandaag voltooid</p>
            </div>
          </div>
        </Card>
        <Card className="border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todaySessions.length}</p>
              <p className="text-xs text-muted-foreground">Pomodoro sessies</p>
            </div>
          </div>
        </Card>
        <Card className="border-border bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Timer className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayFocusMinutes}m</p>
              <p className="text-xs text-muted-foreground">Focus tijd</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Pomodoro */}
        <Card className="border-border bg-muted p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Timer className="h-4 w-4" />
              Pomodoro Timer
            </h3>
            <Link href="/pomodoro">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Open <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span
                className={cn(
                  "font-mono text-3xl font-bold tabular-nums",
                  isRunning && "text-blue-400"
                )}
              >
                {String(pomodoroMinutes).padStart(2, "0")}:
                {String(pomodoroSeconds).padStart(2, "0")}
              </span>
              <p className="mt-1 text-xs text-muted-foreground uppercase">
                {currentType === "work" ? "Focus" : "Pauze"}
              </p>
            </div>
            {isRunning && (
              <div className="flex-1">
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${
                        ((currentType === "work"
                          ? 25 * 60 - secondsLeft
                          : 5 * 60 - secondsLeft) /
                          (currentType === "work" ? 25 * 60 : 5 * 60)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Today's planning */}
        <Card className="border-border bg-muted p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Dagplanning
            </h3>
            <Link href="/planning">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Open <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          {todayBlocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Geen blokken gepland vandaag</p>
          ) : (
            <div className="space-y-2">
              {todayBlocks.slice(0, 4).map((block) => (
                <div
                  key={block.id}
                  className={cn("rounded-md border px-3 py-2 text-xs", block.color)}
                >
                  <span className="font-medium">{block.title}</span>
                  <span className="ml-2 opacity-70">
                    {String(block.startHour).padStart(2, "0")}:
                    {String(block.startMinute).padStart(2, "0")} -{" "}
                    {String(block.endHour).padStart(2, "0")}:
                    {String(block.endMinute).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Google Calendar events */}
        {session && (
          <Card className="border-border bg-muted p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Agenda vandaag
              </h3>
              <Link href="/planning">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  Open <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            {calendarEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Geen events vandaag</p>
            ) : (
              <div className="space-y-2">
                {calendarEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs"
                  >
                    <span className="font-medium">{event.summary}</span>
                    {event.start.dateTime && (
                      <span className="ml-2 text-muted-foreground">
                        <Clock className="mr-0.5 inline h-3 w-3" />
                        {format(parseISO(event.start.dateTime), "HH:mm")}
                        {event.end.dateTime && ` – ${format(parseISO(event.end.dateTime), "HH:mm")}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Top todos */}
        <Card className="border-border bg-muted p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              To-Do&apos;s
            </h3>
            <Link href="/workspace">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Alle taken <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          {activeTodos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Alle taken voltooid!</p>
          ) : (
            <div className="space-y-2">
              {activeTodos.slice(0, 5).map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      todo.priority === "high"
                        ? "bg-red-400"
                        : todo.priority === "medium"
                          ? "bg-yellow-400"
                          : "bg-green-400"
                    )}
                  />
                  <span className="truncate">{todo.title}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent notes */}
        <Card className="border-border bg-muted p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <StickyNote className="h-4 w-4" />
              Recente notities
            </h3>
            <Link href="/workspace">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Alle notities <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nog geen notities</p>
          ) : (
            <div className="space-y-2">
              {notes.slice(0, 4).map((note) => (
                <div key={note.id} className="text-sm">
                  <p className="font-medium truncate">{note.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {note.content || "Geen inhoud"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
