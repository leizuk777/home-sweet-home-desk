import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { clients as seedClients, type Client } from "@/data/clients";

interface ClientsContextValue {
  clients: Client[];
  addClient: (c: Omit<Client, "id" | "avatar" | "lastContact"> & { avatar?: string }) => Client;
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

export const ClientsProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>(seedClients);
  const [isAddOpen, setAddOpen] = useState(false);

  const addClient: ClientsContextValue["addClient"] = useCallback((data) => {
    const newClient: Client = {
      ...data,
      id: `C-${String(Date.now()).slice(-4)}`,
      avatar: data.avatar || initials(data.name),
      lastContact: "Just now",
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  }, []);

  const value = useMemo(
    () => ({ clients, addClient, isAddOpen, setAddOpen }),
    [clients, addClient, isAddOpen]
  );

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
};

export const useClients = () => {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error("useClients must be used within ClientsProvider");
  return ctx;
};
