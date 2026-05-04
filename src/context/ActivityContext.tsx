import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ActivityType =
  | "lead"
  | "viewing"
  | "negotiation"
  | "closing"
  | "closed"
  | "edit"
  | "note"
  | "mls-sync";

export interface ActivityItem {
  id: string;
  who: string;
  what: string;
  when: string;
  type: ActivityType;
  clientId?: string;
  timestamp: number;
}

interface ActivityContextValue {
  events: ActivityItem[];
  logActivity: (e: Omit<ActivityItem, "id" | "when" | "timestamp">) => void;
  clearActivity: () => void;
}

const ActivityContext = createContext<ActivityContextValue | undefined>(undefined);

const formatRelative = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} ago`;
};

const fromRow = (r: any): ActivityItem => {
  const ts = new Date(r.created_at).getTime();
  return {
    id: r.id,
    who: r.title,
    what: r.description ?? "",
    when: formatRelative(ts),
    type: r.type as ActivityType,
    clientId: r.client_id ?? undefined,
    timestamp: ts,
  };
};

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!cancelled && !error && data) {
        setEvents(data.map(fromRow));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logActivity: ActivityContextValue["logActivity"] = useCallback((e) => {
    const ts = Date.now();
    // Optimistic local update
    const tempId = `tmp-${ts}-${Math.random().toString(36).slice(2, 6)}`;
    const optimistic: ActivityItem = {
      ...e,
      id: tempId,
      when: "Just now",
      timestamp: ts,
    };
    setEvents((prev) => [optimistic, ...prev]);

    // Persist
    supabase
      .from("activities")
      .insert({
        type: e.type,
        title: e.who,
        description: e.what,
        client_id: e.clientId ?? null,
      })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error || !data) return;
        setEvents((prev) => prev.map((ev) => (ev.id === tempId ? fromRow(data) : ev)));
      });
  }, []);

  const clearActivity = useCallback(async () => {
    const { error } = await supabase.from("activities").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) setEvents([]);
  }, []);

  // Recompute "when" labels on read
  const enriched = useMemo(
    () => events.map((e) => ({ ...e, when: formatRelative(e.timestamp) })),
    [events]
  );

  const value = useMemo(
    () => ({ events: enriched, logActivity, clearActivity }),
    [enriched, logActivity, clearActivity]
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

const fallback: ActivityContextValue = {
  events: [],
  logActivity: () => {},
  clearActivity: () => {},
};

export const useActivity = () => {
  const ctx = useContext(ActivityContext);
  return ctx ?? fallback;
};
