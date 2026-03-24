"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePlanning } from "@/hooks/use-planning";
import { useCalendar, CalendarEvent } from "@/hooks/use-calendar";
import { useItemLinks } from "@/hooks/use-item-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconButton } from "@/components/ui/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Upload,
  Download,
  Pencil,
  FileText,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { LinkedItemsPanel } from "@/components/linked-items-panel";
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);

interface EditState {
  id: string;
  title: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  isCalendar: boolean;
  calendarEventId?: string;
}

export default function PlanningPage() {
  const { data: session } = useSession();
  const { loaded, addBlock, updateBlock, deleteBlock, getBlocksForDate, getBlocksForDateRange } = usePlanning();
  const { events, loading: calLoading, fetchDay, fetchEvents, createEvent, updateEvent, deleteEvent } = useCalendar();
  const { getLinkedNotes } = useItemLinks();

  const [currentDate, setCurrentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [createOpen, setCreateOpen] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newStartHour, setNewStartHour] = useState("9");
  const [newStartMinute, setNewStartMinute] = useState("0");
  const [newEndHour, setNewEndHour] = useState("10");
  const [newEndMinute, setNewEndMinute] = useState("0");
  const [syncToCalendar, setSyncToCalendar] = useState(false);

  const set = (fn: (v: string) => void) => (v: string | null) => {
    if (v !== null) fn(v);
  };

  // Fetch calendar events based on view
  useEffect(() => {
    if (!session) return;
    if (viewMode === "day") {
      fetchDay(new Date(currentDate));
    } else if (viewMode === "week") {
      const start = startOfWeek(new Date(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(currentDate), { weekStartsOn: 1 });
      fetchEvents(start.toISOString(), end.toISOString());
    } else {
      const start = startOfMonth(new Date(currentDate));
      const end = endOfMonth(new Date(currentDate));
      fetchEvents(start.toISOString(), end.toISOString());
    }
  }, [session, currentDate, viewMode, fetchDay, fetchEvents]);

  // Navigation
  const prev = () => {
    const d = new Date(currentDate);
    if (viewMode === "day") setCurrentDate(format(subDays(d, 1), "yyyy-MM-dd"));
    else if (viewMode === "week") setCurrentDate(format(subWeeks(d, 1), "yyyy-MM-dd"));
    else setCurrentDate(format(subMonths(d, 1), "yyyy-MM-dd"));
  };
  const next = () => {
    const d = new Date(currentDate);
    if (viewMode === "day") setCurrentDate(format(addDays(d, 1), "yyyy-MM-dd"));
    else if (viewMode === "week") setCurrentDate(format(addWeeks(d, 1), "yyyy-MM-dd"));
    else setCurrentDate(format(addMonths(d, 1), "yyyy-MM-dd"));
  };
  const goToday = () => setCurrentDate(format(new Date(), "yyyy-MM-dd"));

  // Create
  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const sh = parseInt(newStartHour), sm = parseInt(newStartMinute);
    const eh = parseInt(newEndHour), em = parseInt(newEndMinute);
    addBlock(newTitle.trim(), sh, sm, eh, em, currentDate);
    if (syncToCalendar && session) {
      const startDT = `${currentDate}T${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}:00`;
      const endDT = `${currentDate}T${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00`;
      await createEvent(newTitle.trim(), startDT, endDT);
      fetchDay(new Date(currentDate));
    }
    setNewTitle("");
    setCreateOpen(false);
  };

  // Edit
  const openEdit = (block: any) => {
    setEditState({
      id: block.id,
      title: block.title,
      startHour: String(block.startHour),
      startMinute: String(block.startMinute),
      endHour: String(block.endHour),
      endMinute: String(block.endMinute),
      isCalendar: !!block.isCalendar,
      calendarEventId: block.calendarEventId,
    });
  };

  const handleSaveEdit = async () => {
    if (!editState) return;
    const sh = parseInt(editState.startHour), sm = parseInt(editState.startMinute);
    const eh = parseInt(editState.endHour), em = parseInt(editState.endMinute);

    if (editState.isCalendar && editState.calendarEventId) {
      const startDT = `${currentDate}T${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}:00`;
      const endDT = `${currentDate}T${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00`;
      await updateEvent(editState.calendarEventId, editState.title, startDT, endDT);
      fetchDay(new Date(currentDate));
    } else {
      updateBlock(editState.id, {
        title: editState.title,
        startHour: sh, startMinute: sm,
        endHour: eh, endMinute: em,
      });
    }
    setEditState(null);
  };

  // Convert calendar events to block-like objects for rendering
  const calendarEventsAsBlocks = events
    .map((e) => {
      if (!e.start.dateTime || !e.end.dateTime) return null;
      const s = parseISO(e.start.dateTime), end = parseISO(e.end.dateTime);
      return {
        id: `gcal-${e.id}`,
        title: e.summary || "(Geen titel)",
        startHour: s.getHours(), startMinute: s.getMinutes(),
        endHour: end.getHours(), endMinute: end.getMinutes(),
        date: format(s, "yyyy-MM-dd"),
        isCalendar: true as const,
        calendarEventId: e.id,
        color: "",
      };
    })
    .filter(Boolean) as any[];

  // Get all blocks for a date (local + calendar)
  const getAllBlocksForDate = (date: string) => {
    const local = getBlocksForDate(date).map((b) => ({ ...b, isCalendar: false }));
    const cal = calendarEventsAsBlocks.filter((b) => b.date === date);
    return [...local, ...cal].sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute));
  };

  const dateLabel = () => {
    const d = new Date(currentDate);
    if (viewMode === "day") return format(d, "EEEE d MMMM yyyy", { locale: nl });
    if (viewMode === "week") {
      const ws = startOfWeek(d, { weekStartsOn: 1 });
      const we = endOfWeek(d, { weekStartsOn: 1 });
      return `${format(ws, "d MMM", { locale: nl })} – ${format(we, "d MMM yyyy", { locale: nl })}`;
    }
    return format(d, "MMMM yyyy", { locale: nl });
  };

  // Time select helper
  const TimeSelects = ({ hVal, mVal, hSet, mSet }: { hVal: string; mVal: string; hSet: (v: string) => void; mSet: (v: string) => void }) => (
    <div className="flex gap-1">
      <Select value={hVal} onValueChange={(v) => v && hSet(v)}>
        <SelectTrigger className="border-border bg-muted"><SelectValue /></SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => <SelectItem key={h} value={String(h)}>{String(h).padStart(2, "0")}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={mVal} onValueChange={(v) => v && mSet(v)}>
        <SelectTrigger className="w-20 border-border bg-muted"><SelectValue /></SelectTrigger>
        <SelectContent>
          {[0, 15, 30, 45].map((m) => <SelectItem key={m} value={String(m)}>{String(m).padStart(2, "0")}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  // Block component for timeline views
  const BlockItem = ({ block, compact }: { block: any; compact?: boolean }) => {
    const isCalendar = block.isCalendar;
    const hasNote = !isCalendar && getLinkedNotes("planning", block.id).length > 0;
    return (
      <div
        onClick={(e) => { e.stopPropagation(); openEdit(block); }}
        className={cn(
          "rounded-md border px-2 py-1 cursor-pointer transition-colors group",
          isCalendar
            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
            : block.color || "border-blue-500/40 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
        )}
      >
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            {isCalendar && <CalendarDays className="h-2.5 w-2.5 shrink-0 opacity-70" />}
            {hasNote && <FileText className="h-2.5 w-2.5 shrink-0 text-purple-400" />}
            <span className={cn("font-medium truncate", compact ? "text-[10px]" : "text-xs")}>{block.title}</span>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
            <IconButton
              icon={<Pencil className="h-2.5 w-2.5" />}
              tooltip="Bewerken"
              onClick={() => openEdit(block)}
              className="h-5 w-5 p-0"
            />
            <IconButton
              icon={<Trash2 className="h-2.5 w-2.5" />}
              tooltip="Verwijderen"
              onClick={() => isCalendar ? deleteEvent(block.calendarEventId).then(() => fetchDay(new Date(currentDate))) : deleteBlock(block.id)}
              className="h-5 w-5 p-0 hover:text-red-400"
            />
          </div>
        </div>
        {!compact && (
          <span className="text-[10px] opacity-70">
            {String(block.startHour).padStart(2, "0")}:{String(block.startMinute).padStart(2, "0")} – {String(block.endHour).padStart(2, "0")}:{String(block.endMinute).padStart(2, "0")}
            {isCalendar && " · Google"}
          </span>
        )}
      </div>
    );
  };

  if (!loaded) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div>;
  }

  // Week days
  const weekStart = startOfWeek(new Date(currentDate), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(new Date(currentDate), { weekStartsOn: 1 }) });

  // Month days
  const monthStart = startOfMonth(new Date(currentDate));
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridEnd = endOfWeek(endOfMonth(new Date(currentDate)), { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthGridEnd });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dagplanning</h1>
          <p className="text-sm text-muted-foreground">
            {getBlocksForDate(currentDate).length} blokken
            {session && calendarEventsAsBlocks.length > 0 && ` · ${calendarEventsAsBlocks.length} agenda`}
            {calLoading && " · laden..."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {session && viewMode === "day" && (
            <>
              <IconButton icon={<Download className="h-3.5 w-3.5" />} tooltip="Import van Google Calendar" onClick={() => {
                calendarEventsAsBlocks.filter(b => b.date === currentDate).forEach(cb => {
                  if (!getBlocksForDate(currentDate).some(lb => lb.title === cb.title && lb.startHour === cb.startHour))
                    addBlock(cb.title, cb.startHour, cb.startMinute, cb.endHour, cb.endMinute, currentDate);
                });
              }} variant="outline" className="border-border" />
              <IconButton icon={<Upload className="h-3.5 w-3.5" />} tooltip="Export naar Google Calendar" onClick={async () => {
                for (const b of getBlocksForDate(currentDate)) {
                  const startDT = `${currentDate}T${String(b.startHour).padStart(2, "0")}:${String(b.startMinute).padStart(2, "0")}:00`;
                  const endDT = `${currentDate}T${String(b.endHour).padStart(2, "0")}:${String(b.endMinute).padStart(2, "0")}:00`;
                  await createEvent(b.title, startDT, endDT);
                }
                fetchDay(new Date(currentDate));
              }} variant="outline" className="border-border" />
            </>
          )}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
              <Plus className="mr-1 h-4 w-4" />Blok toevoegen
            </DialogTrigger>
            <DialogContent className="border-border bg-card">
              <DialogHeader><DialogTitle>Nieuw tijdblok</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Wat ga je doen?" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="border-border bg-muted" />
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="mb-1 block text-xs text-muted-foreground">Start</label>
                    <TimeSelects hVal={newStartHour} mVal={newStartMinute} hSet={setNewStartHour} mSet={setNewStartMinute} /></div>
                  <div><label className="mb-1 block text-xs text-muted-foreground">Eind</label>
                    <TimeSelects hVal={newEndHour} mVal={newEndMinute} hSet={setNewEndHour} mSet={setNewEndMinute} /></div>
                </div>
                {session && (
                  <div className="flex items-center gap-2">
                    <Checkbox id="sync-cal" checked={syncToCalendar} onCheckedChange={(v) => setSyncToCalendar(v === true)} />
                    <Label htmlFor="sync-cal" className="text-sm text-muted-foreground">Ook toevoegen aan Google Calendar</Label>
                  </div>
                )}
                <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">Toevoegen</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* View mode tabs + Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={viewMode} onValueChange={(v) => v && setViewMode(v as any)}>
          <TabsList className="bg-muted">
            <TabsTrigger value="day">Dag</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Maand</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <IconButton icon={<ChevronLeft className="h-4 w-4" />} tooltip="Vorige" onClick={prev} variant="outline" className="border-border" />
          <Button variant="outline" onClick={goToday} className="border-border px-4">Vandaag</Button>
          <span className="text-sm font-medium">{dateLabel()}</span>
          <IconButton icon={<ChevronRight className="h-4 w-4" />} tooltip="Volgende" onClick={next} variant="outline" className="border-border" />
        </div>
      </div>

      {/* Google Calendar connect / legend / error */}
      {session && (session as any).error === "RefreshAccessTokenError" ? (
        <Card className="flex items-center justify-between border-border bg-red-950/30 border-red-800/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-300">Google Calendar verbinding verlopen</span>
          </div>
          <Button size="sm" onClick={() => signIn("google")} className="bg-red-600 hover:bg-red-700 text-xs">
            Opnieuw verbinden
          </Button>
        </Card>
      ) : session ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-blue-500" />Lokaal</div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Google Calendar</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{session.user?.email}</span>
            <IconButton
              icon={<LogOut className="h-3.5 w-3.5" />}
              tooltip="Google ontkoppelen"
              size="sm"
              variant="ghost"
              onClick={() => signOut()}
              className="h-7 w-7 text-muted-foreground hover:text-red-400"
            />
          </div>
        </div>
      ) : (
        <Card className="flex items-center justify-between border-border bg-muted px-4 py-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-muted-foreground">Verbind Google Calendar om agenda events te syncen</span>
          </div>
          <Button size="sm" onClick={() => signIn("google")} className="bg-blue-600 hover:bg-blue-700 text-xs">
            Verbinden
          </Button>
        </Card>
      )}

      {/* === DAY VIEW === */}
      {viewMode === "day" && (
        <Card className="border-border bg-muted p-4">
          {HOURS.map((hour) => {
            const blocks = getAllBlocksForDate(currentDate).filter((b) => b.startHour === hour);
            return (
              <div key={hour} className="flex min-h-[60px] border-t border-border/50">
                <span className="w-16 shrink-0 py-2 text-xs text-muted-foreground">{String(hour).padStart(2, "0")}:00</span>
                <div className="relative flex-1 py-1">
                  {blocks.map((block) => {
                    const dur = (block.endHour - block.startHour) * 60 + (block.endMinute - block.startMinute);
                    const h = Math.max((dur / 60) * 60, 32);
                    const top = (block.startMinute / 60) * 60;
                    return (
                      <div key={block.id} className="absolute left-0 right-0" style={{ height: `${h}px`, top: `${top}px` }}>
                        <BlockItem block={block} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* === WEEK VIEW === */}
      {viewMode === "week" && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const blocks = getAllBlocksForDate(dateStr);
            return (
              <Card key={dateStr} className={cn("border-border bg-muted p-2 min-h-[200px]", isToday(day) && "ring-2 ring-blue-500/50")}>
                <div className="mb-2">
                  <p className="text-[10px] text-muted-foreground uppercase">{format(day, "EEE", { locale: nl })}</p>
                  <p className={cn("text-sm font-bold", isToday(day) && "text-blue-500")}>{format(day, "d")}</p>
                </div>
                <div className="space-y-1">
                  {blocks.map((block) => <BlockItem key={block.id} block={block} compact />)}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* === MONTH VIEW === */}
      {viewMode === "month" && (
        <div>
          <div className="grid grid-cols-7 gap-px mb-1">
            {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((d) => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const blocks = getAllBlocksForDate(dateStr);
              const inMonth = isSameMonth(day, new Date(currentDate));
              return (
                <div
                  key={dateStr}
                  onClick={() => { setCurrentDate(dateStr); setViewMode("day"); }}
                  className={cn(
                    "min-h-[80px] rounded-md border border-border/50 p-1.5 cursor-pointer transition-colors hover:bg-accent",
                    !inMonth && "opacity-40",
                    isToday(day) && "ring-2 ring-blue-500/50"
                  )}
                >
                  <p className={cn("text-xs font-medium", isToday(day) && "text-blue-500")}>{format(day, "d")}</p>
                  <div className="mt-1 space-y-0.5">
                    {blocks.slice(0, 3).map((b) => (
                      <div key={b.id} className={cn("truncate rounded px-1 text-[9px]", b.isCalendar ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400")}>
                        {b.title}
                      </div>
                    ))}
                    {blocks.length > 3 && <p className="text-[9px] text-muted-foreground">+{blocks.length - 3} meer</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected block linking panel (day view) */}
      {viewMode === "day" && selectedBlockId && (() => {
        const block = getBlocksForDate(currentDate).find((b) => b.id === selectedBlockId);
        if (!block) return null;
        return (
          <Card className="border-border bg-muted p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{block.title}</span>
            </div>
            <LinkedItemsPanel currentType="planning" currentId={block.id} />
          </Card>
        );
      })()}

      {/* Edit dialog */}
      <Dialog open={!!editState} onOpenChange={(open) => !open && setEditState(null)}>
        <DialogContent className="border-border bg-card">
          {editState && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {editState.isCalendar ? "Google Calendar event bewerken" : "Tijdblok bewerken"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input value={editState.title} onChange={(e) => setEditState({ ...editState, title: e.target.value })} className="border-border bg-muted" />
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="mb-1 block text-xs text-muted-foreground">Start</label>
                    <TimeSelects hVal={editState.startHour} mVal={editState.startMinute}
                      hSet={(v) => setEditState({ ...editState, startHour: v })}
                      mSet={(v) => setEditState({ ...editState, startMinute: v })} /></div>
                  <div><label className="mb-1 block text-xs text-muted-foreground">Eind</label>
                    <TimeSelects hVal={editState.endHour} mVal={editState.endMinute}
                      hSet={(v) => setEditState({ ...editState, endHour: v })}
                      mSet={(v) => setEditState({ ...editState, endMinute: v })} /></div>
                </div>
                <Button onClick={handleSaveEdit} className="w-full bg-blue-600 hover:bg-blue-700">Opslaan</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
