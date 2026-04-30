import { useState } from "react";
import { Phone, Mail, MoreHorizontal, Star, Filter } from "lucide-react";
import { clients, stages, type ClientType } from "@/data/clients";
import { cn } from "@/lib/utils";

const typeStyles: Record<ClientType, string> = {
  buyer: "bg-info/10 text-info border-info/20",
  seller: "bg-warning/10 text-warning border-warning/20",
  renter: "bg-success/10 text-success border-success/20",
  investor: "bg-gold/10 text-gold border-gold/30",
};

const filters = ["All", "Buyer", "Seller", "Investor", "Renter"];

export const ClientsTable = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? clients : clients.filter((c) => c.type === active.toLowerCase());

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-border">
        <div>
          <h2 className="font-display text-xl">Active Clients</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} of {clients.length} clients</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  active === f
                    ? "bg-gradient-gold text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors">
            <Filter className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
              <th className="px-6 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Property Interest</th>
              <th className="px-4 py-3 font-medium text-right">Budget</th>
              <th className="px-4 py-3 font-medium">Last Contact</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const stage = stages.find((s) => s.id === c.stage)!;
              return (
                <tr
                  key={c.id}
                  className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0">
                        {c.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">{c.name}</span>
                          <div className="flex">
                            {Array.from({ length: c.rating }).map((_, i) => (
                              <Star key={i} className="h-2.5 w-2.5 fill-gold text-gold" />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border capitalize",
                        typeStyles[c.type]
                      )}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full", stage.color.replace("text-", "bg-"))} />
                      <span className={cn("text-xs font-medium", stage.color)}>{stage.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-foreground">{c.location}</div>
                    <div className="text-xs text-muted-foreground">{c.property}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-mono text-sm text-gold">
                      ${c.budget >= 1_000_000 ? `${(c.budget / 1_000_000).toFixed(2)}M` : `${(c.budget / 1000).toFixed(0)}K`}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">{c.lastContact}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-gold transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-gold transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-gold transition-colors">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
