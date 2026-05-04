import { useMemo } from "react";
import { Users, Home, Handshake, TrendingUp, DollarSign, Clock } from "lucide-react";
import { useClients } from "@/context/ClientsContext";
import { useProperties } from "@/context/PropertiesContext";
import { useActivity } from "@/context/ActivityContext";
import { cn } from "@/lib/utils";

const formatMoney = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

const monthLabel = new Date().toLocaleDateString("en-US", { month: "short" });

export const StatsGrid = () => {
  const { clients } = useClients();
  const { properties } = useProperties();
  const { events } = useActivity();

  const computed = useMemo(() => {
    const totalClients = clients.length;
    const activeListings = properties.filter(
      (p) => p.status === "active" || p.status === "pending" || p.status === "under-offer"
    ).length;
    const pendingDeals = clients.filter(
      (c) => c.stage === "negotiating" || c.stage === "closing"
    ).length;

    // Closed this month — from activities of type "closed" within current month
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const closedThisMonth = events.filter((e) => {
      if (e.type !== "closed") return false;
      const d = new Date(e.timestamp);
      return d.getMonth() === m && d.getFullYear() === y;
    }).length;

    // Pipeline value — sum budget of clients still in pipeline (not closed)
    const pipelineValue = clients
      .filter((c) => c.stage !== "closed")
      .reduce((sum, c) => sum + (Number(c.budget) || 0), 0);

    // Avg days to close — from "closed" activity timestamps vs client created
    // Approximation: average of (now - first activity for client) for closed clients
    const closedClients = clients.filter((c) => c.stage === "closed");
    let avgDaysToClose = 0;
    if (closedClients.length > 0) {
      const totals = closedClients.map((c) => {
        const clientEvents = events
          .filter((e) => e.clientId === c.id)
          .sort((a, b) => a.timestamp - b.timestamp);
        if (clientEvents.length < 2) return null;
        const span = clientEvents[clientEvents.length - 1].timestamp - clientEvents[0].timestamp;
        return Math.max(1, Math.round(span / 86_400_000));
      }).filter((v): v is number => v !== null);
      if (totals.length > 0) {
        avgDaysToClose = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
      }
    }

    return { totalClients, activeListings, pendingDeals, closedThisMonth, pipelineValue, avgDaysToClose };
  }, [clients, properties, events]);

  const items = [
    { label: "Total Clients", value: String(computed.totalClients), hint: "in your book", icon: Users, accent: false },
    { label: "Active Listings", value: String(computed.activeListings), hint: "on market", icon: Home, accent: false },
    { label: "Pending Deals", value: String(computed.pendingDeals), hint: "negotiating / closing", icon: Handshake, accent: false },
    { label: `Closed (${monthLabel})`, value: String(computed.closedThisMonth), hint: "this month", icon: TrendingUp, accent: false },
    { label: "Pipeline Value", value: formatMoney(computed.pipelineValue), hint: "open opportunities", icon: DollarSign, accent: true },
    { label: "Avg. Days to Close", value: computed.avgDaysToClose ? `${computed.avgDaysToClose}d` : "—", hint: "across closed deals", icon: Clock, accent: false },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            "group relative overflow-hidden rounded-xl border border-border p-5 transition-all duration-300 hover:border-gold/40 animate-fade-up shadow-card",
            item.accent ? "bg-gradient-surface ring-gold" : "bg-card"
          )}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {item.accent && (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent pointer-events-none" />
          )}
          <div className="relative flex items-start justify-between mb-6">
            <div
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center",
                item.accent ? "bg-gradient-gold text-primary-foreground" : "bg-secondary text-gold"
              )}
            >
              <item.icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.hint}</span>
          </div>
          <div className="relative">
            <div className="font-display text-3xl text-foreground tracking-tight">{item.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
