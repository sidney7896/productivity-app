"use client";

import { useState, useEffect, useCallback } from "react";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (timeMin: string, timeMax: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ timeMin, timeMax });
      const res = await fetch(`/api/calendar?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch");
      }
      const data = await res.json();
      setEvents(data.events);
    } catch (err: any) {
      setError(err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeek = useCallback(
    (date: Date) => {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return fetchEvents(start.toISOString(), end.toISOString());
    },
    [fetchEvents]
  );

  const fetchDay = useCallback(
    (date: Date) => {
      return fetchEvents(startOfDay(date).toISOString(), endOfDay(date).toISOString());
    },
    [fetchEvents]
  );

  const createEvent = useCallback(
    async (summary: string, startDateTime: string, endDateTime: string, description = "") => {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, startDateTime, endDateTime, description }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    []
  );

  const updateEvent = useCallback(
    async (eventId: string, summary: string, startDateTime: string, endDateTime: string, description = "") => {
      const res = await fetch("/api/calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, summary, startDateTime, endDateTime, description }),
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    []
  );

  const deleteEvent = useCallback(async (eventId: string) => {
    const res = await fetch(`/api/calendar?eventId=${eventId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete event");
    return res.json();
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    fetchWeek,
    fetchDay,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
