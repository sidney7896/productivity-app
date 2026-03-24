"use client";

import { useCallback } from "react";
import { Todo } from "@/types";
import { useLocalStorage, generateId } from "@/lib/store";

const STORAGE_KEY = "productivity-todos";

export function useTodos() {
  const [todos, setTodos, loaded] = useLocalStorage<Todo[]>(STORAGE_KEY, []);

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
    [setTodos]
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
  }, [setTodos]);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, [setTodos]);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, [setTodos]);

  return { todos, loaded, addTodo, toggleTodo, deleteTodo, updateTodo };
}
