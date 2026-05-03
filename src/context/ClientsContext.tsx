import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { type Client, type ClientStage } from "@/data/clients";
import { supabase } from "@/integrations/supabase/client";

interface ClientsContextValue {
  clients: Client[];
  loading: boolean;
  addClient: (c: Omit<Client, "id" | "avatar" | "lastContact"> & { avatar?: string }) => Promise<Client | null>;
  updateClientStage: (id: string, stage: ClientStage) => Promise<void>;
  updateClient: (id: string, patch: Partial<Omit<Client, "id">>) => Promise<void>;
  isAddOpen: boolean;
  setAddOpen: (open: boolean) => void;
}

const ClientsContext = createContext<ClientsContextValue | undefined>(undefined);

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// DB row -> Client
const fromRow = (r: any): Client => ({
  id: r.id,
  name: r.name,
  email: r.email ?? "",
  phone: r.phone ?? "",
  type: (r.type ?? "buyer") as Client["type"],
  stage: (r.stage ?? "lead") as ClientStage,
  budget: Number(r.budget ?? 0),
  location: r.location ?? "",
  property: r.property ?? "",
  lastContact: r.last_contact ?? "Just now",
  avatar: r.avatar ?? initials(r.name ?? "?"),
  notes: r.notes ?? "",
  rating: r.rating ?? 0,
});

// Client patch -> DB columns
const toRow = (p: Partial<Client>) => {
  const row: Record<string, any> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.email !== undefined) row.email = p.email;
  if (p.phone !== undefined) row.phone = p.phone;
  if (p.type !== undefined) row.type = p.type;
  if (p.stage !== undefined) row.stage = p.stage;
  if (p.budget !== undefined) row.budget = String(p.budget);
  if (p.location !== undefined) row.location = p.location;
  if (p.property !== undefined) row.property = p.property;
  if (p.notes !== undefined) row.notes = p.notes;
  if (p.rating !== undefined) row.rating = p.rating;
  if (p.avatar !== undefined) row.avatar = p.avatar;
  if (p.lastContact !== undefined) row.last_contact = p.lastContact;
  return row;
};

export const ClientsProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setAddOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (!cancelled) {
        if (!error && data) setClients(data.map(fromRow));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addClient: ClientsContextValue["addClient"] = useCallback(async (data) => {
    const id = `C-${String(Date.now()).slice(-4)}`;
    const avatar = data.avatar || initials(data.name);
    const row = { ...toRow(data as Partial<Client>), id, avatar, last_contact: "Just now" };
    const { data: inserted, error } = await supabase.from("clients").insert(row).select().single();
    if (error || !inserted) return null;
    const newClient = fromRow(inserted);
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  }, []);

  const updateClientStage = useCallback(async (id: string, stage: ClientStage) => {
    const { error } = await supabase
      .from("clients")
      .update({ stage, last_contact: "Just now" })
      .eq("id", id);
    if (!error) {
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, stage, lastContact: "Just now" } : c))
      );
    }
  }, []);

  const updateClient = useCallback<ClientsContextValue["updateClient"]>(async (id, patch) => {
    const row = { ...toRow(patch), last_contact: "Just now" };
    if (patch.name && !patch.avatar) row.avatar = initials(patch.name);
    const { error } = await supabase.from("clients").update(row).eq("id", id);
    if (!error) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const next = { ...c, ...patch, lastContact: "Just now" };
          if (patch.name && !patch.avatar) next.avatar = initials(patch.name);
          return next;
        })
      );
    }
  }, []);

  const value = useMemo(
    () => ({ clients, loading, addClient, updateClientStage, updateClient, isAddOpen, setAddOpen }),
    [clients, loading, addClient, updateClientStage, updateClient, isAddOpen]
  );

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
};

export const useClients = () => {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error("useClients must be used within ClientsProvider");
  return ctx;
};
