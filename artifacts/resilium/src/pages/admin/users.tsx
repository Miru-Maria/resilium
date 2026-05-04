import React, { useState } from "react";
import { AdminLayout, adminAuthHeaders } from "./layout";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, CalendarDays, BookOpen, AlertTriangle, Copy, Check, Info } from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  planCount: number;
  lastActive: string | null;
}

async function fetchUsers(): Promise<{ users: AdminUser[] }> {
  const res = await fetch(`${BASE}/api/admin/users`, { headers: adminAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  return (
    <div className="flex items-center gap-1.5 group">
      <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]" title={id}>{id}</span>
      <button type="button" onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-0.5 rounded hover:bg-muted" title="Copy user ID">
        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
      </button>
    </div>
  );
}

export default function AdminUsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: fetchUsers,
    staleTime: 60 * 1000,
  });

  return (
    <AdminLayout activeSection="users">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">All users in your local database (synced from Clerk)</p>
          </div>
        </div>

        {/* ── Why does this show fewer users than Clerk? ─────────────────────── */}
        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-950/20 px-4 py-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200 leading-relaxed space-y-1.5">
            <p className="font-semibold text-blue-300">Why does this table show fewer users than Clerk?</p>
            <p>
              This table reads from your <strong>local database</strong>, not from Clerk directly.
              A user only appears here automatically once they sign into the app at least once
              — Clerk fires a sync at that point. Users who registered via Clerk but have
              never opened the app will <em>not</em> appear here yet.
            </p>
            <p>
              To pull all 49+ Clerk users into this table in one step, go to{" "}
              <Link href="/admin/growth">
                <span className="underline underline-offset-2 cursor-pointer text-blue-300 hover:text-blue-100">
                  Growth Hub → User Sync &amp; Email Drip → Import from Clerk
                </span>
              </Link>
              . After that import completes, come back here and the count will match Clerk.
            </p>
            <p className="text-blue-400 text-xs">
              This is intentional — the local DB is the source of truth for drip emails, broadcasts,
              and analytics. Clerk is only the auth provider.
            </p>
          </div>
        </div>

        {isLoading && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
        {error && <div className="flex items-center gap-3 text-destructive py-8"><AlertTriangle className="w-5 h-5" /><span className="text-sm">Failed to load users.</span></div>}

        {data && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Local DB Users</p>
                <p className="text-3xl font-bold text-foreground">{data.users.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Use Growth → Import from Clerk to sync all</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">With Assessments</p>
                <p className="text-3xl font-bold text-foreground">{data.users.filter(u => u.planCount > 0).length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Plans</p>
                <p className="text-3xl font-bold text-foreground">{data.users.reduce((s, u) => s + u.planCount, 0)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clerk ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plans</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Active</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.users.map(u => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.profileImageUrl
                            ? <img src={u.profileImageUrl} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                            : <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">{(u.firstName?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}</span>
                              </div>
                          }
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><CopyId id={u.id} /></td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-foreground font-semibold">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />{u.planCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{fmt(u.lastActive)}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(u.createdAt)}</td>
                    </tr>
                  ))}
                  {data.users.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      No users yet. Use Growth → Import from Clerk to sync.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
