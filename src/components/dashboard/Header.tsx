import { Search, Bell, Plus, Command, User, Home } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useClients } from "@/context/ClientsContext";
import { useProperties } from "@/context/PropertiesContext";

export const Header = () => {
  const { setAddOpen, clients } = useClients();
  const { properties } = useProperties();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Cmd/Ctrl+K to focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { clients: [], properties: [] };
    const c = clients
      .filter((c) =>
        [c.name, c.email, c.location, c.property, c.type, c.stage]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
      .slice(0, 5);
    const p = properties
      .filter((p) =>
        [p.address, p.city, p.type, p.status]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
      .slice(0, 5);
    return { clients: c, properties: p };
  }, [query, clients, properties]);

  const flat = useMemo(
    () => [
      ...results.clients.map((c) => ({ kind: "client" as const, item: c })),
      ...results.properties.map((p) => ({ kind: "property" as const, item: p })),
    ],
    [results]
  );

  useEffect(() => setActiveIdx(0), [query]);

  const go = (entry: (typeof flat)[number]) => {
    setOpen(false);
    setQuery("");
    if (entry.kind === "client") navigate(`/clients/${entry.item.id}`);
    else navigate("/listings");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flat[activeIdx]) {
      e.preventDefault();
      go(flat[activeIdx]);
    }
  };

  const showDropdown = open && query.trim().length > 0;
  const empty = showDropdown && flat.length === 0;

  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="flex items-center gap-4 px-6 lg:px-10 h-16">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Thursday, April 30</div>
          <h1 className="font-display text-xl leading-none mt-1">Good afternoon, Elena</h1>
        </div>

        <div className="flex-1 max-w-xl mx-auto" ref={wrapRef}>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Search clients, listings, or addresses…"
              className="w-full h-10 pl-10 pr-16 rounded-lg bg-secondary/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
              <Command className="h-3 w-3" /> K
            </kbd>

            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-30">
                {empty && (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No results for "{query}"
                  </div>
                )}

                {results.clients.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Clients
                    </div>
                    {results.clients.map((c, i) => {
                      const idx = i;
                      const isActive = idx === activeIdx;
                      return (
                        <button
                          key={c.id}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => go({ kind: "client", item: c })}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                            isActive ? "bg-secondary" : "hover:bg-secondary/60"
                          }`}
                        >
                          <div className="h-7 w-7 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center text-[10px] font-medium">
                            {c.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-foreground">{c.name}</div>
                            <div className="truncate text-xs text-muted-foreground">
                              {c.type} · {c.location || c.email}
                            </div>
                          </div>
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {results.properties.length > 0 && (
                  <div className="py-1 border-t border-border">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Listings
                    </div>
                    {results.properties.map((p, i) => {
                      const idx = results.clients.length + i;
                      const isActive = idx === activeIdx;
                      return (
                        <button
                          key={p.id}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => go({ kind: "property", item: p })}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                            isActive ? "bg-secondary" : "hover:bg-secondary/60"
                          }`}
                        >
                          <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center">
                            <Home className="h-3.5 w-3.5 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-foreground">{p.address}</div>
                            <div className="truncate text-xs text-muted-foreground">
                              {p.city} · {p.status}
                            </div>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">
                            ${(p.price / 1000).toFixed(0)}K
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative h-10 w-10 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-gold" />
          </button>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-glow font-medium"
          >
            <Plus className="h-4 w-4 mr-1" /> New Client
          </Button>
        </div>
      </div>
    </header>
  );
};
