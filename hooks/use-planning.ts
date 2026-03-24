"use client";

import { useCallback } from "react";
import { TimeBlock } from "@/types";
import { useLocalStorage, generateId } from "@/lib/store";

const STORAGE_KEY = "productivity-planning";

const COLORS = [
  "bg-blue-500/20 border-blue-500/50 text-blue-300",
  "bg-purple-500/20 border-purple-500/50 text-purple-300",
  "bg-green-500/20 border-green-500/50 text-green-300",
  "bg-orange-500/20 border-orange-500/50 text-orange-300",
  "bg-pink-500/20 border-pink-500/50 text-pink-300",
  "bg-cyan-500/20 border-cyan-500/50 text-cyan-300",
];

export function usePlanning() {
  const [blocks, setBlocks, loaded] = useLocalStorage<TimeBlock[]>(STORAGE_KEY, []);

  const addBlock = useCallback(
    (
      title: string,
      startHour: number,
      startMinute: number,
      endHour: number,
      endMinute: number,
      date: string
    ) => {
      const block: TimeBlock = {
        id: generateId(),
        title,
        startHour,
        startMinute,
        endHour,
        endMinute,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        date,
      };
      setBlocks((prev) => [...prev, block]);
      return block;
    },
    [setBlocks]
  );

  const updateBlock = useCallback(
    (id: string, updates: Partial<TimeBlock>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );
    },
    [setBlocks]
  );

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, [setBlocks]);

  const getBlocksForDate = useCallback(
    (date: string) => blocks.filter((b) => b.date === date),
    [blocks]
  );

  const getBlocksForDateRange = useCallback(
    (startDate: string, endDate: string) =>
      blocks.filter((b) => b.date >= startDate && b.date <= endDate),
    [blocks]
  );

  return { blocks, loaded, addBlock, updateBlock, deleteBlock, getBlocksForDate, getBlocksForDateRange };
}
