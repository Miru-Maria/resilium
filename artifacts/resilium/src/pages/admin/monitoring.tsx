import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { AdminLayout } from "./layout";
import {
  AlertTriangle, Activity, Globe, Smartphone, Server, ExternalLink, Settings,
  BarChart2, RefreshCw, Zap, Eye, CheckCircle2, XCircle, Clock, ShieldCheck,
  Play, Loader2, ChevronRight, AlertCircle, Trash2, Ban, FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── Tab state ─────────────────────────────────────────────────────────────────
type TabKey = "monitoring" | "ux-testing";

// ═══════════════════════════════════════════════════════════════════════════════
// MONITORING TAB
// ═══════════════════════════════════════════════════════════════════════════════

type SentryUrlStyle = "subdomain" | "path" | "unknown";
interface ParsedSentry { slug: string; base: string; style: SentryUrlStyle }

function parseSentryInput(raw: string): ParsedSentry | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.includes("sentry.io")) {
    try {
      const withProto = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      const url = new URL(withProto);
      const hostname = url.hostname;
      const subdomainMatch = hostname.match(/^([^.]+)\.(?:de\.)?sentry\.io$/);
      if (subdomainMatch && subdomainMatch[1] !== "de" && subdomainMatch[1] !== "us") {
        return { slug: subdomainMatch[1], base: `https://${hostname}`, style: "subdomain" };
      }
      const pathMatch = url.pathname.match(/^\/organizations\/([^/]+)/);
      if (pathMatch) return { slug: pathMatch[1], base: `${url.protocol}//${url.hostname}`, style: "path" };
    } catch {}
  }
  const slugOnly = trimmed.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!slugOnly.includes("/") && !slugOnly.includes(".")) {
    return { slug: slugOnly, base: "https://de.sentry.io", style: "path" };
  }
  return null;
}

function buildLink(parsed: ParsedSentry, projectId: string, feature: string): string {
  const featurePaths: Record<string, string> = {
    Issues: `/issues/?project=${projectId}`,
    Performance: `/performance/?project=${projectId}`,
    Replays: `/replays/?project=${projectId}`,
    Alerts: `/alerts/?project=${projectId}`,
  };
  return `${parsed.base}/organizations/${parsed.slug}${featurePaths[feature] ?? "/"}`;
}

const PROJECTS = [
  { key: "web",    label: "Web App",    slug: "resilium-web",    id: "4511187286818896", icon: Globe,      color: "#E08040", description: "React + Vite · resilium-platform.com",    features: ["Issues","Performance","Replays","Alerts"] },
  { key: "mobile", label: "Mobile App", slug: "resilium-mobile", id: "4511187296256080", icon: Smartphone, color: "#60A5FA", description: "Expo React Native · iOS",                  features: ["Issues","Performance","Alerts"] },
  { key: "api",    label: "API Server", slug: "resilium-api",    id: "4511187305431120", icon: Server,     color: "#34D399", description: "Express · Node.js · PostgreSQL",           features: ["Issues","Performance","Alerts"] },
];

interface CheckResult { name: string; passed: boolean; durationMs: number; detail?: string }
interface HealthRun { kind: "e2e" | "site"; ranAt: string; passed: boolean; totalMs: number; checks: CheckResult[] }
interface HealthData { e2e: HealthRun | null; site: HealthRun | null; e2eRunning: boolean; siteRunning: boolean }

