import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  approvalStatus: ApprovalStatus | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAccess = async (userId: string) => {
    const [{ data: approval }, { data: roles }] = await Promise.all([
      supabase.from("user_approvals").select("status").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setApprovalStatus((approval?.status as ApprovalStatus) ?? "pending");
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setTimeout(() => fetchAccess(newSession.user.id), 0);
      } else {
        setApprovalStatus(null);
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchAccess(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshAccess = async () => {
    if (user) await fetchAccess(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, approvalStatus, isAdmin, signOut, refreshAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
