import { LayoutDashboard, Users, Home, Calendar, MessageSquare, BarChart3, Settings, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Users, label: "Clients", badge: "142" },
  { icon: Home, label: "Listings", badge: "38" },
  { icon: Calendar, label: "Viewings" },
  { icon: MessageSquare, label: "Messages", badge: "5" },
  { icon: BarChart3, label: "Analytics" },
];

export const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-gold flex items-center justify-center shadow-glow">
            <Building2 className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-lg leading-none text-foreground">Maison</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Realty CRM</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Workspace</div>
        {nav.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              item.active
                ? "bg-sidebar-accent text-gold ring-gold"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-gold"
            )}
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              {item.label}
            </span>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <div className="mt-3 flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50">
          <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground text-xs font-semibold">
            EV
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground truncate">Elena Vasquez</div>
            <div className="text-xs text-muted-foreground truncate">Senior Agent</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
