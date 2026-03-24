"use client";

import { useCallback } from "react";
import { Note } from "@/types";
import { useLocalStorage, generateId } from "@/lib/store";

const STORAGE_KEY = "productivity-notes";

export function useNotes() {
  const [notes, setNotes, loaded] = useLocalStorage<Note[]>(STORAGE_KEY, []);

  const addNote = useCallback((title: string, content = "", category = "") => {
    const note: Note = {
      id: generateId(),
      title,
      content,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  }, [setNotes]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, ...updates, updatedAt: new Date().toISOString() }
          : n
      )
    );
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, [setNotes]);

  return { notes, loaded, addNote, updateNote, deleteNote };
}
