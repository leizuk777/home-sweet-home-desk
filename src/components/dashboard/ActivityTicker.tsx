import { Link } from "react-router-dom";
import { useActivity } from "@/context/ActivityContext";
import {
  Activity as ActivityIcon,
  Calendar,
  CheckCircle2,
  FileSignature,
  Handshake,
  Pencil,
  RefreshCw,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  lead: Sparkles,
  viewing: Calendar,
  negotiation: Handshake,
  closing: FileSignature,
  closed: CheckCircle2,
  edit: Pencil,
  note: StickyNote,
  "mls-sync": RefreshCw,
} as const;

const colorMap = {
  lead: "text-info",
  viewing: "text-warning",
  negotiation: "text-gold",
  closing: "text-success",
  closed: "text-muted-foreground",
  edit: "text-foreground",
  note: "text-gold",
  "mls-sync": "text-info",
} as const;

export const ActivityTicker = () => {
  const { events } = useActivity();
  const recent = events.slice(0, 20);

  if (recent.length === 0) return null;

  // Duplicate the list for a seamless marquee loop
  const loop = [...recent, ...recent];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md shadow-lg">
      <div className="flex items-stretch h-11 overflow-hidden">
        <Link
          to="/activity"
          className="flex items-center gap-2 px-4 border-r border-border bg-secondary/40 hover:bg-secondary transition-colors shrink-0"
        >
          <ActivityIcon className="h-3.5 w-3.5 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-foreground">
            Live Activity
          </span>
        </Link>

        <div className="relative flex-1 overflow-hidden">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee py-3">
            {loop.map((a, i) => {
              const Icon = iconMap[a.type] ?? Calendar;
              return (
                <div key={`${a.id}-${i}`} className="flex items-center gap-2 text-xs">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", colorMap[a.type])} />
                  <span className="font-medium text-foreground">{a.who}</span>
                  <span className="text-muted-foreground">{a.what}</span>
                  <span className="text-[10px] text-muted-foreground/70 ml-1">· {a.when}</span>
                  <span className="text-border ml-4">•</span>
                </div>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-card to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card to-transparent" />
        </div>
      </div>
    </div>
  );
};
