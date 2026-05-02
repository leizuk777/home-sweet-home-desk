import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ApprovalRow {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("user_approvals")
      .select("user_id,email,full_name,avatar_url,status,requested_at")
      .order("requested_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as ApprovalRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    const { error } = await supabase
      .from("user_approvals")
      .update({ status, decided_at: new Date().toISOString(), decided_by: user?.id })
      .eq("user_id", id);
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`User ${status}`);
    load();
  };

  const statusColor = (s: string) =>
    s === "approved" ? "bg-emerald-500/10 text-emerald-500"
    : s === "rejected" ? "bg-destructive/10 text-destructive"
    : "bg-gold/10 text-gold";

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 px-6 lg:px-10 py-8 space-y-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Admin</div>
            <h2 className="font-display text-4xl tracking-tight">
              Access <span className="text-gradient-gold italic">requests</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Approve or reject sign-in requests to the CRM.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gold" />
              </div>
            ) : rows.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">No requests yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">User</th>
                    <th className="text-left px-6 py-3 font-medium">Requested</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.user_id} className="border-t border-border">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {r.avatar_url ? (
                            <img src={r.avatar_url} alt="" className="h-9 w-9 rounded-full" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-semibold text-primary-foreground">
                              {(r.full_name ?? r.email).slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{r.full_name ?? "—"}</div>
                            <div className="text-xs text-muted-foreground">{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDistanceToNow(new Date(r.requested_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={statusColor(r.status)} variant="secondary">
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          {r.status !== "approved" && (
                            <Button
                              size="sm"
                              onClick={() => decide(r.user_id, "approved")}
                              disabled={busy === r.user_id}
                              className="bg-emerald-600 hover:bg-emerald-600/90 text-white"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </Button>
                          )}
                          {r.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => decide(r.user_id, "rejected")}
                              disabled={busy === r.user_id}
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
