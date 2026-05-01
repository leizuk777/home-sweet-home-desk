import { useMemo } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { useClients } from "@/context/ClientsContext";
import { useProperties } from "@/context/PropertiesContext";
import { stages } from "@/data/clients";
import { Users, TrendingUp, Target, DollarSign } from "lucide-react";

const formatMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`;

const Clients = () => {
  const { clients } = useClients();
  const { properties } = useProperties();

  const stats = useMemo(() => {
    const totalBudget = clients.reduce((sum, c) => sum + c.budget, 0);
    const active = clients.filter((c) => c.stage !== "closed").length;
    const closing = clients.filter((c) => c.stage === "closing" || c.stage === "negotiating").length;
    return { totalBudget, active, closing };
  }, [clients]);

  const byStage = useMemo(
    () =>
      stages.map((s) => ({
        ...s,
        count: clients.filter((c) => c.stage === s.id).length,
      })),
    [clients]
  );

  const tiles = [
    { label: "Total Clients", value: String(clients.length), icon: Users, hint: `${active(clients.length)} in your book` },
    { label: "Active Pipeline", value: String(stats.active), icon: TrendingUp, hint: `${stats.closing} near close` },
    { label: "Linked Listings", value: String(properties.length), icon: Target, hint: "Properties tracked" },
    { label: "Combined Budget", value: formatMoney(stats.totalBudget), icon: DollarSign, hint: "Across all clients" },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 px-6 lg:px-10 py-8 space-y-6">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Directory</div>
              <h2 className="font-display text-4xl tracking-tight">
                Your <span className="text-gradient-gold italic">clients</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                Every relationship in your book — filterable, searchable, and one click from action.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tiles.map((t) => (
              <div
                key={t.label}
                className="rounded-xl border border-border bg-card p-5 shadow-card hover:border-gold/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t.label}
                  </div>
                  <t.icon className="h-3.5 w-3.5 text-gold" />
                </div>
                <div className="font-display text-3xl mt-3 text-foreground">{t.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.hint}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Pipeline distribution
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {byStage.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-border/60 bg-secondary/30 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.color.replace("text-", "bg-")}`} />
                    <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>
                  </div>
                  <div className="font-mono text-2xl mt-2 text-foreground">{s.count}</div>
                </div>
              ))}
            </div>
          </div>

          <ClientsTable />

          <footer className="pt-6 pb-2 text-center text-xs text-muted-foreground">
            Maison Realty CRM · Demo data · Built with care
          </footer>
        </main>
      </div>
    </div>
  );
};

const active = (n: number) => `${n} total`;

export default Clients;
