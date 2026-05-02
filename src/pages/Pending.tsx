import { Hourglass, XCircle, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Pending = () => {
  const { user, loading, approvalStatus, signOut, refreshAccess } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (approvalStatus === "approved") return <Navigate to="/" replace />;

  const rejected = approvalStatus === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-6">
          {rejected ? (
            <XCircle className="h-7 w-7 text-destructive" />
          ) : (
            <Hourglass className="h-7 w-7 text-gold" />
          )}
        </div>
        <h1 className="font-display text-3xl tracking-tight mb-3">
          {rejected ? "Access denied" : "Awaiting approval"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {rejected
            ? "Your access request was rejected. Please contact your administrator if you believe this is an error."
            : `Hi ${user.email}. An administrator must approve your account before you can access the CRM. You'll be able to sign in as soon as that happens.`}
        </p>
        <div className="flex gap-2 justify-center mt-8">
          <Button variant="outline" onClick={refreshAccess}>
            <RefreshCw className="h-4 w-4" /> Check again
          </Button>
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pending;
