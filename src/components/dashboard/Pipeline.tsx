import { useState, DragEvent } from "react";
import { stages, type ClientStage } from "@/data/clients";
import { useClients } from "@/context/ClientsContext";
import { useActivity, type ActivityType } from "@/context/ActivityContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const stageToActivityType: Record<ClientStage, ActivityType> = {
  lead: "lead",
  viewing: "viewing",
  negotiating: "negotiation",
  closing: "closing",
  closed: "closed",
};

export const Pipeline = () => {
  const { clients, updateClientStage } = useClients();
  const { logActivity } = useActivity();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<ClientStage | null>(null);

  const totalInMotion = clients
    .filter((c) => c.stage !== "closed")
    .reduce((sum, c) => sum + c.budget, 0);

  const formatM = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;

  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverStage(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, stage: ClientStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overStage !== stage) setOverStage(stage);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, stage: ClientStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    setOverStage(null);
    setDraggingId(null);
    if (!id) return;
    const client = clients.find((c) => c.id === id);
    if (!client || client.stage === stage) return;
    updateClientStage(id, stage);
    const newStage = stages.find((s) => s.id === stage)!;
    logActivity({
      who: client.name,
      what: `moved to ${newStage.label}`,
      type: stageToActivityType[stage],
      clientId: client.id,
    });
    toast({
      title: "Stage updated",
      description: `${client.name} moved to ${newStage.label}.`,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <h2 className="font-display text-xl">Deal Pipeline</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag clients between stages to update status
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="text-gold font-mono">{formatM(totalInMotion)}</span> in motion
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-border">
        {stages.map((stage) => {
          const stageClients = clients.filter((c) => c.stage === stage.id);
          const value = stageClients.reduce((sum, c) => sum + c.budget, 0);
          const isOver = overStage === stage.id;
          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={cn(
                "bg-card p-4 min-h-[200px] transition-colors",
                isOver && "bg-gold/5 ring-1 ring-inset ring-gold/40"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div
                    className={cn(
                      "text-[10px] uppercase tracking-[0.18em] font-medium",
                      stage.color
                    )}
                  >
                    {stage.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {stageClients.length} · {formatM(value)}
                  </div>
                </div>
                <div className={cn("h-2 w-2 rounded-full", stage.color.replace("text-", "bg-"))} />
              </div>

              <div className="space-y-2">
                {stageClients.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "group p-3 rounded-lg bg-secondary/40 border border-transparent hover:border-gold/30 hover:bg-secondary cursor-grab active:cursor-grabbing transition-all",
                      draggingId === c.id && "opacity-40"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-6 w-6 rounded-full bg-gradient-gold flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
                        {c.avatar}
                      </div>
                      <div className="text-xs font-medium text-foreground truncate">{c.name}</div>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate mb-1">
                      {c.location}
                    </div>
                    <div className="text-xs font-mono text-gold">
                      ${(c.budget / 1_000_000).toFixed(2)}M
                    </div>
                  </div>
                ))}
                {stageClients.length === 0 && (
                  <div className="text-[11px] text-muted-foreground/60 italic px-1 py-2">
                    Drop clients here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
