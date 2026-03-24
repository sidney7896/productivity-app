export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: string;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
  dueTime?: string;
  isReminder?: boolean;
}

export interface PomodoroSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  type: "work" | "break";
  durationMinutes: number;
  completed: boolean;
  todoId?: string;
}

export interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  color: string;
  todoId?: string;
  date: string;
}

export interface DayStats {
  date: string;
  todosCompleted: number;
  pomodoroSessions: number;
  focusMinutes: number;
}

export type LinkableType = "todo" | "note" | "planning" | "calendar";

export interface ItemLink {
  id: string;
  fromType: LinkableType;
  fromId: string;
  toType: LinkableType;
  toId: string;
}
