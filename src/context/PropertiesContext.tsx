import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { type Property, type PropertyStatus } from "@/data/properties";
import { supabase } from "@/integrations/supabase/client";

interface PropertiesContextValue {
  properties: Property[];
  loading: boolean;
  byClient: (clientId: string) => Property[];
  addProperty: (p: Omit<Property, "id" | "listedDate">) => Promise<Property | null>;
  updateStatus: (id: string, status: PropertyStatus) => Promise<void>;
  removeProperty: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const PropertiesContext = createContext<PropertiesContextValue | undefined>(undefined);

const today = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

const fromRow = (r: any): Property => ({
  id: r.id,
  clientId: r.client_id ?? "",
  address: r.address,
  city: r.city ?? "",
  type: r.type ?? "",
  beds: r.beds ?? 0,
  baths: Number(r.baths ?? 0),
  sqft: r.sqft ?? 0,
  price: Number(r.price ?? 0),
  status: (r.status ?? "active") as PropertyStatus,
  listedDate: r.listed_date ?? "",
  image: r.image ?? undefined,
});

export const PropertiesProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProperties(data.map(fromRow));
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);


  const addProperty: PropertiesContextValue["addProperty"] = useCallback(async (data) => {
    const id = `P-${String(Date.now()).slice(-4)}`;
    const row = {
      id,
      client_id: data.clientId || null,
      address: data.address,
      city: data.city,
      type: data.type,
      beds: data.beds,
      baths: data.baths,
      sqft: data.sqft,
      price: data.price,
      status: data.status,
      image: data.image ?? null,
      listed_date: today(),
    };
    const { data: inserted, error } = await supabase.from("properties").insert(row).select().single();
    if (error || !inserted) return null;
    const newProp = fromRow(inserted);
    setProperties((prev) => [newProp, ...prev]);
    return newProp;
  }, []);

  const updateStatus = useCallback(async (id: string, status: PropertyStatus) => {
    const { error } = await supabase.from("properties").update({ status }).eq("id", id);
    if (!error) {
      setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    }
  }, []);

  const removeProperty = useCallback(async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  }, []);

  const byClient = useCallback(
    (clientId: string) => properties.filter((p) => p.clientId === clientId),
    [properties]
  );

  const value = useMemo(
    () => ({ properties, loading, byClient, addProperty, updateStatus, removeProperty, refresh }),
    [properties, loading, byClient, addProperty, updateStatus, removeProperty, refresh]
  );

  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
};

export const useProperties = () => {
  const ctx = useContext(PropertiesContext);
  if (!ctx) throw new Error("useProperties must be used within PropertiesProvider");
  return ctx;
};