function ago(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function RunPanel({ run, label }: { run: HealthRun; label: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {run.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ago(run.ranAt)}</span>
          <span>{(run.totalMs / 1000).toFixed(1)}s total</span>
        </div>
      </div>
      <ul className="space-y-1.5">
        {run.checks.map((c, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            {c.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />}
            <div className="min-w-0">
              <span style={{ color: c.passed ? "#EAD9BE" : "hsl(0 65% 65%)" }}>{c.name}</span>
              {c.detail && <span className="text-muted-foreground ml-1">— {c.detail}</span>}
              <span className="text-muted-foreground ml-1">({c.durationMs}ms)</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HealthCheckPanel() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<string | null>(null);
  const [triggering, setTriggering] = useState<"e2e" | "site" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/admin/health-checks`, { credentials: "include" });
      if (r.ok) { setData(await r.json()); setFetchErr(null); }
      else setFetchErr(`Server returned ${r.status}`);
    } catch { setFetchErr("Network error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); const id = setInterval(fetch_, 10_000); return () => clearInterval(id); }, [fetch_]);

  async function trigger(kind: "e2e" | "site") {
    setTriggering(kind); setMsg(null);
    try {
      const r = await fetch(`${BASE}/api/admin/health-checks/trigger-${kind}`, { method: "POST", credentials: "include" });
      const json = await r.json();
      setMsg(json.message ?? (r.ok ? "Started." : "Failed."));
      if (r.ok) setTimeout(fetch_, 3_000);
    } catch { setMsg("Network error."); }
    finally { setTriggering(null); }
  }

  return (
    <div className="mb-8 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Assessment Health Checks</span>
          {(data?.e2eRunning || data?.siteRunning) && <span className="text-xs text-amber-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Running…</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { setLoading(true); fetch_(); }} disabled={loading} className="h-7 text-xs gap-1">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={() => trigger("site")} disabled={!!triggering || data?.siteRunning} className="h-7 text-xs gap-1">
            {triggering === "site" || data?.siteRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}Site Audit
          </Button>
          <Button size="sm" onClick={() => trigger("e2e")} disabled={!!triggering || data?.e2eRunning} className="h-7 text-xs gap-1">
            {triggering === "e2e" || data?.e2eRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}Full E2E Test
          </Button>
        </div>
      </div>
      {msg && <div className="mb-3 px-3 py-2 rounded-lg bg-blue-950/40 border border-blue-800/50 text-xs text-blue-300">{msg}</div>}
      <p className="text-xs text-muted-foreground mb-4">
        Full E2E: submits a real assessment, waits for AI, retrieves report, deletes test data. Takes 2–4 min. Runs daily at 06:00 UTC. Site audit runs at 07:00 UTC. You'll receive email only on failure.
      </p>
      {loading && !data && !fetchErr && <div className="flex items-center justify-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mr-2" /><span className="text-sm">Loading last results…</span></div>}
      {fetchErr && <div className="mb-3 px-3 py-2 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />{fetchErr}</div>}
      {(!loading || data) && !fetchErr && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {data?.e2e ? <RunPanel run={data.e2e} label="Full Assessment E2E" /> : <div className="rounded-xl border border-dashed bg-muted/20 p-4 flex items-center justify-center text-sm text-muted-foreground">No E2E result yet — runs daily at 06:00 UTC.</div>}
          {data?.site ? <RunPanel run={data.site} label="Site Functionality Audit" /> : <div className="rounded-xl border border-dashed bg-muted/20 p-4 flex items-center justify-center text-sm text-muted-foreground">No site audit yet — runs daily at 07:00 UTC.</div>}
        </div>
      )}
    </div>
  );
}

function MonitoringTab() {
  const [orgInput, setOrgInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sentry_org_input") ?? "";
    setOrgInput(saved); setDraft(saved);
  }, []);

  const parsed = parseSentryInput(orgInput);

  function saveSlug() {
    const trimmed = draft.trim();
    const result = parseSentryInput(trimmed);
    if (!result && trimmed.length > 0) { setParseError(true); return; }
    setParseError(false);
    localStorage.setItem("sentry_org_input", trimmed);
    setOrgInput(trimmed); setEditing(false);
  }

  return (
    <div>
      <HealthCheckPanel />

      <div className="mb-8 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Settings className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-semibold">Sentry Organization URL</span></div>
          {!editing && <Button variant="ghost" size="sm" onClick={() => { setDraft(orgInput); setEditing(true); setParseError(false); }}>Edit</Button>}
        </div>
        {editing ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                className={`flex-1 px-3 py-2 rounded-md border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary ${parseError ? "border-destructive" : ""}`}
                placeholder="https://your-org.sentry.io  or  your-org-slug"
                value={draft} onChange={e => { setDraft(e.target.value); setParseError(false); }}
                onKeyDown={e => e.key === "Enter" && saveSlug()} autoFocus
              />
              <Button size="sm" onClick={saveSlug}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setParseError(false); }}>Cancel</Button>
            </div>
            {parseError && <p className="text-xs text-destructive">Couldn't parse this as a Sentry URL. Paste the full URL from your browser.</p>}
          </div>
        ) : parsed ? (
          <div className="flex items-center gap-3 flex-wrap">
            <div><span className="text-xs text-muted-foreground block mb-0.5">Org slug</span><code className="text-sm bg-muted px-2 py-1 rounded font-mono text-primary">{parsed.slug}</code></div>
            <div><span className="text-xs text-muted-foreground block mb-0.5">Base URL</span><code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">{parsed.base}</code></div>
            <a href={`${parsed.base}/organizations/${parsed.slug}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-4">Open Sentry <ExternalLink className="w-3 h-3" /></a>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-sm text-amber-400"><AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>Paste your Sentry dashboard URL to generate direct project links.</span></div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {PROJECTS.map(proj => {
          const Icon = proj.icon;
          const featureIcons: Record<string, React.ReactNode> = { Issues: <AlertTriangle className="w-3.5 h-3.5" />, Performance: <Zap className="w-3.5 h-3.5" />, Replays: <Eye className="w-3.5 h-3.5" />, Alerts: <RefreshCw className="w-3.5 h-3.5" /> };
          return (
            <div key={proj.key} className="rounded-xl border bg-card overflow-hidden">
              <div className="p-5 border-b">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: proj.color + "18", border: `1px solid ${proj.color}30` }}>
                    <Icon className="w-4 h-4" style={{ color: proj.color }} />
                  </div>
                  <div><div className="font-semibold text-sm">{proj.label}</div><div className="text-xs text-muted-foreground">{proj.description}</div></div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">{proj.slug}</code>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground font-mono">#{proj.id.slice(-6)}</span>
                </div>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {proj.features.map(feature => {
                  const url = parsed ? buildLink(parsed, proj.id, feature) : null;
                  return url ? (
                    <a key={feature} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors group">
                      <span className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">{featureIcons[feature]}{feature}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground" />
                    </a>
                  ) : (
                    <div key={feature} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground/40 cursor-default">{featureIcons[feature]}{feature}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4"><BarChart2 className="w-4 h-4 text-muted-foreground" /><h2 className="font-semibold text-sm">What Sentry Captures</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Web", color: "#E08040", items: ["Unhandled JS exceptions","Browser performance traces (10% sample)","Session replays on errors (100%)","Session replays at random (5%)","React component errors"] },
            { label: "Mobile", color: "#60A5FA", items: ["Unhandled JS exceptions","JS performance traces (10% sample)","Platform: iOS / Web","Production-only (dev suppressed)"] },
            { label: "API", color: "#34D399", items: ["Unhandled Express errors","HTTP request tracing (10% sample)","Node.js runtime exceptions","Express route error handler"] },
          ].map(col => (
            <div key={col.label}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: col.color }}>{col.label}</div>
              <ul className="space-y-1.5">
                {col.items.map(item => <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground"><span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: col.color }} />{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400/80 flex items-start gap-2">
        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>Sentry is <strong>production-only</strong> — events are suppressed in development and Expo Go. Errors from <code className="bg-amber-500/10 px-1 rounded">resilium-platform.com</code> appear in Sentry after the first production error is captured.</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI UX TESTER TAB
// ═══════════════════════════════════════════════════════════════════════════════

interface PersonaMeta { key: string; name: string; description: string }
interface RunSummary { runId: string; startedAt: string; completedAt: string | null; personaCount: number; status: string }
interface PersonaProgress { personaKey: string; personaName: string; status: "pending" | "running" | "completed" | "failed"; aiQualityRating?: number; error?: string }

async function fetchPersonas(): Promise<{ personas: PersonaMeta[] }> {
  const res = await fetch("/api/admin/ux-test/personas", { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch personas (${res.status})`);
  return res.json();
}
async function fetchRuns(): Promise<{ runs: RunSummary[] }> {
  const res = await fetch("/api/admin/ux-test/runs", { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch runs (${res.status})`);
  return res.json();
}
async function deleteRun(runId: string): Promise<void> {
  const res = await fetch(`/api/admin/ux-test/runs/${runId}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) throw new Error("Failed to delete run");
}
async function cancelRun(runId: string): Promise<void> {
  const res = await fetch(`/api/admin/ux-test/runs/${runId}/cancel`, { method: "POST", credentials: "include" });
  if (!res.ok) throw new Error("Failed to cancel run");
}

function getRatingColor(rating: number) { return rating >= 4 ? "text-emerald-500" : rating >= 3 ? "text-amber-500" : "text-destructive"; }
function getRatingLabel(rating: number) { return rating >= 5 ? "Excellent" : rating >= 4 ? "Good" : rating >= 3 ? "Adequate" : rating >= 2 ? "Poor" : "Very Poor"; }

function UxTesterTab() {
  const queryClient = useQueryClient();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [personaProgress, setPersonaProgress] = useState<Map<string, PersonaProgress>>(new Map());
  const [runComplete, setRunComplete] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: personasData, isLoading: personasLoading, error: personasError, refetch: refetchPersonas } = useQuery({ queryKey: ["ux-personas"], queryFn: fetchPersonas, retry: 1 });
  const { data: runsData, isLoading: runsLoading, error: runsError, refetch: refetchRuns } = useQuery({ queryKey: ["ux-runs"], queryFn: fetchRuns, retry: 1 });
  const deleteMutation = useMutation({ mutationFn: deleteRun, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ux-runs"] }) });
  const cancelMutation = useMutation({ mutationFn: cancelRun, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ux-runs"] }) });

  const personas = personasData?.personas ?? [];
  const runs = runsData?.runs ?? [];

  useEffect(() => {
    if (personas.length > 0 && selectedKeys.size === 0) setSelectedKeys(new Set(personas.map(p => p.key)));
  }, [personas, selectedKeys.size]);

  useEffect(() => { return () => { eventSourceRef.current?.close(); if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); }; }, []);

  async function pollRunStatus(runId: string) {
    try {
      const res = await fetch(`/api/admin/ux-test/runs/${runId}`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json() as { status: string; results: { personaKey: string; personaName: string; status: string; aiQualityRating?: number; error?: string }[] };
      setPersonaProgress(prev => {
        const next = new Map(prev);
        for (const r of data.results) {
          const existing = next.get(r.personaKey) ?? { personaKey: r.personaKey, personaName: r.personaName, status: "pending" as const };
          next.set(r.personaKey, { ...existing, status: r.status as PersonaProgress["status"], aiQualityRating: r.aiQualityRating, error: r.error });
        }
        return next;
      });
      if (data.status === "completed" || data.status === "failed") {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setIsRunning(false); setRunComplete(true);
        if (data.status === "failed") setRunError("The test run encountered an error.");
        refetchRuns();
      }
    } catch {}
  }

  function togglePersona(key: string) {
    setSelectedKeys(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  }
  function toggleAll() {
    setSelectedKeys(selectedKeys.size === personas.length ? new Set() : new Set(personas.map(p => p.key)));
  }

  async function startRun() {
    if (selectedKeys.size === 0) return;
    setIsRunning(true); setRunComplete(false); setRunError(null);
    const initialProgress = new Map<string, PersonaProgress>();
    for (const key of selectedKeys) {
      const persona = personas.find(p => p.key === key);
      if (persona) initialProgress.set(key, { personaKey: key, personaName: persona.name, status: "pending" });
    }
    setPersonaProgress(initialProgress);
    try {
      const res = await fetch("/api/admin/ux-test/run", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ personaKeys: Array.from(selectedKeys) }) });
      if (!res.ok) { const body = await res.json().catch(() => ({})) as { error?: string }; throw new Error(body.error ?? `Request failed (${res.status})`); }
      const { runId } = await res.json() as { runId: string };
      setActiveRunId(runId);
      const es = new EventSource(`/api/admin/ux-test/runs/${runId}/stream`);
      eventSourceRef.current = es;
      es.onmessage = (e: MessageEvent) => {
        const data = JSON.parse(e.data as string) as { type: string; personaKey?: string; personaName?: string; aiQualityRating?: number; error?: string };
        if (data.type === "persona_started" && data.personaKey) {
          setPersonaProgress(prev => { const next = new Map(prev); const ex = next.get(data.personaKey!) ?? { personaKey: data.personaKey!, personaName: data.personaName ?? "", status: "pending" as const }; next.set(data.personaKey!, { ...ex, status: "running" }); return next; });
        } else if (data.type === "persona_completed" && data.personaKey) {
          setPersonaProgress(prev => { const next = new Map(prev); const ex = next.get(data.personaKey!) ?? { personaKey: data.personaKey!, personaName: data.personaName ?? "", status: "pending" as const }; next.set(data.personaKey!, { ...ex, status: "completed", aiQualityRating: data.aiQualityRating }); return next; });
        } else if (data.type === "persona_failed" && data.personaKey) {
          setPersonaProgress(prev => { const next = new Map(prev); const ex = next.get(data.personaKey!) ?? { personaKey: data.personaKey!, personaName: data.personaName ?? "", status: "pending" as const }; next.set(data.personaKey!, { ...ex, status: "failed", error: data.error }); return next; });
        } else if (data.type === "run_completed") { es.close(); setIsRunning(false); setRunComplete(true); refetchRuns(); }
        else if (data.type === "run_failed") { es.close(); setIsRunning(false); setRunComplete(true); setRunError(data.error ?? "The test run encountered an error."); refetchRuns(); }
      };
      es.onerror = () => { es.close(); if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); pollIntervalRef.current = setInterval(() => pollRunStatus(runId), 5000); pollRunStatus(runId); };
    } catch (err) { setIsRunning(false); setRunError(err instanceof Error ? err.message : "Failed to start the test run."); }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground">AI UX Tester</h2>
        <p className="text-muted-foreground text-sm mt-1">Autonomous AI persona simulation — evaluates report quality across diverse user profiles</p>
      </div>

      {!isRunning && !runComplete && (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h3 className="text-base font-semibold text-foreground">Select Personas</h3><p className="text-sm text-muted-foreground">Choose which user personas to simulate in this test run</p></div>
              {personas.length > 0 && <Button variant="outline" size="sm" onClick={toggleAll}>{selectedKeys.size === personas.length ? "Deselect All" : "Select All"}</Button>}
            </div>
            {personasLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading personas...</span></div>
            ) : personasError ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <p className="text-sm font-medium">{personasError instanceof Error ? personasError.message : "An error occurred"}</p>
                <Button variant="outline" size="sm" onClick={() => refetchPersonas()} className="gap-2"><RefreshCw className="w-3.5 h-3.5" />Retry</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personas.map(persona => (
                  <Card key={persona.key} className={`cursor-pointer transition-all border ${selectedKeys.has(persona.key) ? "border-primary/50 bg-primary/5" : "border-border/60 bg-card"}`} onClick={() => togglePersona(persona.key)}>
                    <CardContent className="p-4 flex gap-3 items-start">
                      <Checkbox checked={selectedKeys.has(persona.key)} onCheckedChange={() => togglePersona(persona.key)} className="mt-0.5" />
                      <div className="flex-1 min-w-0"><p className="font-medium text-sm text-foreground">{persona.name}</p><p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{persona.description}</p></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          {runError && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1"><p className="text-sm font-medium text-destructive">Run failed</p><p className="text-xs text-destructive/80 mt-0.5">{runError}</p></div>
              <Button variant="ghost" size="sm" className="shrink-0 h-7 px-2 text-xs" onClick={() => setRunError(null)}>Dismiss</Button>
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">{selectedKeys.size} of {personas.length} personas selected</p>
            <Button onClick={startRun} disabled={selectedKeys.size === 0 || personasLoading || !!personasError} className="gap-2"><Play className="w-4 h-4" />Run UX Test</Button>
          </div>
        </>
      )}

      {(isRunning || (runComplete && activeRunId)) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">{isRunning ? "Test in Progress" : runError ? "Test Failed" : "Test Complete"}</h3>
              <p className="text-sm text-muted-foreground">{isRunning ? "Simulating personas — this may take several minutes..." : runError ? runError : "All personas evaluated successfully"}</p>
            </div>
            {isRunning && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            {runComplete && !runError && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {runComplete && runError && <XCircle className="w-5 h-5 text-destructive" />}
          </div>
          <div className="space-y-2">
            {Array.from(personaProgress.values()).map(pp => (
              <div key={pp.personaKey} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                <div className="flex items-center gap-3">
                  {pp.status === "pending" && <Clock className="w-4 h-4 text-muted-foreground" />}
                  {pp.status === "running" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {pp.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {pp.status === "failed" && <XCircle className="w-4 h-4 text-destructive" />}
                  <div><p className="text-sm font-medium text-foreground">{pp.personaName}</p>{pp.status === "failed" && pp.error && <p className="text-xs text-destructive mt-0.5">{pp.error}</p>}</div>
                </div>
                <div className="flex items-center gap-2">
                  {pp.status === "completed" && pp.aiQualityRating != null && <Badge variant="outline" className={`text-xs ${getRatingColor(pp.aiQualityRating)}`}>{pp.aiQualityRating}/5 — {getRatingLabel(pp.aiQualityRating)}</Badge>}
                  {pp.status === "pending" && <Badge variant="secondary" className="text-xs">Queued</Badge>}
                  {pp.status === "running" && <Badge variant="secondary" className="text-xs">Running</Badge>}
                  {pp.status === "failed" && <Badge variant="destructive" className="text-xs">Failed</Badge>}
                </div>
              </div>
            ))}
          </div>
          {runComplete && (
            <div className="flex gap-3 pt-2">
              {activeRunId && !runError && <Link href={`/admin/ux-test/report/${activeRunId}`}><Button className="gap-2">View Report <ChevronRight className="w-4 h-4" /></Button></Link>}
              <Button variant="outline" onClick={() => { setRunComplete(false); setActiveRunId(null); setPersonaProgress(new Map()); setRunError(null); }}>Run Another Test</Button>
            </div>
          )}
        </div>
      )}

      <Separator />

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Previous Test Runs</h3>
        {runsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4 justify-center"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading runs...</span></div>
        ) : runsError ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-sm text-muted-foreground">{runsError instanceof Error ? runsError.message : "Failed to load previous runs"}</p>
            <Button variant="outline" size="sm" onClick={() => refetchRuns()} className="gap-2"><RefreshCw className="w-3.5 h-3.5" />Retry</Button>
          </div>
        ) : runs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No test runs yet — run your first UX test above</p>
        ) : (
          <div className="space-y-2">
            {runs.map(run => (
              <div key={run.runId} className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-card">
                <Link href={`/admin/ux-test/report/${run.runId}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    {run.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {run.status === "running" && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
                    {run.status === "failed" && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{new Date(run.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-xs text-muted-foreground">{run.personaCount} persona{run.personaCount !== 1 ? "s" : ""}{run.completedAt && ` · ${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 60000)} min`}</p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge variant={run.status === "completed" ? "outline" : run.status === "failed" ? "destructive" : "secondary"} className="text-xs capitalize">{run.status}</Badge>
                  {run.status === "running" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Cancel run"><Ban className="w-3.5 h-3.5" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Cancel test run?</AlertDialogTitle><AlertDialogDescription>This will mark the run as failed. In-progress persona simulations will be stopped.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Keep Running</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => cancelMutation.mutate(run.runId)}>Cancel Run</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Delete run"><Trash2 className="w-3.5 h-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete this test run?</AlertDialogTitle><AlertDialogDescription>This permanently deletes the run and all its results. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteMutation.mutate(run.runId)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "monitoring", label: "Health & Sentry", icon: ShieldCheck },
  { key: "ux-testing", label: "AI UX Tester", icon: FlaskConical },
];

export default function MonitoringPage() {
  const [tab, setTab] = useState<TabKey>("monitoring");

  return (
    <AdminLayout activeSection="monitoring">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Testing & Monitoring</h1>
              <p className="text-sm text-muted-foreground">Health checks, Sentry error tracking, and AI UX testing in one place</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border mb-8">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "monitoring" && <MonitoringTab />}
        {tab === "ux-testing" && <UxTesterTab />}
      </div>
    </AdminLayout>
  );
}
