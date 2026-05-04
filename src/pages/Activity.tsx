import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useActivity, type ActivityType } from "@/context/ActivityContext";
import { useClients } from "@/context/ClientsContext";
import {
  Activity as ActivityIcon,
  Calendar,
  CheckCircle2,
  FileSignature,
  Handshake,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const iconMap: Record<ActivityType, any> = {
  lead: Sparkles,
  viewing: Calendar,
  negotiation: Handshake,
  closing: FileSignature,
  closed: CheckCircle2,
  edit: Pencil,
  note: StickyNote,
  "mls-sync": RefreshCw,
};

const colorMap: Record<ActivityType, string> = {
  lead: "text-info bg-info/10 border-info/20",
  viewing: "text-warning bg-warning/10 border-warning/20",
  negotiation: "text-gold bg-gold/10 border-gold/30",
  closing: "text-success bg-success/10 border-success/20",
  closed: "text-muted-foreground bg-secondary border-border",
  edit: "text-foreground bg-secondary border-border",
  note: "text-gold bg-gold/10 border-gold/30",
  "mls-sync": "text-info bg-info/10 border-info/20",
};

const filters: { id: ActivityType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "lead", label: "Leads" },
  { id: "viewing", label: "Viewings" },
  { id: "negotiation", label: "Negotiation" },
  { id: "closing", label: "Closing" },
  { id: "closed", label: "Closed" },
  { id: "edit", label: "Edits" },
];

const dayLabel = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
};

const Activity = () => {
  const { events } = useActivity();
  const { clients } = useClients();
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filter !== "all" && e.type !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!e.who.toLowerCase().includes(q) && !e.what.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [events, filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((e) => {
      const key = dayLabel(e.timestamp);
      if (!map.has(key)) map.set(key, [] as typeof filtered);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      total: events.length,
      today: events.filter((e) => e.timestamp >= today.getTime()).length,
      week: events.filter((e) => e.timestamp >= week).length,
      closings: events.filter((e) => e.type === "closing" || e.type === "closed").length,
    };
  }, [events]);

  const findClient = (id?: string) => clients.find((c) => c.id === id);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 px-6 lg:px-10 py-8 space-y-6">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Timeline</div>
              <h2 className="font-display text-4xl tracking-tight">
                Every <span className="text-gradient-gold italic">movement</span>, in order
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                A live log of pipeline changes, edits, and client milestones.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ActivityIcon className="h-4 w-4 text-gold" />
              {counts.total} total events
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Today" value={counts.today} />
            <Stat label="Last 7 days" value={counts.week} />
            <Stat label="Closing activity" value={counts.closings} />
            <Stat label="All time" value={counts.total} />
          </div>

          {/* Controls */}
          <div className="rounded-xl border border-border bg-card shadow-card p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by client or action…"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider border transition-colors",
                    filter === f.id
                      ? "border-gold/40 text-gold bg-gold/10"
                      : "border-border text-muted-foreground hover:text-gold hover:border-gold/30"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            {grouped.length === 0 && (
              <div className="px-6 py-16 text-center text-sm text-muted-foreground">
                No events match your filters.
              </div>
            )}
            {grouped.map(([day, items]) => (
              <div key={day} className="border-b border-border last:border-b-0">
                <div className="px-6 py-3 bg-secondary/30 flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {day}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {items.length} event{items.length > 1 ? "s" : ""}
                  </div>
                </div>
                <ol className="relative px-6 py-4">
                  <div className="absolute left-[34px] top-4 bottom-4 w-px bg-border" />
                  {items.map((e) => {
                    const Icon = iconMap[e.type] ?? Calendar;
                    const client = findClient(e.clientId);
                    return (
                      <li key={e.id} className="relative flex gap-4 py-3 group">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-lg shrink-0 flex items-center justify-center border z-10",
                            colorMap[e.type]
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm text-foreground leading-snug">
                              {client ? (
                                <Link
                                  to={`/clients/${client.id}`}
                                  className="font-medium hover:text-gold transition-colors"
                                >
                                  {e.who}
                                </Link>
                              ) : (
                                <span className="font-medium">{e.who}</span>
                              )}{" "}
                              <span className="text-muted-foreground">{e.what}</span>
                            </div>
                            {client && (
                              <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                                {client.type} · {client.location}
                              </div>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground whitespace-nowrap pt-0.5">
                            {e.when}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-border bg-card shadow-card p-5">
    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className="font-display text-3xl mt-2 text-gradient-gold">{value}</div>
  </div>
);

export default Activity;
