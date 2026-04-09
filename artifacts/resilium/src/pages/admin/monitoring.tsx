import React, { useState, useEffect } from "react";
import { AdminLayout } from "./layout";
import { AlertTriangle, Activity, Globe, Smartphone, Server, ExternalLink, Settings, BarChart2, RefreshCw, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const SENTRY_BASE = "https://de.sentry.io";

const PROJECTS = [
  {
    key: "web",
    label: "Web App",
    slug: "resilium-web",
    id: "4511187286818896",
    icon: Globe,
    color: "#E08040",
    description: "React + Vite · resilium-platform.com",
    features: ["Issues", "Performance", "Replays", "Alerts"],
  },
  {
    key: "mobile",
    label: "Mobile App",
    slug: "resilium-mobile",
    id: "4511187296256080",
    icon: Smartphone,
    color: "#60A5FA",
    description: "Expo React Native · iOS & Android",
    features: ["Issues", "Performance", "Alerts"],
  },
  {
    key: "api",
    label: "API Server",
    slug: "resilium-api",
    id: "4511187305431120",
    icon: Server,
    color: "#34D399",
    description: "Express · Node.js · PostgreSQL",
    features: ["Issues", "Performance", "Alerts"],
  },
];

const FEATURE_LINKS: Record<string, (org: string, proj: { slug: string; id: string }) => string> = {
  Issues: (org, p) => `${SENTRY_BASE}/organizations/${org}/issues/?project=${p.id}`,
  Performance: (org, p) => `${SENTRY_BASE}/organizations/${org}/performance/?project=${p.id}`,
  Replays: (org, p) => `${SENTRY_BASE}/organizations/${org}/replays/?project=${p.id}`,
  Alerts: (org, p) => `${SENTRY_BASE}/organizations/${org}/alerts/?project=${p.id}`,
};

export default function MonitoringPage() {
  const [orgSlug, setOrgSlug] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("sentry_org_slug") ?? "";
    setOrgSlug(saved);
    setDraft(saved);
  }, []);

  function saveSlug() {
    const trimmed = draft.trim();
    localStorage.setItem("sentry_org_slug", trimmed);
    setOrgSlug(trimmed);
    setEditing(false);
  }

  return (
    <AdminLayout activeSection="monitoring">
      <div className="p-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sentry Monitoring</h1>
              <p className="text-sm text-muted-foreground">Error tracking and performance across all three platforms</p>
            </div>
          </div>
        </div>

        {/* Org slug setup */}
        <div className="mb-8 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Sentry Organization Slug</span>
            </div>
            {!editing && (
              <Button variant="ghost" size="sm" onClick={() => { setDraft(orgSlug); setEditing(true); }}>
                Edit
              </Button>
            )}
          </div>

          {editing ? (
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-md border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. my-org"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveSlug()}
                autoFocus
              />
              <Button size="sm" onClick={saveSlug}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          ) : orgSlug ? (
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded font-mono text-primary">{orgSlug}</code>
              <a
                href={`${SENTRY_BASE}/organizations/${orgSlug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Open Sentry <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Enter your Sentry organization slug to generate direct project links. Find it in your Sentry URL: <code className="bg-muted px-1 rounded">sentry.io/organizations/<strong>your-slug</strong>/</code></span>
            </div>
          )}
        </div>

        {/* Project cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {PROJECTS.map((proj) => {
            const Icon = proj.icon;
            return (
              <div key={proj.key} className="rounded-xl border bg-card overflow-hidden">
                <div className="p-5 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: proj.color + "18", border: `1px solid ${proj.color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: proj.color }} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{proj.label}</div>
                      <div className="text-xs text-muted-foreground">{proj.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">{proj.slug}</code>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground font-mono">#{proj.id.slice(-6)}</span>
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-1">
                  {proj.features.map((feature) => {
                    const url = orgSlug ? FEATURE_LINKS[feature]?.(orgSlug, proj) : null;
                    const icons: Record<string, React.ReactNode> = {
                      Issues: <AlertTriangle className="w-3.5 h-3.5" />,
                      Performance: <Zap className="w-3.5 h-3.5" />,
                      Replays: <Eye className="w-3.5 h-3.5" />,
                      Alerts: <RefreshCw className="w-3.5 h-3.5" />,
                    };
                    return url ? (
                      <a
                        key={feature}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors group"
                      >
                        <span className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                          {icons[feature]}
                          {feature}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground" />
                      </a>
                    ) : (
                      <div
                        key={feature}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground/40 cursor-default"
                      >
                        {icons[feature]}
                        {feature}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* What's captured */}
        <div className="rounded-xl border bg-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">What Sentry Captures</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Web",
                color: "#E08040",
                items: [
                  "Unhandled JS exceptions",
                  "Browser performance traces (10% sample)",
                  "Session replays on errors (100%)",
                  "Session replays at random (5%)",
                  "React component errors",
                ],
              },
              {
                label: "Mobile",
                color: "#60A5FA",
                items: [
                  "Unhandled JS exceptions",
                  "JS performance traces (10% sample)",
                  "Platform: iOS / Android / Web",
                  "Production-only (dev suppressed)",
                ],
              },
              {
                label: "API",
                color: "#34D399",
                items: [
                  "Unhandled Express errors",
                  "HTTP request tracing (10% sample)",
                  "Node.js runtime exceptions",
                  "Express route error handler",
                ],
              },
            ].map((col) => (
              <div key={col.label}>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: col.color }}
                >
                  {col.label}
                </div>
                <ul className="space-y-1.5">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: col.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400/80 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Sentry is <strong>production-only</strong> — events are suppressed in development and Expo Go. Errors from{" "}
            <code className="bg-amber-500/10 px-1 rounded">resilium-platform.com</code> will appear in the Sentry dashboard after the first production error is captured.
          </span>
        </div>
      </div>
    </AdminLayout>
  );
}
