import React, { useState, useEffect } from "react";
import { AdminLayout } from "./layout";
import { AlertTriangle, Activity, Globe, Smartphone, Server, ExternalLink, Settings, BarChart2, RefreshCw, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

type SentryUrlStyle = "subdomain" | "path" | "unknown";

interface ParsedSentry {
  slug: string;
  base: string;
  style: SentryUrlStyle;
}

function parseSentryInput(raw: string): ParsedSentry | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Case 1: full URL containing .sentry.io
  // e.g. https://resilium.sentry.io  OR  https://resilium.de.sentry.io
  // e.g. https://de.sentry.io/organizations/resilium
  if (trimmed.includes("sentry.io")) {
    try {
      // Ensure it has a protocol for URL parsing
      const withProto = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      const url = new URL(withProto);
      const hostname = url.hostname; // e.g. resilium.sentry.io or de.sentry.io

      // subdomain format: slug.sentry.io or slug.de.sentry.io
      const subdomainMatch = hostname.match(/^([^.]+)\.(?:de\.)?sentry\.io$/);
      if (subdomainMatch && subdomainMatch[1] !== "de" && subdomainMatch[1] !== "us") {
        const slug = subdomainMatch[1];
        const base = `https://${hostname}`;
        return { slug, base, style: "subdomain" };
      }

      // path format: sentry.io/organizations/slug or de.sentry.io/organizations/slug
      const pathMatch = url.pathname.match(/^\/organizations\/([^/]+)/);
      if (pathMatch) {
        const slug = pathMatch[1];
        const base = `${url.protocol}//${url.hostname}`;
        return { slug, base, style: "path" };
      }
    } catch {
      // fall through to slug-only
    }
  }

  // Case 2: plain slug (no dots, no protocol)
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
  const tail = featurePaths[feature] ?? "/";

  if (parsed.style === "subdomain") {
    return `${parsed.base}/organizations/${parsed.slug}${tail}`;
  }
  return `${parsed.base}/organizations/${parsed.slug}${tail}`;
}

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
    description: "Expo React Native · iOS",
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


export default function MonitoringPage() {
  const [orgInput, setOrgInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sentry_org_input") ?? "";
    setOrgInput(saved);
    setDraft(saved);
  }, []);

  const parsed = parseSentryInput(orgInput);

  function saveSlug() {
    const trimmed = draft.trim();
    const result = parseSentryInput(trimmed);
    if (!result && trimmed.length > 0) {
      setParseError(true);
      return;
    }
    setParseError(false);
    localStorage.setItem("sentry_org_input", trimmed);
    setOrgInput(trimmed);
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

        {/* Sentry URL setup */}
        <div className="mb-8 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Sentry Organization URL</span>
            </div>
            {!editing && (
              <Button variant="ghost" size="sm" onClick={() => { setDraft(orgInput); setEditing(true); setParseError(false); }}>
                Edit
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  className={`flex-1 px-3 py-2 rounded-md border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary ${parseError ? "border-destructive" : ""}`}
                  placeholder="https://your-org.sentry.io  or  your-org-slug"
                  value={draft}
                  onChange={(e) => { setDraft(e.target.value); setParseError(false); }}
                  onKeyDown={(e) => e.key === "Enter" && saveSlug()}
                  autoFocus
                />
                <Button size="sm" onClick={saveSlug}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setParseError(false); }}>Cancel</Button>
              </div>
              {parseError && (
                <p className="text-xs text-destructive">Couldn't parse this as a Sentry URL. Try pasting the full URL from your browser address bar when on Sentry.</p>
              )}
              <p className="text-xs text-muted-foreground">
                Paste your Sentry URL directly from the browser — for example <code className="bg-muted px-1 rounded">https://your-org.sentry.io</code> — or just type your org slug.
              </p>
            </div>
          ) : parsed ? (
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Org slug</span>
                <code className="text-sm bg-muted px-2 py-1 rounded font-mono text-primary">{parsed.slug}</code>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Base URL</span>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">{parsed.base}</code>
              </div>
              <a
                href={`${parsed.base}/organizations/${parsed.slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-4"
              >
                Open Sentry <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Paste your Sentry dashboard URL to generate direct project links. Copy it straight from the browser address bar when you're logged in to Sentry.</span>
            </div>
          )}
        </div>

        {/* Project cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {PROJECTS.map((proj) => {
            const Icon = proj.icon;
            const featureIcons: Record<string, React.ReactNode> = {
              Issues: <AlertTriangle className="w-3.5 h-3.5" />,
              Performance: <Zap className="w-3.5 h-3.5" />,
              Replays: <Eye className="w-3.5 h-3.5" />,
              Alerts: <RefreshCw className="w-3.5 h-3.5" />,
            };
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
                    const url = parsed ? buildLink(parsed, proj.id, feature) : null;
                    return url ? (
                      <a
                        key={feature}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors group"
                      >
                        <span className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                          {featureIcons[feature]}
                          {feature}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground" />
                      </a>
                    ) : (
                      <div
                        key={feature}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground/40 cursor-default"
                      >
                        {featureIcons[feature]}
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
                  "Platform: iOS / Web",
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
