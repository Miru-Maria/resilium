import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, AlertCircle, KeyRound, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { ResilientIcon } from "@/components/resilient-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recovery flow
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryRequested, setRecoveryRequested] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        setLocation("/admin/dashboard");
      } else {
        setError(data.message ?? "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRecovery = async () => {
    setRecoveryLoading(true);
    setRecoveryError(null);
    try {
      const res = await fetch(`${BASE}/api/admin/request-recovery`, { method: "POST" });
      if (res.ok) {
        setRecoveryRequested(true);
      } else {
        setRecoveryError("Failed to generate recovery code. Try again.");
      }
    } catch {
      setRecoveryError("Network error.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryError(null);
    try {
      const res = await fetch(`${BASE}/api/admin/verify-recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: recoveryCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        setLocation("/admin/dashboard");
      } else {
        setRecoveryError(data.message ?? "Invalid or expired code.");
      }
    } catch {
      setRecoveryError("Network error.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ResilientIcon className="w-9 h-9" />
            <span className="font-display font-bold text-2xl text-primary">Resilium</span>
          </div>
          <p className="text-muted-foreground text-sm">Admin Dashboard</p>
        </div>

        <Card className="shadow-xl border-none bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-display">Sign in</CardTitle>
            <CardDescription>Enter your admin credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Forgot password expander */}
            <div className="border-t pt-3">
              <button
                type="button"
                onClick={() => setShowRecovery(v => !v)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Forgot password?
                {showRecovery ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
              </button>

              {showRecovery && (
                <div className="mt-3 space-y-3">
                  {!recoveryRequested ? (
                    <>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This will generate a one-time recovery code that appears in your <strong>Replit server logs</strong>. The code is valid for 15 minutes.
                      </p>
                      {recoveryError && (
                        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded px-2.5 py-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {recoveryError}
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleRequestRecovery}
                        disabled={recoveryLoading}
                      >
                        {recoveryLoading ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : null}
                        Generate recovery code
                      </Button>
                    </>
                  ) : (
                    <form onSubmit={handleVerifyRecovery} className="space-y-3">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2.5 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-500" />
                        Recovery code generated. Open your Replit console (server logs) to find it — look for the line starting with <strong>ADMIN RECOVERY CODE</strong>.
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="recovery-code" className="text-xs">Recovery code</Label>
                        <Input
                          id="recovery-code"
                          type="text"
                          placeholder="e.g. A1B2C3D4"
                          value={recoveryCode}
                          onChange={e => setRecoveryCode(e.target.value.toUpperCase())}
                          maxLength={8}
                          className="font-mono tracking-widest text-center text-sm uppercase"
                          disabled={recoveryLoading}
                          autoFocus
                        />
                      </div>
                      {recoveryError && (
                        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded px-2.5 py-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {recoveryError}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="flex-1" disabled={recoveryLoading || recoveryCode.length < 8}>
                          {recoveryLoading ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : null}
                          Sign in with code
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => { setRecoveryRequested(false); setRecoveryCode(""); setRecoveryError(null); }}
                          disabled={recoveryLoading}
                        >
                          Resend
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
