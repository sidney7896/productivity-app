"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/use-todos";
import { useNotes } from "@/hooks/use-notes";
import { useItemLinks } from "@/hooks/use-item-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search,
  Filter,
  ChevronDown,
  StickyNote,
  Pencil,
  Link2,
  Tag,
  Bell,
  BellRing,
  Clock,
  CalendarClock,
  CheckSquare,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Todo, Note } from "@/types";
import { LinkedItemsPanel } from "@/components/linked-items-panel";

const priorityColors: Record<Todo["priority"], string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const priorityLabels: Record<Todo["priority"], string> = {
  high: "Hoog",
  medium: "Medium",
  low: "Laag",
};

function formatDueLabel(dueDate: string, dueTime?: string): string {
  const date = parseISO(dueDate);
  let label = "";
  if (isToday(date)) label = "Vandaag";
  else if (isTomorrow(date)) label = "Morgen";
  else label = format(date, "d MMM", { locale: nl });
  if (dueTime) label += ` ${dueTime}`;
  return label;
}

function isDueOverdue(dueDate: string, dueTime?: string): boolean {
  if (dueTime) {
    const dt = new Date(`${dueDate}T${dueTime}`);
    return isPast(dt);
  }
  return isPast(parseISO(dueDate)) && !isToday(parseISO(dueDate));
}

