import { stages, clients } from "@/data/clients";
import { cn } from "@/lib/utils";

export const Pipeline = () => {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <h2 className="font-display text-xl">Deal Pipeline</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Drag clients between stages to update status</p>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="text-gold font-mono">$47.3M</span> in motion
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-border">
        {stages.map((stage) => {
          const stageClients = clients.filter((c) => c.stage === stage.id);
          const value = stageClients.reduce((sum, c) => sum + c.budget, 0);
          return (
            <div key={stage.id} className="bg-card p-4 min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={cn("text-[10px] uppercase tracking-[0.18em] font-medium", stage.color)}>
                    {stage.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {stageClients.length} · ${(value / 1_000_000).toFixed(1)}M
                  </div>
                </div>
                <div className={cn("h-2 w-2 rounded-full", stage.color.replace("text-", "bg-"))} />
              </div>

              <div className="space-y-2">
                {stageClients.map((c) => (
                  <div
                    key={c.id}
                    className="group p-3 rounded-lg bg-secondary/40 border border-transparent hover:border-gold/30 hover:bg-secondary cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-6 w-6 rounded-full bg-gradient-gold flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
                        {c.avatar}
                      </div>
                      <div className="text-xs font-medium text-foreground truncate">{c.name}</div>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate mb-1">{c.location}</div>
                    <div className="text-xs font-mono text-gold">
                      ${(c.budget / 1_000_000).toFixed(2)}M
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
