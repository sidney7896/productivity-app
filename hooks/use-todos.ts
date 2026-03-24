"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo } from "@/types";
import { getItem, setItem, generateId } from "@/lib/store";

const STORAGE_KEY = "productivity-todos";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTodos(getItem<Todo[]>(STORAGE_KEY, []));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) setItem(STORAGE_KEY, todos);
  }, [todos, loaded]);

  const addTodo = useCallback(
    (title: string, priority: Todo["priority"] = "medium", category = "") => {
      const todo: Todo = {
        id: generateId(),
        title,
        completed: false,
        priority,
        category,
        createdAt: new Date().toISOString(),
      };
      setTodos((prev) => [todo, ...prev]);
      return todo;
    },
    []
  );

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  return { todos, loaded, addTodo, toggleTodo, deleteTodo, updateTodo };
}
