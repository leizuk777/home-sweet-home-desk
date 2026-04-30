import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Home,
  Star,
  Calendar,
  FileSignature,
  Handshake,
  CheckCircle2,
  DollarSign,
  Clock,
  StickyNote,
  Pencil,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { PropertyListings } from "@/components/dashboard/PropertyListings";
import { useClients } from "@/context/ClientsContext";
import { stages, activity, type ClientType } from "@/data/clients";
import { cn } from "@/lib/utils";

const typeStyles: Record<ClientType, string> = {
  buyer: "bg-info/10 text-info border-info/20",
  seller: "bg-warning/10 text-warning border-warning/20",
  renter: "bg-success/10 text-success border-success/20",
  investor: "bg-gold/10 text-gold border-gold/30",
};

const iconMap = {
  negotiation: Handshake,
  closing: FileSignature,
  viewing: Calendar,
  closed: CheckCircle2,
};

const formatBudget = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : `$${(n / 1000).toFixed(0)}K`;

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients } = useClients();

  const client = useMemo(() => clients.find((c) => c.id === id), [clients, id]);
  const clientActivity = useMemo(
    () => (client ? activity.filter((a) => a.who === client.name) : []),
    [client]
  );

  if (!client) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Header />
          <main className="flex-1 px-6 lg:px-10 py-12">
            <div className="max-w-md mx-auto text-center space-y-4">
              <h2 className="font-display text-2xl">Client not found</h2>
              <p className="text-sm text-muted-foreground">
                The client you're looking for doesn't exist or has been removed.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-bright"
              >
                <ArrowLeft className="h-4 w-4" /> Back to dashboard
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const stage = stages.find((s) => s.id === client.stage)!;
  const stageIndex = stages.findIndex((s) => s.id === client.stage);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 px-6 lg:px-10 py-8 space-y-6">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>

          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{ background: "var(--gradient-glow)" }}
            />
            <div className="relative p-8 flex flex-wrap items-start gap-6">
              <div className="h-20 w-20 rounded-full bg-gradient-gold flex items-center justify-center text-2xl font-semibold text-primary-foreground shrink-0 shadow-elegant">
                {client.avatar}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-display text-3xl tracking-tight">
                    {client.name}
                  </h1>
                  <span
                    className={cn(
                      "inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border capitalize",
                      typeStyles[client.type]
                    )}
                  >
                    {client.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: client.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">
                    Priority client · {client.id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground pt-2">
                  <a
                    href={`mailto:${client.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" /> {client.email}
                  </a>
                  <a
                    href={`tel:${client.phone}`}
                    className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" /> {client.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-xs uppercase tracking-wider text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-gold text-primary-foreground text-xs uppercase tracking-wider font-medium shadow-elegant">
                  <Phone className="h-3.5 w-3.5" /> Contact
                </button>
              </div>
            </div>
          </div>

          {/* Stage progress */}
          <div className="rounded-xl border border-border bg-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg">Deal pipeline</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Currently in <span className={stage.color}>{stage.label}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stages.map((s, i) => {
                const reached = i <= stageIndex;
                const current = i === stageIndex;
                return (
                  <div key={s.id} className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        reached ? "bg-gradient-gold" : "bg-secondary"
                      )}
                    />
                    <div
                      className={cn(
                        "text-[10px] uppercase tracking-wider mt-2 truncate",
                        current
                          ? "text-gold font-semibold"
                          : reached
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left: details */}
            <div className="xl:col-span-2 space-y-6">
              <div className="rounded-xl border border-border bg-card shadow-card p-6">
                <h3 className="font-display text-lg mb-4">Property interest</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailRow
                    icon={MapPin}
                    label="Location"
                    value={client.location}
                  />
                  <DetailRow
                    icon={Home}
                    label="Property"
                    value={client.property}
                  />
                  <DetailRow
                    icon={DollarSign}
                    label="Budget"
                    value={formatBudget(client.budget)}
                    accent
                  />
                  <DetailRow
                    icon={Clock}
                    label="Last contact"
                    value={client.lastContact}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card shadow-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <StickyNote className="h-4 w-4 text-gold" />
                  <h3 className="font-display text-lg">Notes</h3>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {client.notes}
                </p>
              </div>
            </div>

            {/* Right: activity */}
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden h-fit">
              <div className="px-6 py-5 border-b border-border">
                <h3 className="font-display text-lg">Recent activity</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {clientActivity.length
                    ? `${clientActivity.length} event${clientActivity.length > 1 ? "s" : ""}`
                    : "No recorded activity yet"}
                </p>
              </div>
              <div className="p-3 space-y-1">
                {clientActivity.length === 0 && (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    Activity will appear here as you log calls, viewings, and offers.
                  </div>
                )}
                {clientActivity.map((a) => {
                  const Icon = iconMap[a.type as keyof typeof iconMap] ?? Calendar;
                  return (
                    <div
                      key={a.id}
                      className="flex gap-3 p-3 rounded-lg hover:bg-secondary/40 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center bg-gold/10 text-gold">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-foreground leading-snug">
                          <span className="text-muted-foreground">{a.what}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {a.when}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-lg bg-secondary/60 border border-border flex items-center justify-center shrink-0">
      <Icon className="h-3.5 w-3.5 text-gold" />
    </div>
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "text-sm mt-0.5 truncate",
          accent ? "font-mono text-gold" : "text-foreground"
        )}
      >
        {value}
      </div>
    </div>
  </div>
);

export default ClientDetail;
