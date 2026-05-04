import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  Calendar,
  Trash2,
  MoreVertical,
  ExternalLink,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useActivity } from "@/context/ActivityContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProperties } from "@/context/PropertiesContext";
import { useClients } from "@/context/ClientsContext";
import {
  propertyStatusMeta,
  type PropertyStatus,
} from "@/data/properties";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STATUSES: PropertyStatus[] = [
  "active",
  "pending",
  "under-offer",
  "sold",
  "withdrawn",
];

const formatPrice = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`;

const Listings = () => {
  const { properties, updateStatus, removeProperty, refresh } = useProperties();
  const { clients } = useClients();
  const { refresh: refreshActivity } = useActivity();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PropertyStatus | "all">("all");
  const [sort, setSort] = useState<"newest" | "price-desc" | "price-asc">("newest");
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("mls-sync");
      if (error || !data?.ok) throw error ?? new Error(data?.error ?? "Sync failed");
      await Promise.all([refresh(), refreshActivity()]);
      setLastSync(new Date().toLocaleTimeString());
      toast({
        title: "MLS synced",
        description: `${data.added} new · ${data.priceChanges} price · ${data.statusChanges} status updates`,
      });
    } catch (e: any) {
      toast({
        title: "Sync failed",
        description: e?.message ?? "Could not reach MLS feed",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const clientById = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c])),
    [clients]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = properties.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      const owner = clientById[p.clientId]?.name?.toLowerCase() ?? "";
      return (
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        owner.includes(q)
      );
    });
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    return list;
  }, [properties, status, query, sort, clientById]);

  const totals = useMemo(() => {
    const totalValue = filtered.reduce((s, p) => s + p.price, 0);
    const active = filtered.filter((p) => p.status === "active").length;
    const inDeal = filtered.filter(
      (p) => p.status === "pending" || p.status === "under-offer"
    ).length;
    return { totalValue, active, inDeal };
  }, [filtered]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 px-6 lg:px-10 py-8 space-y-6">
          {/* Title */}
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">
                Portfolio
              </div>
              <h2 className="font-display text-4xl tracking-tight">
                All <span className="text-gradient-gold italic">listings</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                Every property linked to your clients, filterable across the entire book.
              </p>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile label="Listings" value={String(filtered.length)} />
            <StatTile label="Active" value={String(totals.active)} />
            <StatTile
              label="Total value"
              value={formatPrice(totals.totalValue || 0)}
              accent
            />
          </div>

          {/* Toolbar */}
          <div className="rounded-xl border border-border bg-card shadow-card p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search address, city, type, or client…"
                className="pl-9 bg-background/50"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as PropertyStatus | "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {propertyStatusMeta[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price-desc">Price: high → low</SelectItem>
                <SelectItem value="price-asc">Price: low → high</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-card shadow-card px-6 py-16 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-secondary/60 border border-border flex items-center justify-center mb-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No listings match your filters. Try adjusting search or status.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((p) => {
                const owner = clientById[p.clientId];
                const meta = propertyStatusMeta[p.status];
                return (
                  <article
                    key={p.id}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card hover:border-gold/40 transition-colors"
                  >
                    <div className="relative h-32 bg-gradient-to-br from-secondary via-card to-background border-b border-border flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-gold/40" />
                      <span
                        className={cn(
                          "absolute top-3 left-3 inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border",
                          meta.className
                        )}
                      >
                        {meta.label}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="absolute top-3 right-3 h-8 w-8 rounded-lg border border-border bg-card/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Set status
                          </DropdownMenuLabel>
                          {STATUSES.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => {
                                updateStatus(p.id, s);
                                toast({
                                  title: "Status updated",
                                  description: `${p.address} → ${propertyStatusMeta[s].label}`,
                                });
                              }}
                              disabled={s === p.status}
                            >
                              {propertyStatusMeta[s].label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              removeProperty(p.id);
                              toast({ title: "Property removed", description: p.address });
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {p.address}
                          </h3>
                          <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {p.city}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-sm text-gold">
                            {formatPrice(p.price)}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {p.id}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-muted-foreground">
                        <span>{p.type}</span>
                        <span className="inline-flex items-center gap-1">
                          <BedDouble className="h-3 w-3" /> {p.beds} bd
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Bath className="h-3 w-3" /> {p.baths} ba
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Ruler className="h-3 w-3" /> {p.sqft.toLocaleString()} sqft
                        </span>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-2">
                          {owner ? (
                            <>
                              <div className="h-7 w-7 rounded-full bg-gradient-gold flex items-center justify-center text-[10px] font-semibold text-primary-foreground shrink-0">
                                {owner.avatar}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs text-foreground truncate">
                                  {owner.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                                  <Calendar className="h-2.5 w-2.5" /> {p.listedDate}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Unassigned · {p.listedDate}
                            </div>
                          )}
                        </div>
                        {owner && (
                          <Link
                            to={`/clients/${owner.id}`}
                            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Hint */}
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-8 w-8 rounded-lg bg-secondary/60 border border-border flex items-center justify-center shrink-0">
              <Plus className="h-3.5 w-3.5 text-gold" />
            </div>
            New listings are added from a client's detail page to keep ownership clear.
          </div>
        </main>
      </div>
    </div>
  );
};

const StatTile = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div className="rounded-xl border border-border bg-card shadow-card px-5 py-4">
    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </div>
    <div
      className={cn(
        "mt-1 text-2xl font-display tracking-tight",
        accent && "text-gradient-gold"
      )}
    >
      {value}
    </div>
  </div>
);

export default Listings;
