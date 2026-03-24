"use client";

import { useState, useEffect, useCallback } from "react";
import { Note } from "@/types";
import { getItem, setItem, generateId } from "@/lib/store";

const STORAGE_KEY = "productivity-notes";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setNotes(getItem<Note[]>(STORAGE_KEY, []));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) setItem(STORAGE_KEY, notes);
  }, [notes, loaded]);

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
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, ...updates, updatedAt: new Date().toISOString() }
          : n
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, loaded, addNote, updateNote, deleteNote };
}
