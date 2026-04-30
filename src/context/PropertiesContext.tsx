import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { properties as seedProperties, type Property, type PropertyStatus } from "@/data/properties";

interface PropertiesContextValue {
  properties: Property[];
  byClient: (clientId: string) => Property[];
  addProperty: (p: Omit<Property, "id" | "listedDate">) => Property;
  updateStatus: (id: string, status: PropertyStatus) => void;
  removeProperty: (id: string) => void;
}

const PropertiesContext = createContext<PropertiesContextValue | undefined>(undefined);

const today = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

export const PropertiesProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(seedProperties);

  const addProperty: PropertiesContextValue["addProperty"] = useCallback((data) => {
    const newProp: Property = {
      ...data,
      id: `P-${String(Date.now()).slice(-4)}`,
      listedDate: today(),
    };
    setProperties((prev) => [newProp, ...prev]);
    return newProp;
  }, []);

  const updateStatus = useCallback((id: string, status: PropertyStatus) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const removeProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const byClient = useCallback(
    (clientId: string) => properties.filter((p) => p.clientId === clientId),
    [properties]
  );

  const value = useMemo(
    () => ({ properties, byClient, addProperty, updateStatus, removeProperty }),
    [properties, byClient, addProperty, updateStatus, removeProperty]
  );

  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
};

export const useProperties = () => {
  const ctx = useContext(PropertiesContext);
  if (!ctx) throw new Error("useProperties must be used within PropertiesProvider");
  return ctx;
};
