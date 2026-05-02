import { LayoutDashboard, Users, Home, Calendar, MessageSquare, BarChart3, Settings, Building2, Activity, ShieldCheck, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useProperties } from "@/context/PropertiesContext";
import { useClients } from "@/context/ClientsContext";
import { useActivity } from "@/context/ActivityContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const location = useLocation();
  const { properties } = useProperties();
  const { clients } = useClients();
  const { events } = useActivity();
  const { user, isAdmin, signOut } = useAuth();

  const nav = [
    { icon: LayoutDashboard, label: "Overview", to: "/" },
    { icon: Users, label: "Clients", to: "/clients", badge: String(clients.length) },
    { icon: Home, label: "Listings", to: "/listings", badge: String(properties.length) },
    { icon: Activity, label: "Activity", to: "/activity", badge: String(events.length) },
    { icon: Calendar, label: "Viewings", to: "#" },
    { icon: MessageSquare, label: "Messages", to: "#", badge: "5" },
    { icon: BarChart3, label: "Analytics", to: "#" },
    ...(isAdmin ? [{ icon: ShieldCheck, label: "Admin", to: "/admin" }] : []),
  ];

  const meta = (user?.user_metadata ?? {}) as { full_name?: string; name?: string; avatar_url?: string };
  const displayName = meta.full_name || meta.name || user?.email || "Account";
  const initials = displayName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-gold flex items-center justify-center shadow-glow">
            <Building2 className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-lg leading-none text-foreground">Maison</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Realty CRM</div>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Workspace</div>
        {nav.map((item) => {
          const active =
            item.to !== "#" &&
            (item.to === "/"
              ? location.pathname === "/" && item.label === "Overview"
              : location.pathname.startsWith(item.to));
          const Comp: any = item.to === "#" ? "button" : NavLink;
          const compProps = item.to === "#" ? {} : { to: item.to };
          return (
            <Comp
              key={item.label}
              {...compProps}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
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
            </Comp>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50">
          {meta.avatar_url ? (
            <img src={meta.avatar_url} alt="" className="h-9 w-9 rounded-full" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground text-xs font-semibold">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground truncate">{isAdmin ? "Admin" : "Agent"}</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
