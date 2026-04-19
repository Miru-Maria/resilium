import { useState, useEffect, useCallback } from "react";
import { AdminLayout, adminAuthHeaders } from "./layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, Lock, Database, ShieldCheck, RefreshCw } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AuditEntry {
  id: number;
  action: string;
  details: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
}

interface BackupFile {
  filename: string;
  timestamp: number;
  sizeBytes: number;
  iso: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    login_success: "Logged in",
    login_failed: "Failed login attempt",
    logout: "Logged out",
    password_changed: "Password changed",
    backup_triggered: "Manual backup triggered",
    gdpr_delete: "GDPR delete executed",
    gdpr_export: "GDPR export fulfilled",
  };
  return labels[action] ?? action;
}

function actionColor(action: string): string {
  if (action === "login_failed") return "text-destructive";
  if (action.startsWith("login")) return "text-green-600 dark:text-green-400";
  if (action === "password_changed") return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

export default function AdminSecurityPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(true);
  const [backupTriggerLoading, setBackupTriggerLoading] = useState(false);
  const [backupTriggerMsg, setBackupTriggerMsg] = useState<string | null>(null);

  const fetchAuditLog = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/audit-log`, { headers: adminAuthHeaders(), credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAuditEntries(data.entries ?? []);
      }
    } catch { /* ignore */ } finally {
      setAuditLoading(false);
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    setBackupsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/backups`, { headers: adminAuthHeaders(), credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups ?? []);
      }
    } catch { /* ignore */ } finally {
      setBackupsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLog();
    fetchBackups();
  }, [fetchAuditLog, fetchBackups]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        await fetchAuditLog();
      } else {
        setError(data.message ?? "Failed to update password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerBackup = async () => {
    setBackupTriggerLoading(true);
    setBackupTriggerMsg(null);
    try {
      const res = await fetch(`${BASE}/api/admin/backups/trigger`, {
        method: "POST",
        headers: adminAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      setBackupTriggerMsg(res.ok ? "Backup started — it runs in the background. Refresh in ~30s to see it." : (data.message ?? "Failed to trigger backup."));
      if (res.ok) {
        setTimeout(fetchBackups, 35000);
        await fetchAuditLog();
      }
    } catch {
      setBackupTriggerMsg("Network error. Please try again.");
    } finally {
      setBackupTriggerLoading(false);
    }
  };

  return (
    <AdminLayout activeSection="security">
      <div className="p-8 max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Security</h1>
          <p className="text-muted-foreground text-sm">Admin credentials, audit trail, and database backups.</p>
        </div>

        {/* ── Change Password ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base">Change password</CardTitle>
            </div>
            <CardDescription>
              Your new password will be stored securely and used for all future logins. The original password set in Replit Secrets will become a fallback only if no password is stored here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
              {success && (
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-500/10 rounded-md px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Password updated successfully.</span>
                </div>
              )}

              <Button type="submit" disabled={loading || !newPassword || !confirmPassword}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? "Saving..." : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Backup History ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Database backups</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchBackups} disabled={backupsLoading}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${backupsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button size="sm" onClick={handleTriggerBackup} disabled={backupTriggerLoading}>
                  {backupTriggerLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                  Run backup now
                </Button>
              </div>
            </div>
            <CardDescription>
              Automated daily backups run at 02:30 UTC and are retained for 7 days. You can also trigger one on demand before major changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {backupTriggerMsg && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                <span>{backupTriggerMsg}</span>
              </div>
            )}

            {backupsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading backups…
              </div>
            ) : backups.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No backups found. The first automated backup runs at 02:30 UTC, or you can trigger one manually above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Date & time (UTC)</th>
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">File</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map(b => (
                      <tr key={b.filename} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 pr-4 font-mono text-xs">
                          {new Date(b.iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground text-xs truncate max-w-[200px]">
                          {b.filename.replace("backups/", "")}
                        </td>
                        <td className="py-2 text-right text-xs text-muted-foreground">{formatBytes(b.sizeBytes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Audit Log ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Admin audit log</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAuditLog} disabled={auditLoading}>
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${auditLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            <CardDescription>
              A record of all admin actions — logins, logouts, password changes, and backups. Last 200 entries shown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading audit log…
              </div>
            ) : auditEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No audit entries yet. Actions such as logins, password changes, and backup triggers will appear here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">When (UTC)</th>
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Action</th>
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">IP</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditEntries.map(e => (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(e.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })}
                        </td>
                        <td className={`py-2 pr-4 text-xs font-medium whitespace-nowrap ${actionColor(e.action)}`}>
                          {actionLabel(e.action)}
                        </td>
                        <td className="py-2 pr-4 text-xs text-muted-foreground font-mono">{e.ip ?? "—"}</td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {e.details && Object.keys(e.details).length > 0
                            ? Object.entries(e.details)
                                .filter(([k]) => k !== "username" || e.action === "login_failed")
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
