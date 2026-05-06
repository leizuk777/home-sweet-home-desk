import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, addMonths, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  LayoutGrid,
  List as ListIcon,
  MoreHorizontal,
  Plus,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ViewingDialog } from "@/components/dashboard/ViewingDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useViewings, type Viewing, type ViewingStatus } from "@/context/ViewingsContext";
import { useClients } from "@/context/ClientsContext";
import { useProperties } from "@/context/PropertiesContext";
import { useActivity } from "@/context/ActivityContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const statusStyles: Record<ViewingStatus, string> = {
  scheduled: "text-warning bg-warning/10 border-warning/20",
  completed: "text-success bg-success/10 border-success/20",
  cancelled: "text-muted-foreground bg-secondary border-border",
  "no-show": "text-destructive bg-destructive/10 border-destructive/20",
};

const Viewings = () => {
  const { viewings, updateViewing, removeViewing } = useViewings();
  const { clients } = useClients();
  const { properties } = useProperties();
  const { logActivity } = useActivity();
  const { toast } = useToast();

  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [filter, setFilter] = useState<ViewingStatus | "all" | "upcoming">("upcoming");
  const [cursor, setCursor] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Viewing | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  const findClient = (id: string) => clients.find((c) => c.id === id);
  const findProperty = (id: string) => properties.find((p) => p.id === id);

  const sorted = useMemo(
    () => [...viewings].sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
    [viewings]
  );

  const counts = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: viewings.filter((v) => v.status === "scheduled" && +new Date(v.scheduledAt) >= now).length,
      completed: viewings.filter((v) => v.status === "completed").length,
      cancelled: viewings.filter((v) => v.status === "cancelled" || v.status === "no-show").length,
      total: viewings.length,
    };
  }, [viewings]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return sorted.filter((v) => {
      if (filter === "all") return true;
      if (filter === "upcoming") return v.status === "scheduled" && +new Date(v.scheduledAt) >= now;
      return v.status === filter;
    });
  }, [sorted, filter]);

  // Calendar grid
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));
  if (days[35] && days[35] > monthEnd && days[35].getDay() === 0) days.length = 35;

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Viewing[]>();
    sorted.forEach((v) => {
      const k = format(new Date(v.scheduledAt), "yyyy-MM-dd");
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(v);
    });
    return map;
  }, [sorted]);

  const openNew = (d?: Date) => {
    setEditing(null);
    setDefaultDate(d);
    setDialogOpen(true);
  };
  const openEdit = (v: Viewing) => {
    setEditing(v);
    setDefaultDate(undefined);
    setDialogOpen(true);
  };

  const setStatus = (v: Viewing, status: ViewingStatus) => {
    updateViewing(v.id, { status });
    const c = findClient(v.clientId);
    logActivity({
      type: "viewing",
      who: c?.name ?? "Viewing",
      what: `viewing marked ${status}`,
      clientId: v.clientId,
    });
    toast({ title: `Marked as ${status}` });
  };

  const remove = (v: Viewing) => {
    removeViewing(v.id);
    toast({ title: "Viewing removed" });
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 px-6 lg:px-10 py-8 space-y-6">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Schedule</div>
              <h2 className="font-display text-4xl tracking-tight">
                Every <span className="text-gradient-gold italic">viewing</span>, organized
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                Plan, track, and follow up on every property showing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setView("calendar")}
                  className={cn("px-3 py-1.5 text-xs flex items-center gap-1.5",
                    view === "calendar" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-gold")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Calendar
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn("px-3 py-1.5 text-xs flex items-center gap-1.5 border-l border-border",
                    view === "list" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-gold")}
                >
                  <ListIcon className="h-3.5 w-3.5" /> List
                </button>
              </div>
              <Button onClick={() => openNew()} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Plus className="h-4 w-4" /> New viewing
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Upcoming" value={counts.upcoming} />
            <Stat label="Completed" value={counts.completed} />
            <Stat label="Cancelled / no-show" value={counts.cancelled} />
            <Stat label="All time" value={counts.total} />
          </div>

          {view === "calendar" ? (
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <button onClick={() => setCursor(subMonths(cursor, 1))} className="h-8 w-8 rounded-md border border-border hover:border-gold/40 flex items-center justify-center text-muted-foreground hover:text-gold">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="font-display text-xl">{format(cursor, "MMMM yyyy")}</div>
                  <button onClick={() => setCursor(addMonths(cursor, 1))} className="h-8 w-8 rounded-md border border-border hover:border-gold/40 flex items-center justify-center text-muted-foreground hover:text-gold">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={() => setCursor(new Date())} className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold">
                  Today
                </button>
              </div>
              <div className="grid grid-cols-7 text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                  <div key={d} className="px-3 py-2 border-r border-border last:border-r-0">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-fr">
                {days.map((d, idx) => {
                  const key = format(d, "yyyy-MM-dd");
                  const items = eventsByDay.get(key) ?? [];
                  const inMonth = isSameMonth(d, cursor);
                  const today = isSameDay(d, new Date());
                  return (
                    <div
                      key={idx}
                      onDoubleClick={() => openNew(d)}
                      className={cn(
                        "min-h-[110px] border-r border-b border-border last:border-r-0 p-2 flex flex-col gap-1 group",
                        !inMonth && "bg-secondary/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                          today ? "bg-gradient-gold text-primary-foreground font-semibold" : inMonth ? "text-foreground" : "text-muted-foreground"
                        )}>{format(d, "d")}</div>
                        <button
                          onClick={() => openNew(d)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded-md text-muted-foreground hover:text-gold flex items-center justify-center"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        {items.slice(0, 3).map((v) => {
                          const c = findClient(v.clientId);
                          const p = findProperty(v.propertyId);
                          return (
                            <button
                              key={v.id}
                              onClick={() => openEdit(v)}
                              className={cn(
                                "w-full text-left text-[11px] px-1.5 py-1 rounded border truncate",
                                statusStyles[v.status]
                              )}
                              title={`${format(new Date(v.scheduledAt), "p")} · ${c?.name ?? "?"} · ${p?.address ?? ""}`}
                            >
                              <span className="font-mono mr-1">{format(new Date(v.scheduledAt), "HH:mm")}</span>
                              {c?.name ?? "Unassigned"}
                            </button>
                          );
                        })}
                        {items.length > 3 && (
                          <div className="text-[10px] text-muted-foreground px-1">+{items.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {(["upcoming","all","scheduled","completed","cancelled","no-show"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider border transition-colors capitalize",
                      filter === f
                        ? "border-gold/40 text-gold bg-gold/10"
                        : "border-border text-muted-foreground hover:text-gold hover:border-gold/30"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                {filtered.length === 0 ? (
                  <div className="px-6 py-16 text-center text-sm text-muted-foreground">
                    No viewings to show.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {filtered.map((v) => {
                      const c = findClient(v.clientId);
                      const p = findProperty(v.propertyId);
                      const dt = new Date(v.scheduledAt);
                      return (
                        <li key={v.id} className="px-5 py-4 flex items-center gap-4 hover:bg-secondary/30">
                          <div className="text-center w-14 shrink-0">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{format(dt, "MMM")}</div>
                            <div className="font-display text-2xl text-gold leading-none">{format(dt, "d")}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">{format(dt, "EEE")}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              {c ? (
                                <Link to={`/clients/${c.id}`} className="font-medium hover:text-gold">{c.name}</Link>
                              ) : <span className="text-muted-foreground italic">Unassigned client</span>}
                              <span className="text-muted-foreground">·</span>
                              <span className="text-muted-foreground flex items-center gap-1 truncate">
                                <Home className="h-3.5 w-3.5" />{p?.address ?? "Unassigned property"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(dt, "p")} · {v.duration}m</span>
                              {v.rating ? (
                                <span className="flex items-center gap-0.5 text-gold">
                                  {Array.from({ length: v.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                                </span>
                              ) : null}
                              {v.notes && <span className="truncate max-w-md">· {v.notes}</span>}
                            </div>
                          </div>
                          <span className={cn("text-[10px] uppercase tracking-wider px-2 py-1 rounded border capitalize", statusStyles[v.status])}>
                            {v.status}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(v)}>Edit</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setStatus(v, "completed")}>
                                <CheckCircle2 className="h-4 w-4" /> Mark completed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStatus(v, "cancelled")}>
                                <XCircle className="h-4 w-4" /> Cancel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStatus(v, "no-show")}>
                                <XCircle className="h-4 w-4" /> No-show
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => remove(v)}>
                                <Trash2 className="h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <ViewingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        defaultDate={defaultDate}
      />
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-border bg-card shadow-card p-5">
    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className="font-display text-3xl mt-2 text-gradient-gold">{value}</div>
  </div>
);

export default Viewings;
