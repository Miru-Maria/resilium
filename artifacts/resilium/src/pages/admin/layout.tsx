import React, { useEffect, useState, Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResilientIcon } from "@/components/resilient-icon";
import {
  Loader2, LayoutDashboard, Smartphone, Shield, LogOut,
  FlaskConical, Users, Megaphone, KeyRound, Activity, FolderLock,
  Star, BarChart2, FileText, LayoutTemplate, Radar, Rocket,
  BookOpen, Code2, Layers, Palette, ChevronDown, Newspaper,
} from "lucide-react";

// ── Admin Error Boundary ─────────────────────────────────────────────────────
interface AdminErrorBoundaryState { error: Error | null }

class AdminErrorBoundary extends Component<{ children: ReactNode }, AdminErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AdminErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-2xl font-bold">!</span>
          </div>
          <h2 className="font-display font-bold text-xl text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            {this.state.error.message ?? "An unexpected error occurred in this section."}
          </p>
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection?: "dashboard" | "testimonials" | "mobile" | "gdpr" | "consent" | "ux-testing" | "users" | "announcements" | "marketing" | "security" | "monitoring" | "documents" | "analytics" | "blog" | "post-launch";
}

/** @deprecated Token is now stored in an httpOnly cookie — no longer readable from JS. */
export function getAdminToken(): string | null {
  return null;
}

/** Returns empty headers — admin session is carried via httpOnly cookie automatically. */
export function adminAuthHeaders(): Record<string, string> {
  return {};
}

const DOC_ITEMS = [
  { key: "gtm-plan",              label: "GTM Plan",              icon: Rocket },
  { key: "platform-assessment",   label: "Platform Assessment",   icon: LayoutTemplate },
  { key: "competitive-analysis",  label: "Competitive Analysis",  icon: BarChart2 },
  { key: "competitor-monitoring", label: "Competitor Monitoring", icon: Radar },
  { key: "marketing-strategy",    label: "Marketing Strategy",    icon: FileText },
  { key: "whitepaper",            label: "White Paper",           icon: BookOpen },
  { key: "technical-spec",        label: "Technical Spec",        icon: Code2 },
  { key: "pitch-deck",            label: "Pitch Deck",            icon: Layers },
  { key: "brand-identity",        label: "Brand Identity",        icon: Palette },
  { key: "content-strategy",      label: "Content Strategy",      icon: Megaphone },
];

// ── Session cache ─────────────────────────────────────────────────────────────
// Persists across admin page navigations for 5 minutes so we only hit
// /api/admin/session once per session window instead of on every mount.
const SESSION_TTL_MS = 5 * 60 * 1000;
const _sessionCache = { authed: false, expiresAt: 0 };

function invalidateSessionCache() {
  _sessionCache.authed = false;
  _sessionCache.expiresAt = 0;
}

export function AdminLayout({ children, activeSection }: AdminLayoutProps) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [checking, setChecking] = useState(() => _sessionCache.expiresAt <= Date.now());
  const [authed, setAuthed] = useState(() => _sessionCache.expiresAt > Date.now() && _sessionCache.authed);
  const [docsOpen, setDocsOpen] = useState(true);

  const activeDoc = new URLSearchParams(search).get("doc") ?? "marketing-strategy";

  useEffect(() => {
    // Skip the network round-trip if the cache is still warm.
    if (_sessionCache.expiresAt > Date.now()) {
      if (_sessionCache.authed) {
        setAuthed(true);
        setChecking(false);
      } else {
        navigate("/admin/login");
      }
      return;
    }

    fetch("/api/admin/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        _sessionCache.authed = !!data.authenticated;
        _sessionCache.expiresAt = Date.now() + SESSION_TTL_MS;
        if (data.authenticated) {
          setAuthed(true);
        } else {
          navigate("/admin/login");
        }
      })
      .catch(() => {
        invalidateSessionCache();
        navigate("/admin/login");
      })
      .finally(() => setChecking(false));
  }, []);

  async function handleLogout() {
    invalidateSessionCache();
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    navigate("/admin/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authed) return null;

  const navItems = [
    { href: "/admin/dashboard",    label: "Dashboard",    icon: LayoutDashboard, key: "dashboard" },
    { href: "/admin/users",        label: "Users",        icon: Users,           key: "users" },
    { href: "/admin/analytics",    label: "Analytics",    icon: BarChart2,       key: "analytics" },
    { href: "/admin/announcements",label: "Announcements",icon: Megaphone,       key: "announcements" },
    { href: "/admin/testimonials", label: "Testimonials", icon: Star,            key: "testimonials" },
    { href: "/admin/mobile",       label: "Mobile",       icon: Smartphone,      key: "mobile" },
    { href: "/admin/gdpr",         label: "GDPR",         icon: Shield,          key: "gdpr" },
    { href: "/admin/consent-log",  label: "Consent Log",  icon: Shield,          key: "consent" },
    { href: "/admin/ux-testing",   label: "AI UX Tester", icon: FlaskConical,    key: "ux-testing" },
    { href: "/admin/security",     label: "Security",     icon: KeyRound,        key: "security" },
    { href: "/admin/monitoring",   label: "Sentry",       icon: Activity,        key: "monitoring" },
    { href: "/admin/blog",         label: "Blog Posts",   icon: Newspaper,       key: "blog" },
    { href: "/admin/post-launch",  label: "Post-Launch",  icon: Rocket,          key: "post-launch" },
  ];

  const isDocuments = activeSection === "documents";

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-56 min-h-screen bg-background border-r flex flex-col">
        <div className="p-4 border-b flex items-center gap-2 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
          <ResilientIcon className="w-7 h-7" />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm tracking-tight">Resilium</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.key} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors",
                  activeSection === item.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </span>
            </Link>
          ))}

          {/* Documents with inline submenu */}
          <div>
            <span
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors",
                isDocuments
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              onClick={() => {
                if (!isDocuments) navigate("/admin/documents");
                setDocsOpen(o => !o);
              }}
            >
              <FolderLock className="w-4 h-4" />
              <span className="flex-1">Documents</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", docsOpen && "rotate-180")} />
            </span>

            {docsOpen && (
              <div className="mt-1 ml-3 pl-3 border-l border-gray-200 space-y-0.5">
                {DOC_ITEMS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => navigate(`/admin/documents?doc=${key}`)}
                    className={cn(
                      "flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors",
                      activeDoc === key
                        ? "text-primary font-semibold bg-primary/8"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <AdminErrorBoundary>{children}</AdminErrorBoundary>
      </main>
    </div>
  );
}
