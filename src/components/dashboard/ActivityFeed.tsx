import { activity } from "@/data/clients";
import { Activity, Calendar, CheckCircle2, FileSignature, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  negotiation: Handshake,
  closing: FileSignature,
  viewing: Calendar,
  closed: CheckCircle2,
};

const colorMap = {
  negotiation: "text-gold bg-gold/10",
  closing: "text-success bg-success/10",
  viewing: "text-warning bg-warning/10",
  closed: "text-muted-foreground bg-secondary",
};

export const ActivityFeed = () => {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden h-full">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl">Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Latest movements</p>
        </div>
        <Activity className="h-4 w-4 text-gold" />
      </div>

      <div className="p-3 space-y-1">
        {activity.map((a, i) => {
          const Icon = iconMap[a.type as keyof typeof iconMap];
          return (
            <div
              key={a.id}
              className="flex gap-3 p-3 rounded-lg hover:bg-secondary/40 transition-colors animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center",
                  colorMap[a.type as keyof typeof colorMap]
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-foreground leading-snug">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.what}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{a.when}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-border">
        <button className="text-xs text-gold hover:text-gold-bright font-medium tracking-wide transition-colors">
          View full timeline →
        </button>
      </div>
    </div>
  );
};
