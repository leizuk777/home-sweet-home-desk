import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { activity as seedActivity } from "@/data/clients";

export type ActivityType =
  | "lead"
  | "viewing"
  | "negotiation"
  | "closing"
  | "closed"
  | "edit"
  | "note";

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

// Seed with timestamps approximated from labels
const seedWithTimestamps: ActivityItem[] = seedActivity.map((a, i) => ({
  ...a,
  id: `seed-${a.id}`,
  type: a.type as ActivityType,
  timestamp: Date.now() - (i + 1) * 1000 * 60 * 60 * (i === 4 ? 168 : 5),
}));

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<ActivityItem[]>(seedWithTimestamps);

  const logActivity: ActivityContextValue["logActivity"] = useCallback((e) => {
    const ts = Date.now();
    setEvents((prev) => [
      {
        ...e,
        id: `A-${ts}-${Math.random().toString(36).slice(2, 6)}`,
        when: "Just now",
        timestamp: ts,
      },
      ...prev,
    ]);
  }, []);

  const clearActivity = useCallback(() => setEvents([]), []);

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

export const useActivity = () => {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used within ActivityProvider");
  return ctx;
};
