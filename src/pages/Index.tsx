import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { Pipeline } from "@/components/dashboard/Pipeline";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { ActivityTicker } from "@/components/dashboard/ActivityTicker";

const Index = () => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 px-6 lg:px-10 py-8 pb-20 space-y-6">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Dashboard</div>
              <h2 className="font-display text-4xl tracking-tight">
                Your portfolio at a <span className="text-gradient-gold italic">glance</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                Track every client, deal, and viewing across your active book of business.
              </p>
            </div>
          </div>

          <StatsGrid />

          <Pipeline />

          <ClientsTable />

          <footer className="pt-6 pb-2 text-center text-xs text-muted-foreground">
            Maison Realty CRM · Demo data · Built with care
          </footer>
        </main>
      </div>
      <ActivityTicker />
    </div>
  );
};

export default Index;
