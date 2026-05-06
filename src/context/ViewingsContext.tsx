import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type ViewingStatus = "scheduled" | "completed" | "cancelled" | "no-show";

export interface Viewing {
  id: string;
  clientId: string;
  propertyId: string;
  /** ISO timestamp of the viewing */
  scheduledAt: string;
  /** Duration in minutes */
  duration: number;
  status: ViewingStatus;
  notes?: string;
  feedback?: string;
  rating?: number; // 1-5
  createdAt: string;
}

interface ViewingsContextValue {
  viewings: Viewing[];
  addViewing: (v: Omit<Viewing, "id" | "createdAt" | "status"> & { status?: ViewingStatus }) => Viewing;
  updateViewing: (id: string, patch: Partial<Omit<Viewing, "id" | "createdAt">>) => void;
  removeViewing: (id: string) => void;
}

const ViewingsContext = createContext<ViewingsContextValue | undefined>(undefined);

const STORAGE_KEY = "maison.viewings.v1";

const seed = (): Viewing[] => {
  const now = new Date();
  const mk = (offsetDays: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: "V-1001",
      clientId: "",
      propertyId: "",
      scheduledAt: mk(1, 10),
      duration: 45,
      status: "scheduled",
      notes: "First showing — bring floor plans.",
      createdAt: now.toISOString(),
    },
    {
      id: "V-1002",
      clientId: "",
      propertyId: "",
      scheduledAt: mk(-2, 14),
      duration: 30,
      status: "completed",
      notes: "",
      feedback: "Loved the natural light. Wants a second showing with partner.",
      rating: 4,
      createdAt: now.toISOString(),
    },
  ];
};

export const ViewingsProvider = ({ children }: { children: ReactNode }) => {
  const [viewings, setViewings] = useState<Viewing[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seed();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewings));
    } catch {}
  }, [viewings]);

  const addViewing: ViewingsContextValue["addViewing"] = useCallback((v) => {
    const created: Viewing = {
      id: `V-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: v.status ?? "scheduled",
      ...v,
    };
    setViewings((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateViewing: ViewingsContextValue["updateViewing"] = useCallback((id, patch) => {
    setViewings((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const removeViewing = useCallback((id: string) => {
    setViewings((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const value = useMemo(
    () => ({ viewings, addViewing, updateViewing, removeViewing }),
    [viewings, addViewing, updateViewing, removeViewing]
  );

  return <ViewingsContext.Provider value={value}>{children}</ViewingsContext.Provider>;
};

export const useViewings = () => {
  const ctx = useContext(ViewingsContext);
  if (!ctx) throw new Error("useViewings must be used within ViewingsProvider");
  return ctx;
};
