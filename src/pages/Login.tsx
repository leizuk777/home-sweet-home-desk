import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Login = () => {
  const { user, loading, approvalStatus } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  if (loading) return null;
  if (user && approvalStatus === "approved") return <Navigate to="/" replace />;
  if (user) return <Navigate to="/pending" replace />;

  const handleGoogle = async () => {
    setSigningIn(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Sign in failed", { description: result.error.message });
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-14 w-14 rounded-xl bg-gradient-gold flex items-center justify-center shadow-glow mb-5">
            <Building2 className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3">Maison Realty</div>
          <h1 className="font-display text-4xl tracking-tight">
            Welcome <span className="text-gradient-gold italic">back</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            Sign in to access your private CRM workspace. Access is invite-only.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Button
            onClick={handleGoogle}
            disabled={signingIn}
            size="lg"
            className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            {signingIn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M21.35 11.1H12v3.8h5.35c-.23 1.4-1.65 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95S8.78 7.1 12 7.1c1.83 0 3.06.78 3.76 1.45l2.57-2.48C16.74 4.62 14.6 3.7 12 3.7 6.92 3.7 2.85 7.78 2.85 12.85S6.92 22 12 22c6.93 0 9.5-4.86 9.5-7.4 0-.5-.05-.9-.15-1.5z"
                />
              </svg>
            )}
            Continue with Google
          </Button>
          <p className="text-[11px] text-muted-foreground mt-4 text-center leading-relaxed">
            By signing in you agree to the workspace access policy. The first account becomes the admin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
