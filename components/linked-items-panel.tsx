"use client";

import { useState } from "react";
import { useItemLinks } from "@/hooks/use-item-links";
import { useTodos } from "@/hooks/use-todos";
import { useNotes } from "@/hooks/use-notes";
import { usePlanning } from "@/hooks/use-planning";
import { LinkableType, Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Link2,
  X,
  CheckSquare,
  StickyNote,
  Calendar,
  CalendarDays,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<LinkableType, typeof CheckSquare> = {
  todo: CheckSquare,
  note: StickyNote,
  planning: Calendar,
  calendar: CalendarDays,
};

const typeLabels: Record<LinkableType, string> = {
  todo: "Taak",
  note: "Notitie",
  planning: "Planning",
  calendar: "Agenda",
};

const typeColors: Record<LinkableType, string> = {
  todo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  note: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  planning: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  calendar: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

interface LinkedItemsPanelProps {
  currentType: LinkableType;
  currentId: string;
}

export function LinkedItemsPanel({ currentType, currentId }: LinkedItemsPanelProps) {
  const { addLink, removeLink, getLinksForItem, areLinked } = useItemLinks();
  const { todos } = useTodos();
  const { notes, updateNote } = useNotes();
  const { blocks } = usePlanning();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const linkedItems = getLinksForItem(currentType, currentId);

  // Resolve linked notes to full Note objects
  const linkedNotes = linkedItems
    .filter((l) => l.type === "note")
    .map((l) => ({ ...l, note: notes.find((n) => n.id === l.id) }))
    .filter((l) => l.note) as { linkId: string; type: "note"; id: string; note: Note }[];

  // Non-note links
  const otherLinks = linkedItems.filter((l) => l.type !== "note");

  // Build available items for picker
  const availableItems: { type: LinkableType; id: string; label: string }[] = [];

  todos.forEach((t) => {
    if (!(currentType === "todo" && currentId === t.id)) {
      availableItems.push({ type: "todo", id: t.id, label: t.title });
    }
  });
  notes.forEach((n) => {
    if (!(currentType === "note" && currentId === n.id)) {
      availableItems.push({ type: "note", id: n.id, label: n.title });
    }
  });
  blocks.forEach((b) => {
    if (!(currentType === "planning" && currentId === b.id)) {
      availableItems.push({
        type: "planning",
        id: b.id,
        label: `${b.title} (${String(b.startHour).padStart(2, "0")}:${String(b.startMinute).padStart(2, "0")})`,
      });
    }
  });

  const filtered = searchQuery
    ? availableItems.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableItems;

  const handleLink = (type: LinkableType, id: string) => {
    addLink(currentType, currentId, type, id);
    setPickerOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="space-y-3">
      {/* Linked notes shown inline with full editing */}
      {linkedNotes.map(({ linkId, note }) => (
        <Card key={linkId} className="border-purple-500/20 bg-purple-500/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote className="h-3.5 w-3.5 text-purple-400" />
              <Input
                value={note.title}
                onChange={(e) => updateNote(note.id, { title: e.target.value })}
                className="h-7 border-none bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
                placeholder="Notitie titel..."
              />
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(linkId)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                  />
                }
              >
                <X className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent side="top">Ontkoppelen</TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            value={note.content}
            onChange={(e) => updateNote(note.id, { content: e.target.value })}
            placeholder="Notitie schrijven..."
            rows={3}
            className="border-purple-500/10 bg-purple-500/5 text-sm"
          />
          {note.category && (
            <p className="mt-1 text-[10px] text-purple-400/60">{note.category}</p>
          )}
        </Card>
      ))}

      {/* Other linked items as badges */}
      {otherLinks.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Link2 className="h-3 w-3 text-muted-foreground" />
          {otherLinks.map((link) => {
            const Icon = typeIcons[link.type];
            // Resolve label
            let label = "";
            if (link.type === "todo") {
              label = todos.find((t) => t.id === link.id)?.title || "Verwijderd";
            } else if (link.type === "planning") {
              const b = blocks.find((b) => b.id === link.id);
              label = b ? `${b.title}` : "Verwijderd";
            }
            return (
              <Badge
                key={link.linkId}
                variant="outline"
                className={cn("text-[10px] gap-1 group/badge cursor-default", typeColors[link.type])}
              >
                <Icon className="h-2.5 w-2.5" />
                <span className="max-w-[120px] truncate">{label}</span>
                <button
                  onClick={() => removeLink(link.linkId)}
                  className="ml-0.5 opacity-0 group-hover/badge:opacity-100 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Add link button */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPickerOpen(true)}
              className="border-border text-xs text-muted-foreground"
            />
          }
        >
          <Link2 className="mr-1 h-3 w-3" />
          Koppelen
        </TooltipTrigger>
        <TooltipContent side="top">Item of notitie koppelen</TooltipContent>
      </Tooltip>

      {/* Link picker dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="border-border bg-card max-h-[70vh]">
          <DialogHeader>
            <DialogTitle>Item koppelen</DialogTitle>
          </DialogHeader>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Zoeken..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-muted pl-9"
              autoFocus
            />
          </div>
          <div className="space-y-1 max-h-[50vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Geen items gevonden
              </p>
            ) : (
              filtered.map((item) => {
                const Icon = typeIcons[item.type];
                const alreadyLinked = areLinked(currentType, currentId, item.type, item.id);
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => !alreadyLinked && handleLink(item.type, item.id)}
                    disabled={alreadyLinked}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      alreadyLinked ? "opacity-40 cursor-not-allowed" : "hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1">{item.label}</span>
                    <Badge variant="outline" className={cn("text-[10px]", typeColors[item.type])}>
                      {typeLabels[item.type]}
                    </Badge>
                    {alreadyLinked && <Link2 className="h-3 w-3 text-muted-foreground" />}
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