export default function WorkspacePage() {
  const { todos, loaded: todosLoaded, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodos();
  const { notes, loaded: notesLoaded, addNote, updateNote, deleteNote } = useNotes();
  const { getLinkedNotes, getLinksForItem } = useItemLinks();

  // Todos state
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Todo["priority"]>("medium");
  const [newCategory, setNewCategory] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDueTime, setNewDueTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null);

  // Notes state
  const [noteSearch, setNoteSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  // Reminder state
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newReminderCategory, setNewReminderCategory] = useState("");
  const [expandedReminder, setExpandedReminder] = useState<string | null>(null);

  const loaded = todosLoaded && notesLoaded;

  // --- Todos logic ---
  const handleAddTodo = () => {
    if (!newTitle.trim()) return;
    const todo = addTodo(newTitle.trim(), newPriority, newCategory.trim());
    if (newDueDate) updateTodo(todo.id, { dueDate: newDueDate, dueTime: newDueTime || undefined });
    setNewTitle("");
    setNewCategory("");
    setNewDueDate("");
    setNewDueTime("");
  };

  const filteredTodos = todos.filter((t) => {
    if (t.isReminder) return false;
    if (!showCompleted && t.completed) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeTodos = todos.filter((t) => !t.completed && !t.isReminder);
  const completedCount = todos.filter((t) => t.completed && !t.isReminder).length;

  // --- Notes logic ---
  const handleAddNote = () => {
    if (!newNoteTitle.trim()) return;
    addNote(newNoteTitle.trim(), newNoteContent, newNoteCategory.trim());
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteCategory("");
    setNoteDialogOpen(false);
  };

  const categories = Array.from(new Set(notes.map((n) => n.category).filter(Boolean))).sort();

  const filteredNotes = notes.filter((n) => {
    if (filterCategory === "__uncategorized__" && n.category) return false;
    else if (filterCategory !== "all" && filterCategory !== "__uncategorized__" && n.category !== filterCategory) return false;
    if (!noteSearch) return true;
    const q = noteSearch.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
  });

  const activeNote = selectedNote ? notes.find((n) => n.id === selectedNote) : null;

  // --- Reminders logic ---
  const reminders = todos.filter((t) => t.isReminder);
  const activeReminders = reminders.filter((t) => !t.completed);
  const completedReminders = reminders.filter((t) => t.completed);

  const handleAddReminder = () => {
    if (!newReminderTitle.trim()) return;
    const todo = addTodo(newReminderTitle.trim(), "medium", newReminderCategory.trim());
    updateTodo(todo.id, {
      isReminder: true,
      dueDate: newReminderDate || undefined,
      dueTime: newReminderTime || undefined,
    });
    setNewReminderTitle("");
    setNewReminderDate("");
    setNewReminderTime("");
    setNewReminderCategory("");
  };

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
        <h1 className="text-2xl font-bold">Workspace</h1>
        <p className="text-sm text-muted-foreground">
          {activeTodos.length} taken &middot; {notes.length} notities &middot; {activeReminders.length} herinneringen
        </p>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="todos"
            className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
          >
            <CheckSquare className="h-4 w-4" />
            Taken
            {activeTodos.length > 0 && (
              <Badge variant="outline" className="ml-1 h-5 min-w-[20px] justify-center rounded-full border-border px-1.5 text-[10px]">
                {activeTodos.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
          >
            <StickyNote className="h-4 w-4" />
            Notities
            {notes.length > 0 && (
              <Badge variant="outline" className="ml-1 h-5 min-w-[20px] justify-center rounded-full border-border px-1.5 text-[10px]">
                {notes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="reminders"
            className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
          >
            <Bell className="h-4 w-4" />
            Herinneringen
            {activeReminders.length > 0 && (
              <Badge variant="outline" className="ml-1 h-5 min-w-[20px] justify-center rounded-full border-border px-1.5 text-[10px]">
                {activeReminders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ========== TAKEN TAB ========== */}
        <TabsContent value="todos" className="mt-4 space-y-4">
          <Card className="border-border bg-muted p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Nieuwe taak..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                className="flex-1 border-border bg-muted"
              />
              <Input
                placeholder="Categorie"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border-border bg-muted sm:w-28"
              />
              <Select value={newPriority} onValueChange={(v) => v && setNewPriority(v as Todo["priority"])}>
                <SelectTrigger className="w-full border-border bg-muted sm:w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Hoog</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Laag</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddTodo} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-1 h-4 w-4" />
                Toevoegen
              </Button>
            </div>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Zoeken..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-border bg-muted pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterPriority} onValueChange={(v) => v && setFilterPriority(v)}>
                <SelectTrigger className="w-28 border-border bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="high">Hoog</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Laag</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
                className={cn("border-border", showCompleted && "bg-muted")}
              >
                {showCompleted ? "Verberg voltooid" : "Toon voltooid"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTodos.length === 0 ? (
              <Card className="border-border bg-muted p-8 text-center">
                <p className="text-muted-foreground">
                  {activeTodos.length === 0 ? "Nog geen taken. Voeg er een toe!" : "Geen taken gevonden."}
                </p>
              </Card>
            ) : (
              filteredTodos.map((todo) => {
                const isExpanded = expandedTodo === todo.id;
                const hasLinkedNotes = getLinkedNotes("todo", todo.id).length > 0;
                const isOverdue = todo.dueDate && !todo.completed && isDueOverdue(todo.dueDate, todo.dueTime);
                return (
                  <Card
                    key={todo.id}
                    className={cn("border-border bg-muted transition-opacity", todo.completed && "opacity-50")}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setExpandedTodo(isExpanded ? null : todo.id)}
                      >
                        <p className={cn("text-sm font-medium truncate", todo.completed && "line-through text-muted-foreground")}>
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {todo.category && <span className="text-xs text-muted-foreground">{todo.category}</span>}
                          {todo.dueDate && (
                            <span className={cn("text-xs flex items-center gap-1", isOverdue ? "text-red-400" : "text-muted-foreground")}>
                              <Clock className="h-3 w-3" />
                              {formatDueLabel(todo.dueDate, todo.dueTime)}
                            </span>
                          )}
                        </div>
                      </div>
                      {hasLinkedNotes && <StickyNote className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                      <Select
                        value={todo.priority}
                        onValueChange={(v) => { if (v) updateTodo(todo.id, { priority: v as Todo["priority"] }); }}
                      >
                        <SelectTrigger
                          className={cn("h-6 w-auto gap-1 rounded-full border px-2 text-xs font-medium", priorityColors[todo.priority])}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {priorityLabels[todo.priority]}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Hoog</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Laag</SelectItem>
                        </SelectContent>
                      </Select>
                      <IconButton
                        icon={<ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />}
                        tooltip={isExpanded ? "Inklappen" : "Uitklappen en koppelen"}
                        onClick={() => setExpandedTodo(isExpanded ? null : todo.id)}
                        className="h-8 w-8 p-0 text-muted-foreground"
                      />
                      <IconButton
                        icon={<Trash2 className="h-4 w-4" />}
                        tooltip="Taak verwijderen"
                        onClick={() => deleteTodo(todo.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                      />
                    </div>
                    {isExpanded && (
                      <div className="border-t border-border px-3 pb-3 pt-2 space-y-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Titel</label>
                          <Input
                            value={todo.title}
                            onChange={(e) => updateTodo(todo.id, { title: e.target.value })}
                            className="border-border bg-background text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Categorie</label>
                            <Input
                              value={todo.category}
                              onChange={(e) => updateTodo(todo.id, { category: e.target.value })}
                              placeholder="Categorie"
                              className="border-border bg-background text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Prioriteit</label>
                            <Select
                              value={todo.priority}
                              onValueChange={(v) => v && updateTodo(todo.id, { priority: v as Todo["priority"] })}
                            >
                              <SelectTrigger className="border-border bg-background text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">Hoog</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Laag</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Deadline datum</label>
                            <Input
                              type="date"
                              value={todo.dueDate || ""}
                              onChange={(e) => updateTodo(todo.id, { dueDate: e.target.value || undefined })}
                              className="border-border bg-background text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Deadline tijd</label>
                            <Input
                              type="time"
                              value={todo.dueTime || ""}
                              onChange={(e) => updateTodo(todo.id, { dueTime: e.target.value || undefined })}
                              className="border-border bg-background text-sm"
                            />
                          </div>
                        </div>
                        <LinkedItemsPanel currentType="todo" currentId={todo.id} />
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* ========== NOTITIES TAB ========== */}
        <TabsContent value="notes" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 mr-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Zoeken in notities..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="border-border bg-muted pl-9"
              />
            </div>
            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
              <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
                <Plus className="mr-1 h-4 w-4" />
                Nieuw
              </DialogTrigger>
              <DialogContent className="border-border bg-card">
                <DialogHeader>
                  <DialogTitle>Nieuwe notitie</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Titel" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} className="border-border bg-muted" />
                  <Input placeholder="Categorie" value={newNoteCategory} onChange={(e) => setNewNoteCategory(e.target.value)} className="border-border bg-muted" />
                  <Textarea placeholder="Inhoud..." value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} rows={6} className="border-border bg-muted" />
                  <Button onClick={handleAddNote} className="w-full bg-blue-600 hover:bg-blue-700">Opslaan</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <Badge
                variant="outline"
                className={cn("cursor-pointer text-xs", filterCategory === "all" ? "bg-blue-600/20 text-blue-400 border-blue-500/30" : "border-border text-muted-foreground hover:bg-accent")}
                onClick={() => setFilterCategory("all")}
              >
                Alle ({notes.length})
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className={cn("cursor-pointer text-xs", filterCategory === cat ? "bg-blue-600/20 text-blue-400 border-blue-500/30" : "border-border text-muted-foreground hover:bg-accent")}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat} ({notes.filter((n) => n.category === cat).length})
                </Badge>
              ))}
              {notes.filter((n) => !n.category).length > 0 && (
                <Badge
                  variant="outline"
                  className={cn("cursor-pointer text-xs", filterCategory === "__uncategorized__" ? "bg-blue-600/20 text-blue-400 border-blue-500/30" : "border-border text-muted-foreground hover:bg-accent")}
                  onClick={() => setFilterCategory("__uncategorized__")}
                >
                  Geen categorie ({notes.filter((n) => !n.category).length})
                </Badge>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.length === 0 ? (
              <Card className="border-border bg-muted p-8 text-center md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">{notes.length === 0 ? "Nog geen notities. Maak er een aan!" : "Geen notities gevonden."}</p>
              </Card>
            ) : (
              filteredNotes.map((note) => {
                const linkCount = getLinksForItem("note", note.id).length;
                return (
                  <Card
                    key={note.id}
                    className="group cursor-pointer border-border bg-muted p-4 transition-colors hover:bg-accent"
                    onClick={() => setSelectedNote(note.id)}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-medium">{note.title}</h3>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          tooltip="Notitie verwijderen"
                          onClick={() => deleteNote(note.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                        />
                      </div>
                    </div>
                    <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{note.content || "Geen inhoud"}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {note.category && <span>{note.category}</span>}
                        {linkCount > 0 && (
                          <Badge variant="outline" className="text-[10px] gap-1 border-purple-500/30 text-purple-400">
                            <Link2 className="h-2.5 w-2.5" />
                            {linkCount}
                          </Badge>
                        )}
                      </div>
                      <span>{format(new Date(note.updatedAt), "d MMM", { locale: nl })}</span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          <Dialog open={!!activeNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
            <DialogContent className="max-w-2xl border-border bg-card">
              {activeNote && (
                <div className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                      Notitie bewerken
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Input value={activeNote.title} onChange={(e) => updateNote(activeNote.id, { title: e.target.value })} className="border-border bg-muted text-lg font-medium" />
                    <Input value={activeNote.category} onChange={(e) => updateNote(activeNote.id, { category: e.target.value })} placeholder="Categorie" className="border-border bg-muted" />
                    <Textarea value={activeNote.content} onChange={(e) => updateNote(activeNote.id, { content: e.target.value })} rows={10} className="border-border bg-muted font-mono text-sm" />
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Gekoppelde items</p>
                    <LinkedItemsPanel currentType="note" currentId={activeNote.id} />
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ========== HERINNERINGEN TAB ========== */}
        <TabsContent value="reminders" className="mt-4 space-y-4">
          <Card className="border-border bg-muted p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Herinnering..."
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddReminder()}
                className="flex-1 border-border bg-muted"
              />
              <Input
                placeholder="Categorie"
                value={newReminderCategory}
                onChange={(e) => setNewReminderCategory(e.target.value)}
                className="w-full border-border bg-muted sm:w-28"
              />
              <Input
                type="date"
                value={newReminderDate}
                onChange={(e) => setNewReminderDate(e.target.value)}
                className="w-full border-border bg-muted sm:w-40"
              />
              <Input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="w-full border-border bg-muted sm:w-32"
              />
              <Button onClick={handleAddReminder} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-1 h-4 w-4" />
                Toevoegen
              </Button>
            </div>
          </Card>

          <div className="space-y-2">
            {activeReminders.length === 0 && completedReminders.length === 0 ? (
              <Card className="border-border bg-muted p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <BellRing className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nog geen herinneringen. Voeg er een toe!</p>
                </div>
              </Card>
            ) : (
              <>
                {activeReminders
                  .sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    const aDate = a.dueTime ? `${a.dueDate}T${a.dueTime}` : a.dueDate;
                    const bDate = b.dueTime ? `${b.dueDate}T${b.dueTime}` : b.dueDate;
                    return aDate.localeCompare(bDate);
                  })
                  .map((reminder) => {
                    const isOverdue = reminder.dueDate && isDueOverdue(reminder.dueDate, reminder.dueTime);
                    const isReminderExpanded = expandedReminder === reminder.id;
                    const hasLinkedNotes = getLinkedNotes("todo", reminder.id).length > 0;
                    return (
                      <Card
                        key={reminder.id}
                        className={cn("border-border bg-muted", isOverdue && "border-red-500/30")}
                      >
                        <div className="flex items-center gap-3 p-3">
                          <Checkbox checked={reminder.completed} onCheckedChange={() => toggleTodo(reminder.id)} />
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => setExpandedReminder(isReminderExpanded ? null : reminder.id)}
                          >
                            <p className="text-sm font-medium truncate">{reminder.title}</p>
                            <div className="flex items-center gap-2">
                              {reminder.category && <span className="text-xs text-muted-foreground">{reminder.category}</span>}
                            </div>
                          </div>
                          {hasLinkedNotes && <StickyNote className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                          {reminder.dueDate ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs gap-1",
                                isOverdue
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : isToday(parseISO(reminder.dueDate))
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  : "border-border text-muted-foreground"
                              )}
                            >
                              <CalendarClock className="h-3 w-3" />
                              {formatDueLabel(reminder.dueDate, reminder.dueTime)}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs gap-1 border-border text-muted-foreground">
                              <Bell className="h-3 w-3" />
                              Geen datum
                            </Badge>
                          )}
                          <IconButton
                            icon={<ChevronDown className={cn("h-4 w-4 transition-transform", isReminderExpanded && "rotate-180")} />}
                            tooltip={isReminderExpanded ? "Inklappen" : "Bewerken"}
                            onClick={() => setExpandedReminder(isReminderExpanded ? null : reminder.id)}
                            className="h-8 w-8 p-0 text-muted-foreground"
                          />
                          <IconButton
                            icon={<Trash2 className="h-4 w-4" />}
                            tooltip="Herinnering verwijderen"
                            onClick={() => deleteTodo(reminder.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                          />
                        </div>
                        {isReminderExpanded && (
                          <div className="border-t border-border px-3 pb-3 pt-2 space-y-3">
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-muted-foreground">Titel</label>
                              <Input
                                value={reminder.title}
                                onChange={(e) => updateTodo(reminder.id, { title: e.target.value })}
                                className="border-border bg-background text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Categorie</label>
                              <Input
                                value={reminder.category}
                                onChange={(e) => updateTodo(reminder.id, { category: e.target.value })}
                                placeholder="Categorie"
                                className="border-border bg-background text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Datum</label>
                                <Input
                                  type="date"
                                  value={reminder.dueDate || ""}
                                  onChange={(e) => updateTodo(reminder.id, { dueDate: e.target.value || undefined })}
                                  className="border-border bg-background text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Tijd</label>
                                <Input
                                  type="time"
                                  value={reminder.dueTime || ""}
                                  onChange={(e) => updateTodo(reminder.id, { dueTime: e.target.value || undefined })}
                                  className="border-border bg-background text-sm"
                                />
                              </div>
                            </div>
                            <LinkedItemsPanel currentType="todo" currentId={reminder.id} />
                          </div>
                        )}
                      </Card>
                    );
                  })}

                {completedReminders.length > 0 && (
                  <div className="pt-2">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Voltooid ({completedReminders.length})</p>
                    {completedReminders.map((reminder) => (
                      <Card key={reminder.id} className="border-border bg-muted p-3 opacity-50 mb-2">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={reminder.completed} onCheckedChange={() => toggleTodo(reminder.id)} />
                          <p className="flex-1 text-sm line-through text-muted-foreground truncate">{reminder.title}</p>
                          <IconButton
                            icon={<Trash2 className="h-4 w-4" />}
                            tooltip="Verwijderen"
                            onClick={() => deleteTodo(reminder.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
