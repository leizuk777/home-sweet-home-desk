import { Users, Home, Handshake, TrendingUp, DollarSign, Clock } from "lucide-react";
import { stats } from "@/data/clients";
import { cn } from "@/lib/utils";

const items = [
  { label: "Total Clients", value: stats.totalClients.toString(), change: "+12", icon: Users, accent: false },
  { label: "Active Listings", value: stats.activeListings.toString(), change: "+4", icon: Home, accent: false },
  { label: "Pending Deals", value: stats.pendingDeals.toString(), change: "+2", icon: Handshake, accent: false },
  { label: "Closed (Apr)", value: stats.closedThisMonth.toString(), change: "+3", icon: TrendingUp, accent: false },
  {
    label: "Pipeline Value",
    value: `$${(stats.pipelineValue / 1_000_000).toFixed(1)}M`,
    change: "+18%",
    icon: DollarSign,
    accent: true,
  },
  { label: "Avg. Days to Close", value: `${stats.avgDaysToClose}d`, change: "−2d", icon: Clock, accent: false },
];

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
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
            <span className="text-xs font-mono text-success">{item.change}</span>
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
