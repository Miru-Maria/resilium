import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AdminLayout } from "./layout";
import {
  Loader2, Send, Mail, TrendingUp,
  CheckCircle, XCircle, Clock, Sparkles, Megaphone,
  Plus, Search, Trash2, ExternalLink, Target, Key,
  AlertCircle, Building2, User, Pencil,
  Rocket, CheckSquare, Square, ChevronDown, ChevronRight,
  CheckCircle2, Activity, Users, MessageSquare,
  BarChart2, Calendar, AlertTriangle, Smartphone, RefreshCw, GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SECTION_BG = "#131929";
const CARD_BG = "#1a2235";
const BORDER = "#2a3245";
const TEXT = "#EAD9BE";
const MUTED = "#b8a99a";
const AMBER = "#E08040";
const DIM = "#8A7A6A";

const PILLAR_OPTIONS = [
  { value: "financial", label: "Financial Resilience" },
  { value: "skills", label: "Skills & Career" },
  { value: "mobility", label: "Mobility & Relocation" },
  { value: "resources", label: "Emergency Resources" },
  { value: "psychological", label: "Mental Resilience" },
  { value: "health", label: "Health Resilience" },
  { value: "social-capital", label: "Social Capital" },
];

const SEGMENT_LABELS: Record<string, string> = {
  all: "All users",
  pro: "Pro subscribers",
  free: "Free users (not Pro)",
  free_assessed_14d: "Free users who assessed 14+ days ago (no upgrade)",
};

const FREE_DOMAINS = new Set([
  "gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com","proton.me",
  "protonmail.com","me.com","aol.com","live.com","msn.com","ymail.com",
  "mail.com","gmx.com","zoho.com","pm.me","fastmail.com","hey.com",
  "inbox.com","tutanota.com","rocketmail.com","att.net","verizon.net",
]);

const DEFAULT_SUBJECT = "One question from the founder of Resilium";
const DEFAULT_BODY = `Hi [Name],

You signed up for Resilium yesterday — thank you for being there on day one.

I'm Miruna, the person who built it. I wanted to reach out personally while everything is still fresh.

One question: What made you sign up?

You don't have to answer. But if something about the idea resonated — or if you had a concern — I read every reply. It genuinely helps me understand what I'm building for.

If you haven't taken the assessment yet, it takes about 10 minutes. You'll get a real, prioritized action plan — not a quiz result, but a ranked set of actions based on exactly where your gaps are.

→ https://resilium-platform.com

Thank you for being here.

— Miruna
Resilium`;

const QUICK_LINKS = [
  { label: "Clerk Users", href: "https://dashboard.clerk.com", icon: Users },
  { label: "Sentry", href: "https://sentry.io/organizations/", icon: Activity },
  { label: "Stripe", href: "https://dashboard.stripe.com", icon: TrendingUp },
  { label: "Umami", href: "https://cloud.umami.is", icon: BarChart2 },
  { label: "Product Hunt", href: "https://www.producthunt.com/posts/resilium", icon: Rocket },
  { label: "Resend", href: "https://resend.com/emails", icon: Mail },
];

const CATEGORY_KEY = "resilium_postlaunch_collapsed_v1";
const SRL_CATEGORY_KEY = "resilium_srl_collapsed_v1";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DripStats = {
  total: number; sent: number; cancelled: number; pending: number;
  byType: { emailType: string; sent: number }[];
  recentSent: { id: number; userId: string; emailType: string; scoreOverall: number; sentAt: string | null; scheduledFor: string }[];
};

type ReferralStats = {
  totalCodes: number; totalReferrals: number; converted: number; conversionRate: number;
  recentReferrals: { id: number; code: string; referrerId: string; referredId: string; convertedAt: string | null; createdAt: string }[];
};

type Campaign = {
  id: number; name: string; subject: string; body: string; segment: string;
  status: string; sentCount: number; failedCount: number; sentAt: string | null; createdAt: string;
};

type BlogKeyword = {
  id: number; keyword: string; pillar: string; pillarLabel: string; priority: number;
  usedAt: string | null; createdAt: string;
};

type Opportunity = {
  id: number; source: string; url: string; title: string; body: string | null;
  subreddit: string | null; upvotes: number | null; commentCount: number | null;
  draftReply: string | null; relevanceScore: number | null;
  emailedAt: string | null; createdAt: string;
};

type Recipient = { name: string | null; email: string; domain: string; isBusinessDomain: boolean };
type SendResult = { email: string; status: "sent" | "failed"; error?: string };

// ─── Helper functions ───────────────────────────────────────────────────────────

function parseRecipients(raw: string): Recipient[] {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const out: Recipient[] = [];
  for (const line of lines) {
    let name: string | null = null;
    let email = "";
    const angleBracket = line.match(/^(.+?)\s*<([^>]+)>/);
    if (angleBracket) {
      name = angleBracket[1].trim() || null;
      email = angleBracket[2].trim().toLowerCase();
    } else if (line.includes(",")) {
      const parts = line.split(",").map(p => p.trim());
      const emailPart = parts.find(p => p.includes("@"));
      const namePart = parts.find(p => !p.includes("@"));
      email = emailPart?.toLowerCase() ?? "";
      name = namePart ?? null;
    } else if (line.includes("@")) {
      email = line.toLowerCase();
    }
    if (!email || !email.includes("@")) continue;
    if (out.some(r => r.email === email)) continue;
    const domain = email.split("@")[1] ?? "";
    const isBusinessDomain = !!domain && !FREE_DOMAINS.has(domain);
    if (name) name = name.replace(/['"]/g, "").trim() || null;
    if (name && name.includes(" ")) name = name.split(" ")[0];
    out.push({ name, email, domain, isBusinessDomain });
  }
  return out;
}

// ─── Small UI components ────────────────────────────────────────────────────────

function StatPill({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", minWidth: 100 }}>
      <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ color: color ?? TEXT, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    draft: { color: "#6b7280", icon: <Clock size={12} /> },
    sending: { color: "#f59e0b", icon: <Loader2 size={12} className="animate-spin" /> },
    sent: { color: "#22c55e", icon: <CheckCircle size={12} /> },
    failed: { color: "#ef4444", icon: <XCircle size={12} /> },
  };
  const s = map[status] ?? { color: "#6b7280", icon: null };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: s.color, fontSize: 12, fontWeight: 600 }}>
      {s.icon} {status}
    </span>
  );
}

function CollapsibleCategory({
  icon: Icon, id, label, badge, children, storageKey = CATEGORY_KEY,
}: {
  icon?: React.ElementType; id: string; label: string; badge?: string; children: React.ReactNode; storageKey?: string;
}) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      return !!stored[id];
    } catch { return false; }
  });
  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        const stored = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
        stored[id] = next;
        localStorage.setItem(storageKey, JSON.stringify(stored));
      } catch {}
      return next;
    });
  };
  return (
    <div>
      <button onClick={toggle} className="flex items-center gap-2 mt-8 mb-3 w-full text-left group">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
        <span className="text-xs font-bold uppercase tracking-widest text-primary">{label}</span>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 whitespace-nowrap">
            {badge}
          </span>
        )}
        <div className="flex-1 h-px bg-primary/20" />
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
          : <ChevronDown  className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />}
      </button>
      {!collapsed && <ul className="space-y-3">{children}</ul>}
    </div>
  );
}

function ChecklistItem({ text, detail }: { text: string; detail?: string }) {
  const storageKey = `admin_postlaunch::${text}`;
  const [checked, setChecked] = useState(() => {
    try { return localStorage.getItem(storageKey) === "1"; } catch { return false; }
  });
  const toggle = () => {
    const next = !checked;
    setChecked(next);
    try { localStorage.setItem(storageKey, next ? "1" : "0"); } catch {}
  };
  return (
    <li className="flex items-start gap-3 cursor-pointer group select-none" onClick={toggle}>
      <div className="flex-shrink-0 mt-0.5">
        {checked ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />}
      </div>
      <div className="min-w-0">
        <span className="text-sm leading-snug" style={{ color: checked ? "hsl(225 15% 55% / 0.5)" : "#EAD9BE", textDecoration: checked ? "line-through" : "none" }}>
          {text}
        </span>
        {detail && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{detail}</p>}
      </div>
    </li>
  );
}

function CompletedItem({ text, detail }: { text: string; detail?: string }) {
  return (
    <li className="flex items-start gap-3 opacity-50">
      <div className="flex-shrink-0 mt-0.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
      <div className="min-w-0">
        <span className="text-sm leading-snug" style={{ color: "hsl(225 15% 55% / 0.6)", textDecoration: "line-through" }}>{text}</span>
        {detail && <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">{detail}</p>}
      </div>
    </li>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-blue-950/40 border border-blue-800/50 rounded-xl px-4 py-3 mb-4">
      <AlertTriangle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-blue-300 leading-relaxed">{children}</p>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function AdminGrowthPage() {
  const [activeTab, setActiveTab] = useState<"automation" | "outreach" | "ops">("automation");

  // ── Automation state ──
  const [dripStats, setDripStats] = useState<DripStats | null>(null);
  const [dripLoading, setDripLoading] = useState(true);
  const [dripSyncing, setDripSyncing] = useState(false);
  const [dripSyncResult, setDripSyncResult] = useState<{ enrolled: number; skipped: number; total: number; failed: number } | null>(null);

  const [clerkImporting, setClerkImporting] = useState(false);
  const [clerkImportResult, setClerkImportResult] = useState<{
    totalClerk: number; imported: number; alreadyExisted: number; failed: number; message: string;
  } | null>(null);
  const [clerkImportError, setClerkImportError] = useState<string | null>(null);
  const [clerkCheck, setClerkCheck] = useState<{
    keyPresent: boolean; keyPrefix: string; keyType: "live" | "test" | "unknown";
    clerkCount: number | null; clerkError: string | null; localCount: number | null;
    clerkInstanceDomain: string | null;
  } | null>(null);
  const [clerkChecking, setClerkChecking] = useState(false);

  const [refStats, setRefStats] = useState<ReferralStats | null>(null);
  const [refLoading, setRefLoading] = useState(true);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campLoading, setCampLoading] = useState(true);

  const [blogGenerating, setBlogGenerating] = useState(false);
  const [blogResult, setBlogResult] = useState<{ title: string; slug: string } | null>(null);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<BlogKeyword[]>([]);
  const [kwLoading, setKwLoading] = useState(true);
  const [newKw, setNewKw] = useState({ keyword: "", pillar: "financial", pillarLabel: "Financial Resilience" });
  const [kwAdding, setKwAdding] = useState(false);
  const [showKwForm, setShowKwForm] = useState(false);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppLoading, setOppLoading] = useState(true);
  const [oppScanning, setOppScanning] = useState(false);
  const [oppScanResult, setOppScanResult] = useState<{ found: number; saved: number } | null>(null);
  const [expandedOpp, setExpandedOpp] = useState<number | null>(null);

  const [newCamp, setNewCamp] = useState({ name: "", subject: "", body: "", segment: "free", sendNow: false });
  const [campSegmentCount, setCampSegmentCount] = useState<number | null>(null);
  const [campCompose, setCampCompose] = useState(false);
  const [campSending, setCampSending] = useState(false);
  const [campError, setCampError] = useState<string | null>(null);

  // ── Outreach state ──
  const [outRaw, setOutRaw] = useState("");
  const [emailSubject, setEmailSubject] = useState(DEFAULT_SUBJECT);
  const [emailBody, setEmailBody] = useState(DEFAULT_BODY);
  const [outSending, setOutSending] = useState(false);
  const [outResults, setOutResults] = useState<SendResult[] | null>(null);
  const [outConfirmed, setOutConfirmed] = useState(false);
  const [outError, setOutError] = useState<string | null>(null);

  const recipients = useMemo(() => parseRecipients(outRaw), [outRaw]);
  const businessEmails = recipients.filter(r => r.isBusinessDomain);
  const freeEmails = recipients.filter(r => !r.isBusinessDomain);
  const domainGroups = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of businessEmails) map[r.domain] = (map[r.domain] ?? 0) + 1;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [businessEmails]);

  // ── Load functions ──
  const loadDrip = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/admin/drip/stats`, { credentials: "include" });
      if (r.ok) setDripStats(await r.json());
    } finally { setDripLoading(false); }
  }, []);

  const loadReferrals = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/admin/referrals`, { credentials: "include" });
      if (r.ok) setRefStats(await r.json());
    } finally { setRefLoading(false); }
  }, []);

  const loadCampaigns = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/admin/broadcasts`, { credentials: "include" });
      if (r.ok) { const d = await r.json(); setCampaigns(d.campaigns ?? []); }
    } finally { setCampLoading(false); }
  }, []);

  const loadKeywords = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/admin/blog/keywords`, { credentials: "include" });
      if (r.ok) { const d = await r.json(); setKeywords(d.keywords ?? []); }
    } finally { setKwLoading(false); }
  }, []);

  const loadOpportunities = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/admin/opportunities`, { credentials: "include" });
      if (r.ok) { const d = await r.json(); setOpportunities(d.opportunities ?? []); }
    } finally { setOppLoading(false); }
  }, []);

  useEffect(() => {
    loadDrip(); loadReferrals(); loadCampaigns(); loadKeywords(); loadOpportunities();
  }, []);

  async function checkClerk() {
    setClerkChecking(true);
    try {
      const r = await fetch(`${BASE}/api/admin/drip/check`, { credentials: "include" });
      if (r.ok) setClerkCheck(await r.json());
    } finally { setClerkChecking(false); }
  }

  useEffect(() => { checkClerk(); }, []);

  async function importFromClerk() {
    setClerkImporting(true); setClerkImportResult(null); setClerkImportError(null);
    try {
      const r = await fetch(`${BASE}/api/admin/drip/clerk-import`, { method: "POST", credentials: "include" });
      const d = await r.json();
      if (!r.ok) { setClerkImportError(d.error ?? "Import failed"); return; }
      setClerkImportResult(d);
      loadDrip();
    } finally { setClerkImporting(false); }
  }

  async function syncDrip() {
    setDripSyncing(true); setDripSyncResult(null);
    try {
      const r = await fetch(`${BASE}/api/admin/drip/sync`, { method: "POST", credentials: "include" });
      const d = await r.json();
      if (!r.ok) { alert(d.error ?? "Sync failed"); return; }
      setDripSyncResult(d);
      loadDrip();
    } finally { setDripSyncing(false); }
  }

  async function generateBlog() {
    setBlogGenerating(true); setBlogResult(null); setBlogError(null);
    try {
      const r = await fetch(`${BASE}/api/admin/blog/generate`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const d = await r.json();
      if (!r.ok) { setBlogError(d.error ?? "Generation failed"); return; }
      setBlogResult({ title: d.post?.title ?? "Draft", slug: d.post?.slug ?? "" });
      loadKeywords();
    } finally { setBlogGenerating(false); }
  }

  async function addKeyword() {
    if (!newKw.keyword.trim()) return;
    setKwAdding(true);
    try {
      const r = await fetch(`${BASE}/api/admin/blog/keywords`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newKw),
      });
      if (r.ok) {
        setNewKw({ keyword: "", pillar: "financial", pillarLabel: "Financial Resilience" });
        setShowKwForm(false);
        loadKeywords();
      }
    } finally { setKwAdding(false); }
  }

  async function deleteKeyword(id: number) {
    await fetch(`${BASE}/api/admin/blog/keywords/${id}`, { method: "DELETE", credentials: "include" });
    setKeywords(prev => prev.filter(k => k.id !== id));
  }

  async function scanOpportunities() {
    setOppScanning(true); setOppScanResult(null);
    try {
      const r = await fetch(`${BASE}/api/admin/opportunities/scan`, { method: "POST", credentials: "include" });
      const d = await r.json();
      if (r.ok) { setOppScanResult(d); loadOpportunities(); }
    } finally { setOppScanning(false); }
  }

  async function previewSegmentCount(segment: string) {
    setCampSegmentCount(null);
    const r = await fetch(`${BASE}/api/admin/broadcasts/preview-count`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segment }),
    });
    if (r.ok) { const d = await r.json(); setCampSegmentCount(d.count); }
  }

  async function submitCampaign() {
    if (!newCamp.name || !newCamp.subject || !newCamp.body) { setCampError("Fill in all fields."); return; }
    setCampSending(true); setCampError(null);
    try {
      const r = await fetch(`${BASE}/api/admin/broadcasts`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCamp),
      });
      const d = await r.json();
      if (!r.ok) { setCampError(d.error ?? "Failed"); return; }
      setCampaigns(prev => [{ ...d.campaign, status: newCamp.sendNow ? "sending" : "draft" }, ...prev]);
      setNewCamp({ name: "", subject: "", body: "", segment: "free", sendNow: false });
      setCampCompose(false);
      setCampSegmentCount(null);
    } finally { setCampSending(false); }
  }

  async function sendDraftCampaign(id: number) {
    if (!confirm("Send this campaign now? This will email all segment users.")) return;
    await fetch(`${BASE}/api/admin/broadcasts/${id}/send`, { method: "POST", credentials: "include" });
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "sending" } : c));
    setTimeout(loadCampaigns, 3000);
  }

  async function markReferralConverted(id: number) {
    await fetch(`${BASE}/api/admin/referrals/${id}/mark-converted`, { method: "PATCH", credentials: "include" });
    loadReferrals();
  }

  async function handleOutreachSend() {
    if (!outConfirmed || recipients.length === 0) return;
    setOutSending(true); setOutError(null); setOutResults(null);
    try {
      const res = await fetch(`${BASE}/api/admin/send-founder-outreach`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: recipients.map(r => ({ name: r.name, email: r.email })),
          customSubject: emailSubject.trim() || DEFAULT_SUBJECT,
          customBody: emailBody.trim() || DEFAULT_BODY,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setOutError(data.error ?? `Server error ${res.status}`);
        return;
      }
      const data = await res.json();
      setOutResults(data.results ?? []);
    } catch (err) {
      setOutError(String(err));
    } finally {
      setOutSending(false);
      setOutConfirmed(false);
    }
  }

  const outSent = outResults?.filter(r => r.status === "sent").length ?? 0;
  const outFailed = outResults?.filter(r => r.status === "failed").length ?? 0;

  // ─── Tab bar styles ────────────────────────────────────────────────────────────
  const TAB_ITEMS: { key: "automation" | "outreach" | "ops"; label: string }[] = [
    { key: "automation", label: "Automation" },
    { key: "outreach", label: "Outreach" },
    { key: "ops", label: "Ops & Admin" },
  ];

  return (
    <AdminLayout activeSection="growth">
      <div style={{ padding: "32px 40px", color: TEXT, minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: TEXT }}>Growth Hub</h1>
          <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 14 }}>All growth tools in one place — automation, outreach, and operational duties.</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32, background: CARD_BG, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}`, width: "fit-content" }}>
          {TAB_ITEMS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                background: activeTab === t.key ? AMBER : "transparent",
                color: activeTab === t.key ? "#0D1225" : MUTED,
                border: "none",
                borderRadius: 7,
                padding: "8px 20px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ AUTOMATION TAB ══════════════ */}
        {activeTab === "automation" && (
          <div>
            {/* ── REDDIT OPPORTUNITIES ───────────────── */}
            <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Target size={18} color={AMBER} />
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>Reddit Reply Opportunities</h2>
                <button
                  onClick={scanOpportunities}
                  disabled={oppScanning}
                  style={{ marginLeft: "auto", background: AMBER, color: "#0D1225", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: oppScanning ? 0.7 : 1 }}
                >
                  {oppScanning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  {oppScanning ? "Scanning…" : "Scan Now"}
                </button>
              </div>
              <p style={{ margin: "0 0 16px", color: MUTED, fontSize: 13 }}>
                Every day at 10:00 UTC, Resilium scans r/preppers, r/personalfinance, r/digitalnomad, r/expats, r/FIRE, and more for relevant threads. AI scores each thread and writes a draft reply — you just personalize and post.
              </p>

              {oppScanResult && (
                <div style={{ background: CARD_BG, borderRadius: 10, padding: "12px 16px", border: `1px solid ${BORDER}`, marginBottom: 16, fontSize: 13 }}>
                  <CheckCircle size={13} color="#22c55e" style={{ display: "inline", marginRight: 6 }} />
                  <span style={{ color: MUTED }}>Scan complete — found <strong style={{ color: TEXT }}>{oppScanResult.found}</strong> threads, saved <strong style={{ color: "#22c55e" }}>{oppScanResult.saved}</strong> new opportunities.</span>
                </div>
              )}

              {oppLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}><Loader2 size={16} className="animate-spin" /> Loading…</div>
              ) : opportunities.length === 0 ? (
                <div style={{ background: CARD_BG, borderRadius: 10, padding: "20px 24px", border: `1px solid ${BORDER}`, textAlign: "center" }}>
                  <p style={{ margin: 0, color: MUTED, fontSize: 14 }}>No opportunities yet. Click "Scan Now" to fetch today's Reddit threads.</p>
                </div>
              ) : (
                <div>
                  <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                    {opportunities.length} thread{opportunities.length !== 1 ? "s" : ""} found (last 30 days)
                  </div>
                  {opportunities.map(opp => (
                    <div key={opp.id} style={{ background: CARD_BG, borderRadius: 10, border: `1px solid ${BORDER}`, marginBottom: 10, overflow: "hidden" }}>
                      <div
                        onClick={() => setExpandedOpp(expandedOpp === opp.id ? null : opp.id)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer" }}
                      >
                        <span style={{ background: AMBER, color: "#0D1225", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                          r/{opp.subreddit ?? opp.source}
                        </span>
                        <span style={{ color: opp.relevanceScore && opp.relevanceScore >= 8 ? "#22c55e" : AMBER, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                          {opp.relevanceScore}/10
                        </span>
                        <span style={{ color: TEXT, fontSize: 13, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {opp.title}
                        </span>
                        {opp.emailedAt && <span style={{ color: DIM, fontSize: 11, whiteSpace: "nowrap" }}>✓ emailed</span>}
                        <span style={{ color: DIM, fontSize: 11, whiteSpace: "nowrap" }}>↑{opp.upvotes ?? 0}</span>
                        <a
                          href={opp.url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color: AMBER, display: "flex" }}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      {expandedOpp === opp.id && (
                        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${BORDER}` }}>
                          {opp.body && (
                            <div style={{ marginTop: 12, marginBottom: 12, color: MUTED, fontSize: 12, lineHeight: 1.6, fontStyle: "italic", borderLeft: `2px solid ${BORDER}`, paddingLeft: 10 }}>
                              "{opp.body.slice(0, 300)}{opp.body.length > 300 ? "…" : ""}"
                            </div>
                          )}
                          <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 12 }}>Draft Reply</div>
                          <div style={{ background: "#0D1225", borderRadius: 8, padding: "12px 14px", border: `1px solid ${BORDER}`, color: MUTED, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                            {opp.draftReply}
                          </div>
                          <div style={{ marginTop: 10, color: DIM, fontSize: 11 }}>
                            Always personalize before posting. Genuine helpful replies only — never paste verbatim.
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── BLOG AUTO-GENERATION ───────────────── */}
            <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Sparkles size={18} color={AMBER} />
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>AI Blog Content Engine</h2>
              </div>
              <p style={{ margin: "0 0 20px", color: MUTED, fontSize: 13 }}>
                Every Monday at 08:00 UTC, a blog post draft is auto-generated using the next keyword from your queue (falls back to the built-in pool if the queue is empty). You can also trigger generation manually.
              </p>

              {/* Keyword Queue */}
              <div style={{ background: CARD_BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "16px 20px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Key size={14} color={AMBER} />
                  <span style={{ color: TEXT, fontSize: 14, fontWeight: 700 }}>Keyword Queue</span>
                  <span style={{ color: DIM, fontSize: 12, marginLeft: 4 }}>
                    ({keywords.filter(k => !k.usedAt).length} pending, {keywords.filter(k => k.usedAt).length} used)
                  </span>
                  <button
                    onClick={() => setShowKwForm(v => !v)}
                    style={{ marginLeft: "auto", background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px", color: AMBER, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Plus size={12} /> Add keyword
                  </button>
                </div>

                {showKwForm && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 8, marginBottom: 14, alignItems: "end" }}>
                    <div>
                      <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Keyword</label>
                      <input
                        value={newKw.keyword}
                        onChange={e => setNewKw(p => ({ ...p, keyword: e.target.value }))}
                        placeholder="financial resilience score"
                        onKeyDown={e => e.key === "Enter" && addKeyword()}
                        style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13, boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Pillar</label>
                      <select
                        value={newKw.pillar}
                        onChange={e => {
                          const opt = PILLAR_OPTIONS.find(o => o.value === e.target.value);
                          setNewKw(p => ({ ...p, pillar: e.target.value, pillarLabel: opt?.label ?? "" }));
                        }}
                        style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13 }}
                      >
                        {PILLAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        onClick={addKeyword}
                        disabled={kwAdding || !newKw.keyword.trim()}
                        style={{ background: AMBER, color: "#0D1225", fontWeight: 700, border: "none", fontSize: 13, padding: "8px 16px" }}
                      >
                        {kwAdding ? <Loader2 size={13} className="animate-spin" /> : "Add"}
                      </Button>
                      <Button variant="ghost" onClick={() => setShowKwForm(false)} style={{ color: MUTED, fontSize: 13 }}>Cancel</Button>
                    </div>
                  </div>
                )}

                {kwLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED, fontSize: 13 }}><Loader2 size={14} className="animate-spin" /> Loading…</div>
                ) : keywords.length === 0 ? (
                  <div style={{ color: MUTED, fontSize: 13 }}>No custom keywords yet — using built-in pool of 15 topics. Add keywords above to take priority.</div>
                ) : (
                  <div>
                    {keywords.map(kw => (
                      <div key={kw.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                        <span style={{ color: kw.usedAt ? DIM : TEXT, flex: 1, textDecoration: kw.usedAt ? "line-through" : "none" }}>{kw.keyword}</span>
                        <span style={{ color: DIM, fontSize: 11, background: "#0D1225", borderRadius: 4, padding: "2px 6px" }}>{kw.pillarLabel}</span>
                        {kw.usedAt ? (
                          <span style={{ color: "#22c55e", fontSize: 11 }}>✓ used {new Date(kw.usedAt).toLocaleDateString("en-US")}</span>
                        ) : (
                          <span style={{ color: AMBER, fontSize: 11, fontWeight: 600 }}>pending</span>
                        )}
                        <button
                          onClick={() => deleteKeyword(kw.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: DIM, display: "flex", padding: 2 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Button
                  onClick={generateBlog}
                  disabled={blogGenerating}
                  style={{ background: AMBER, color: "#0D1225", fontWeight: 700, border: "none", display: "flex", alignItems: "center", gap: 6 }}
                >
                  {blogGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Generate Draft Now
                </Button>
                <a href={`${BASE}/admin/blog`} style={{ color: AMBER, fontSize: 13, textDecoration: "underline" }}>View all blog posts →</a>
              </div>

              {blogResult && (
                <div style={{ marginTop: 16, background: CARD_BG, borderRadius: 10, padding: "14px 18px", border: "1px solid #22c55e" }}>
                  <CheckCircle size={14} color="#22c55e" style={{ display: "inline", marginRight: 6 }} />
                  <strong style={{ color: "#22c55e" }}>Draft created:</strong>{" "}
                  <span style={{ color: TEXT }}>{blogResult.title}</span>
                  <span style={{ color: MUTED, fontSize: 12, display: "block", marginTop: 4 }}>Saved as draft at /blog/{blogResult.slug} — go to Blog Admin to publish.</span>
                </div>
              )}
              {blogError && (
                <div style={{ marginTop: 16, background: CARD_BG, borderRadius: 10, padding: "14px 18px", border: "1px solid #ef4444" }}>
                  <XCircle size={14} color="#ef4444" style={{ display: "inline", marginRight: 6 }} />
                  <span style={{ color: "#ef4444" }}>{blogError}</span>
                </div>
              )}
            </section>

            {/* ── USER SYNC + DRIP ───────────────────── */}
            <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Mail size={18} color={AMBER} />
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>User Sync &amp; Email Drip</h2>
              </div>
              <p style={{ margin: "0 0 24px", color: MUTED, fontSize: 13, lineHeight: 1.7 }}>
                Use the two steps below to make sure every Clerk-registered user is in your growth pipeline. Run these once when first setting up, then periodically to catch new signups.
              </p>

              {/* Step 1 */}
              <div style={{ background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "20px 22px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ background: AMBER, color: "#0D1225", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0, marginTop: 2 }}>1</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: TEXT, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Import all users from Clerk</div>
                    <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
                      Pulls every user from your Clerk directory and creates a matching row in your local <code style={{ background: "#0D1225", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>users</code> table if one doesn't already exist. This is safe to run multiple times — existing users are skipped.
                    </div>

                    {clerkCheck && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ background: "#0D1225", borderRadius: 8, padding: "12px 14px", border: `1px solid ${BORDER}`, fontSize: 13 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: clerkCheck.clerkInstanceDomain ? 10 : 0 }}>
                            <div>
                              <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Clerk key</div>
                              <div style={{ color: clerkCheck.keyPresent ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
                                {clerkCheck.keyPresent ? `✓ ${clerkCheck.keyPrefix}` : "✗ Not set"}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Key type</div>
                              <div style={{ fontWeight: 700, color: clerkCheck.keyType === "live" ? "#22c55e" : clerkCheck.keyType === "test" ? "#f59e0b" : MUTED }}>
                                {clerkCheck.keyType === "live" ? "✓ Production" : clerkCheck.keyType === "test" ? "⚠ Test/Dev" : "Unknown"}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Clerk users</div>
                              <div style={{ color: TEXT, fontWeight: 700 }}>
                                {clerkCheck.clerkError ? <span style={{ color: "#ef4444" }}>Error</span> : (clerkCheck.clerkCount ?? "—")}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Local users</div>
                              <div style={{ color: TEXT, fontWeight: 700 }}>{clerkCheck.localCount ?? "—"}</div>
                            </div>
                          </div>
                          {clerkCheck.clerkInstanceDomain && (
                            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, flexShrink: 0 }}>Key belongs to</span>
                              <span style={{ color: clerkCheck.clerkInstanceDomain.includes("resilium-platform") ? "#22c55e" : "#f59e0b", fontWeight: 700, fontSize: 13, fontFamily: "monospace", wordBreak: "break-all" }}>
                                {clerkCheck.clerkInstanceDomain}
                              </span>
                              {!clerkCheck.clerkInstanceDomain.includes("resilium-platform") && (
                                <span style={{ color: "#f59e0b", fontSize: 12, flexShrink: 0 }}>← wrong app!</span>
                              )}
                            </div>
                          )}
                          {clerkCheck.clerkError && (
                            <div style={{ marginTop: 10, color: "#ef4444", fontSize: 12 }}>Clerk error: {clerkCheck.clerkError}</div>
                          )}
                        </div>
                        {clerkCheck.keyType === "test" && (
                          <div style={{ marginTop: 8, background: "#2d1a00", borderRadius: 8, padding: "10px 14px", border: "1px solid #f59e0b", fontSize: 13, color: "#f59e0b", lineHeight: 1.6 }}>
                            <strong>⚠ Test key detected.</strong> Your <code style={{ background: "#0D1225", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>CLERK_SECRET_KEY</code> starts with <code style={{ background: "#0D1225", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>sk_test_</code> — this is a development key connected to a separate Clerk instance from your production app. Users who signed up on <strong>resilium-platform.com</strong> are in the <em>live</em> instance. Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" style={{ color: "#f59e0b", textDecoration: "underline" }}>Clerk dashboard</a> → your production app → API Keys, copy the <strong>Secret key</strong> (starts with <code style={{ background: "#0D1225", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>sk_live_</code>), and update the <code>CLERK_SECRET_KEY</code> secret in your Replit project, then redeploy.
                          </div>
                        )}
                        {clerkCheck.keyType !== "test" && clerkCheck.clerkCount === 0 && !clerkCheck.clerkError && (
                          <div style={{ marginTop: 8, background: "#1a1a2e", borderRadius: 8, padding: "10px 14px", border: "1px solid #6b7280", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                            Clerk reports 0 users. If you know users have signed up, this key may point to a different Clerk application. Check the <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" style={{ color: AMBER, textDecoration: "underline" }}>Clerk dashboard</a> to verify which app the key belongs to.
                          </div>
                        )}
                      </div>
                    )}

                    {clerkImportResult && (
                      <div style={{ background: CARD_BG, borderRadius: 8, padding: "12px 14px", border: "1px solid #22c55e", marginBottom: 14, fontSize: 13 }}>
                        <CheckCircle size={13} color="#22c55e" style={{ display: "inline", marginRight: 6 }} />
                        <strong style={{ color: "#22c55e" }}>Import complete:</strong>
                        <span style={{ color: MUTED }}> {clerkImportResult.imported} imported, {clerkImportResult.alreadyExisted} already existed, {clerkImportResult.failed} failed (total Clerk: {clerkImportResult.totalClerk})</span>
                      </div>
                    )}
                    {clerkImportError && (
                      <div style={{ background: CARD_BG, borderRadius: 8, padding: "12px 14px", border: "1px solid #ef4444", marginBottom: 14, fontSize: 13 }}>
                        <XCircle size={13} color="#ef4444" style={{ display: "inline", marginRight: 6 }} />
                        <span style={{ color: "#ef4444" }}>{clerkImportError}</span>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={importFromClerk}
                        disabled={clerkImporting || !clerkCheck?.keyPresent}
                        style={{ background: AMBER, color: "#0D1225", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: (clerkImporting || !clerkCheck?.keyPresent) ? 0.6 : 1 }}
                      >
                        {clerkImporting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        {clerkImporting ? "Importing…" : "Import from Clerk"}
                      </button>
                      <button
                        onClick={checkClerk}
                        disabled={clerkChecking}
                        style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 16px", color: MUTED, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        {clerkChecking ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                        Refresh check
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ background: "#2a3245", color: AMBER, borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0, marginTop: 2, border: `1px solid ${AMBER}` }}>2</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: TEXT, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Enroll users in drip sequence</div>
                    <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
                      Scans all local users and creates pending drip emails (Day 3, Day 7, Day 14, Day 30) for anyone not already enrolled. Requires <code style={{ background: "#0D1225", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>DRIP_EMAILS_ENABLED=true</code>.
                    </div>

                    {dripLoading ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED, fontSize: 13, marginBottom: 14 }}><Loader2 size={14} className="animate-spin" /> Loading stats…</div>
                    ) : dripStats ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
                        <StatPill label="Total queued" value={dripStats.total} />
                        <StatPill label="Sent" value={dripStats.sent} color="#22c55e" />
                        <StatPill label="Pending" value={dripStats.pending} color={AMBER} />
                        <StatPill label="Cancelled" value={dripStats.cancelled} color="#6b7280" />
                      </div>
                    ) : null}

                    {dripSyncResult && (
                      <div style={{ background: "#0D1225", borderRadius: 8, padding: "12px 14px", border: "1px solid #22c55e", marginBottom: 14, fontSize: 13 }}>
                        <CheckCircle size={13} color="#22c55e" style={{ display: "inline", marginRight: 6 }} />
                        <strong style={{ color: "#22c55e" }}>Sync complete:</strong>
                        <span style={{ color: MUTED }}> {dripSyncResult.enrolled} enrolled, {dripSyncResult.skipped} skipped, {dripSyncResult.failed} failed (total: {dripSyncResult.total})</span>
                      </div>
                    )}

                    <button
                      onClick={syncDrip}
                      disabled={dripSyncing}
                      style={{ background: "none", border: `1px solid ${AMBER}`, borderRadius: 8, padding: "10px 18px", color: AMBER, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: dripSyncing ? 0.7 : 1 }}
                    >
                      {dripSyncing ? <Loader2 size={14} className="animate-spin" /> : <GitBranch size={14} />}
                      {dripSyncing ? "Syncing…" : "Sync Drip Enrollment"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent drip sends */}
              {dripStats && dripStats.recentSent.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Recent Drip Sends</div>
                  {dripStats.recentSent.slice(0, 5).map(row => (
                    <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                      <span style={{ color: TEXT, flex: 1 }}>{row.emailType}</span>
                      <span style={{ color: DIM, fontSize: 11 }}>score {row.scoreOverall}</span>
                      <span style={{ color: MUTED, fontSize: 11 }}>
                        {row.sentAt ? new Date(row.sentAt).toLocaleDateString("en-US") : "pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── REFERRALS ──────────────────────────── */}
            <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <TrendingUp size={18} color={AMBER} />
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>Referral Programme</h2>
              </div>

              {refLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}><Loader2 size={16} className="animate-spin" /> Loading…</div>
              ) : refStats ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                    <StatPill label="Codes issued" value={refStats.totalCodes} />
                    <StatPill label="Referrals" value={refStats.totalReferrals} />
                    <StatPill label="Converted" value={refStats.converted} color="#22c55e" />
                    <StatPill label="Conv. rate" value={`${refStats.conversionRate}%`} color={AMBER} />
                  </div>

                  {refStats.recentReferrals.length > 0 && (
                    <div>
                      <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Recent Referrals</div>
                      {refStats.recentReferrals.map(ref => (
                        <div key={ref.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                          <span style={{ color: AMBER, fontWeight: 700, fontSize: 12, background: "#0D1225", borderRadius: 4, padding: "2px 8px", fontFamily: "monospace" }}>{ref.code}</span>
                          <span style={{ color: MUTED, fontSize: 12, flex: 1 }}>→ {ref.referredId.slice(0, 8)}…</span>
                          {ref.convertedAt ? (
                            <span style={{ color: "#22c55e", fontSize: 11 }}>✓ converted {new Date(ref.convertedAt).toLocaleDateString("en-US")}</span>
                          ) : (
                            <>
                              <span style={{ color: DIM, fontSize: 11 }}>not converted</span>
                              <button
                                onClick={() => markReferralConverted(ref.id)}
                                style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "3px 8px", color: AMBER, fontSize: 11, cursor: "pointer" }}
                              >
                                Mark converted
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: MUTED, fontSize: 13 }}>Failed to load referral stats.</div>
              )}
            </section>

            {/* ── BROADCAST CAMPAIGNS ───────────────── */}
            <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Megaphone size={18} color={AMBER} />
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>Broadcast Campaigns</h2>
                <button
                  onClick={() => { setCampCompose(true); previewSegmentCount(newCamp.segment); }}
                  style={{ marginLeft: "auto", background: AMBER, color: "#0D1225", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Plus size={14} /> New Campaign
                </button>
              </div>
              <p style={{ margin: "0 0 20px", color: MUTED, fontSize: 13 }}>
                Send one-off emails to segments of your user base. Drafts are saved; use "Send now" to send immediately or let the cron send it on schedule.
              </p>

              {campCompose && (
                <div style={{ background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "20px 24px", marginBottom: 20 }}>
                  <div style={{ color: TEXT, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>New Campaign</div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {[
                      { label: "Campaign name", key: "name" as const, placeholder: "May re-engagement" },
                      { label: "Subject line", key: "subject" as const, placeholder: "Here's what's new in Resilium" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{f.label}</label>
                        <input
                          value={newCamp[f.key]}
                          onChange={e => setNewCamp(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13, boxSizing: "border-box" }}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Email body (plain text)</label>
                      <textarea
                        value={newCamp.body}
                        onChange={e => setNewCamp(p => ({ ...p, body: e.target.value }))}
                        rows={8}
                        placeholder="Hi {{firstName}},&#10;&#10;..."
                        style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Audience segment</label>
                      <select
                        value={newCamp.segment}
                        onChange={e => { setNewCamp(p => ({ ...p, segment: e.target.value })); previewSegmentCount(e.target.value); }}
                        style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13 }}
                      >
                        {Object.entries(SEGMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      {campSegmentCount !== null && (
                        <div style={{ marginTop: 6, color: MUTED, fontSize: 12 }}>
                          Estimated recipients: <strong style={{ color: TEXT }}>{campSegmentCount}</strong>
                        </div>
                      )}
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={newCamp.sendNow}
                        onChange={e => setNewCamp(p => ({ ...p, sendNow: e.target.checked }))}
                        style={{ accentColor: AMBER }}
                      />
                      <span style={{ color: MUTED, fontSize: 13 }}>Send immediately (otherwise saved as draft)</span>
                    </label>
                    {campError && <div style={{ color: "#ef4444", fontSize: 13 }}>{campError}</div>}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={submitCampaign}
                        disabled={campSending}
                        style={{ background: AMBER, color: "#0D1225", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: campSending ? 0.7 : 1 }}
                      >
                        {campSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {campSending ? "Saving…" : (newCamp.sendNow ? "Send campaign" : "Save as draft")}
                      </button>
                      <button onClick={() => setCampCompose(false)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 16px", color: MUTED, fontSize: 13, cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {campLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}><Loader2 size={16} className="animate-spin" /> Loading campaigns…</div>
              ) : campaigns.length === 0 ? (
                <div style={{ background: CARD_BG, borderRadius: 10, padding: "20px 24px", border: `1px solid ${BORDER}`, textAlign: "center" }}>
                  <p style={{ margin: 0, color: MUTED, fontSize: 14 }}>No campaigns yet. Click "New Campaign" to create your first broadcast.</p>
                </div>
              ) : (
                <div>
                  {campaigns.map(camp => (
                    <div key={camp.id} style={{ background: CARD_BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "16px 20px", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span style={{ color: TEXT, fontWeight: 700, fontSize: 14 }}>{camp.name}</span>
                            <StatusBadge status={camp.status} />
                            <span style={{ color: DIM, fontSize: 11, background: "#0D1225", borderRadius: 4, padding: "2px 6px" }}>{SEGMENT_LABELS[camp.segment] ?? camp.segment}</span>
                          </div>
                          <div style={{ color: MUTED, fontSize: 13, marginBottom: 6 }}>{camp.subject}</div>
                          <div style={{ display: "flex", gap: 16, fontSize: 12, color: DIM }}>
                            {camp.sentAt && <span>Sent {new Date(camp.sentAt).toLocaleDateString("en-US")}</span>}
                            {camp.sentCount > 0 && <span style={{ color: "#22c55e" }}>✓ {camp.sentCount} delivered</span>}
                            {camp.failedCount > 0 && <span style={{ color: "#ef4444" }}>✗ {camp.failedCount} failed</span>}
                            <span>Created {new Date(camp.createdAt).toLocaleDateString("en-US")}</span>
                          </div>
                        </div>
                        {camp.status === "draft" && (
                          <button
                            onClick={() => sendDraftCampaign(camp.id)}
                            style={{ background: "none", border: `1px solid ${AMBER}`, borderRadius: 8, padding: "8px 14px", color: AMBER, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}
                          >
                            <Send size={13} /> Send now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ══════════════ OUTREACH TAB ══════════════ */}
        {activeTab === "outreach" && (
          <div style={{ maxWidth: 720 }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Mail size={18} color={AMBER} />
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: TEXT }}>Founder Outreach</h2>
              </div>
              <p style={{ margin: 0, color: MUTED, fontSize: 13, lineHeight: 1.7 }}>
                Send the T+24h personal founder email to launch day signups. Paste the Clerk export below, review, then send.
              </p>
            </div>

            {/* Editable email content */}
            <div style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Pencil size={14} color={AMBER} />
                <span style={{ color: AMBER, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Email Content</span>
                <span style={{ color: DIM, fontSize: 12 }}>— use [Name] where the first name should go</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Subject line</label>
                <input
                  type="text" value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Body</label>
                <textarea
                  value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={14}
                  style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13, fontFamily: "monospace", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
                />
              </div>
              <button
                onClick={() => { setEmailSubject(DEFAULT_SUBJECT); setEmailBody(DEFAULT_BODY); }}
                style={{ background: "none", border: "none", color: DIM, fontSize: 12, cursor: "pointer", textDecoration: "underline", padding: 0 }}
              >
                Reset to default
              </button>
            </div>

            {/* Paste input */}
            <div style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ color: AMBER, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Paste Recipients</div>
              <p style={{ color: DIM, fontSize: 12, marginBottom: 10, lineHeight: 1.7 }}>
                One per line. Accepted: <code style={{ background: "#0D1225", padding: "1px 5px", borderRadius: 4 }}>email@domain.com</code>, <code style={{ background: "#0D1225", padding: "1px 5px", borderRadius: 4 }}>First Last, email@domain.com</code>, or <code style={{ background: "#0D1225", padding: "1px 5px", borderRadius: 4 }}>Name &lt;email&gt;</code>
              </p>
              <textarea
                rows={10} value={outRaw}
                onChange={e => { setOutRaw(e.target.value); setOutResults(null); setOutConfirmed(false); }}
                placeholder={"John Smith, john@company.com\njane@gmail.com\nAlex <alex@startup.io>"}
                style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 13, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            {/* Parsed recipients */}
            {recipients.length > 0 && !outResults && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  <StatPill label="Total recipients" value={recipients.length} />
                  <StatPill label="Business domains" value={businessEmails.length} color={AMBER} />
                  <StatPill label="Free email" value={freeEmails.length} color={DIM} />
                </div>

                {/* Business domains */}
                {domainGroups.length > 0 && (
                  <div style={{ background: SECTION_BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "14px 18px" }}>
                    <div style={{ color: AMBER, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>High-Signal Business Domains</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {domainGroups.map(([domain, count]) => (
                        <span key={domain} style={{ background: "rgba(224,128,64,0.1)", border: "1px solid rgba(224,128,64,0.2)", color: AMBER, fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                          {domain}{count > 1 ? ` (${count})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* List preview */}
                <div style={{ background: SECTION_BG, borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ background: CARD_BG, padding: "8px 16px", borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ color: DIM, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Parsed List</span>
                  </div>
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {recipients.map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.isBusinessDomain ? AMBER : BORDER, flexShrink: 0 }} />
                        <span style={{ flex: 1, color: TEXT }}>
                          {r.name && <span style={{ fontWeight: 600 }}>{r.name} </span>}
                          <span style={{ color: MUTED }}>{r.email}</span>
                        </span>
                        {r.isBusinessDomain && (
                          <span style={{ color: AMBER, fontSize: 10, background: "rgba(224,128,64,0.1)", padding: "2px 6px", borderRadius: 4 }}>business</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm */}
                <div style={{ background: SECTION_BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "14px 18px" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox" checked={outConfirmed}
                      onChange={e => setOutConfirmed(e.target.checked)}
                      style={{ marginTop: 2, accentColor: AMBER }}
                    />
                    <span style={{ color: TEXT, fontSize: 13, lineHeight: 1.6 }}>
                      I confirm I want to send the founder outreach email to <strong style={{ color: AMBER }}>{recipients.length} recipients</strong>. Each person will receive exactly one email. This cannot be undone.
                    </span>
                  </label>
                </div>

                {outError && (
                  <div style={{ background: CARD_BG, borderRadius: 10, border: "1px solid #ef4444", padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: "#ef4444", fontSize: 13 }}>{outError}</span>
                  </div>
                )}

                <button
                  disabled={!outConfirmed || outSending}
                  onClick={handleOutreachSend}
                  style={{ background: AMBER, color: "#0D1225", border: "none", borderRadius: 10, padding: "14px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (!outConfirmed || outSending) ? 0.4 : 1 }}
                >
                  {outSending ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : <><Send size={15} /> Send to {recipients.length} {recipients.length === 1 ? "person" : "people"}</>}
                </button>
              </div>
            )}

            {/* Results */}
            {outResults && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <StatPill label="Sent successfully" value={outSent} color="#22c55e" />
                  <StatPill label="Failed" value={outFailed} color={outFailed > 0 ? "#ef4444" : DIM} />
                </div>
                {outFailed > 0 && (
                  <div style={{ background: SECTION_BG, borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", overflow: "hidden" }}>
                    <div style={{ background: "rgba(239,68,68,0.1)", padding: "8px 16px", borderBottom: "1px solid rgba(239,68,68,0.2)" }}>
                      <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Failed Sends</span>
                    </div>
                    {outResults.filter(r => r.status === "failed").map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                        <XCircle size={13} color="#ef4444" />
                        <span style={{ color: "#ef4444", flex: 1 }}>{r.email}</span>
                        {r.error && <span style={{ color: "#dc2626", fontSize: 11 }}>{r.error}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setOutRaw(""); setOutResults(null); setOutConfirmed(false); }}
                  style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 20px", color: TEXT, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Send another batch
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ OPS & ADMIN TAB ══════════════ */}
        {activeTab === "ops" && (
          <div className="max-w-3xl">
            {/* Quick links */}
            <div className="flex flex-wrap gap-2 mb-6">
              {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label} href={href} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </a>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: TEXT }}>
                <Rocket className="w-5 h-5 text-primary" />
                Post-Launch Checklist
              </h2>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: MUTED }}>
                Daily and weekly operational tasks. Click any item to mark it done — progress saves in your browser.
              </p>
            </div>

            {/* ── Launch Day ── */}
            <CollapsibleCategory icon={Rocket} id="launch-day" label="Launch Day — One-time" badge="Do first">
              <ChecklistItem text="Post LinkedIn personal announcement" detail="Use the personal post copy block from the GTM plan (Marketing page). Include your UTM link. Pin the post to your profile after publishing." />
              <ChecklistItem text="Post LinkedIn company page announcement" detail="Use the company post copy block from the GTM plan. Tag your personal profile. Share the company post from your personal account." />
              <ChecklistItem text="Post Facebook personal announcement" detail="Use the Facebook copy block from the GTM plan. Tag resilium-platform.com. Engage with every comment in the first two hours." />
              <ChecklistItem text="Reply to every Product Hunt comment within the first hour" detail="Speed of response on PH is visible to other voters. Aim to reply to every comment within 60 minutes of it being posted throughout the launch day." />
              <ChecklistItem text="Set a reminder to send T+24h founder email to launch day signups" detail="Plain text, personal tone. Pull the list from Clerk the next morning. Ask one question: 'What made you sign up?' Use the Outreach tab above to send." />
              <ChecklistItem text="Screenshot your PH ranking and save it" detail="Capture your rank at the end of the day for social proof and future marketing copy." />
            </CollapsibleCategory>

            {/* ── Daily — First Week ── */}
            <CollapsibleCategory icon={Clock} id="daily-week1" label="Daily — First Week">
              <InfoBox>Do these every day for the first 7 days. They take 15–20 minutes combined and give you early signal on what's working.</InfoBox>
              <ChecklistItem text="Check Clerk for new signups" detail="Note names and email domains. High-signal users (enterprise email, multiple logins) are worth a personal email. Track daily signup counts in a simple note or spreadsheet." />
              <ChecklistItem text="Check Sentry for new errors" detail="Filter by 'Unresolved' and sort by frequency. Any new error appearing more than 3 times needs same-day attention. Go to /admin/monitoring for the embedded view." />
              <ChecklistItem text="Check Stripe for new subscriptions or failed payments" detail="Look at Events in Stripe dashboard. A failed payment needs a manual follow-up email within 24h if Resend webhook retry hasn't fired." />
              <ChecklistItem text="Check Umami for funnel drop-off" detail="Key path: landing → /consent → /assess → /results → /pricing. If drop-off at /consent is >70%, the gate may be too high. Go to /admin/dashboard?tab=traffic for the embedded view." />
              <ChecklistItem text="Reply to all Product Hunt comments and any emails to contact_resilium@pm.me" detail="PH comments slow down after day 3 but keep going. Every unanswered comment is a missed conversion opportunity." />
            </CollapsibleCategory>

            {/* ── Weekly ── */}
            <CollapsibleCategory icon={Calendar} id="weekly" label="Weekly — Ongoing">
              <ChecklistItem text="Send a personal T+24h founder note to each new signup from the past week" detail="Pull from Clerk, filter users created in the past 7 days who haven't converted to Pro. Use the Outreach tab. Subject: 'Quick question from the Resilium founder'. Ask what brought them in." />
              <ChecklistItem text="Review free → Pro conversion rate in Stripe" detail="Target: >5% of free users convert within 14 days. If below 3%, review the pricing page and consider a limited-time offer for early signups." />
              <ChecklistItem text="Comment genuinely on r/preppers and r/personalfinance" detail="10–15 substantive comments per week to build karma. No links to Resilium yet — just be helpful. u/BasketMission6685 needs 2–4 weeks of activity before posting in subreddits." />
              <ChecklistItem text="Publish one new blog post" detail="11 posts are already live. Aim for one per week minimum. Target long-tail keywords. Use the Automation tab to generate drafts automatically." />
              <ChecklistItem text="Check GDPR data requests in admin" detail="Go to /admin/gdpr to review any pending deletion or export requests. GDPR requires a response within 30 days — act within 7 to stay well inside the window." />
              <ChecklistItem text="Review Sentry error trends for the week" detail="Look for any errors that grew in frequency during the week. Address anything above 10 occurrences. Go to /admin/monitoring." />
            </CollapsibleCategory>

            {/* ── Month 1 ── */}
            <CollapsibleCategory icon={TrendingUp} id="month1" label="Month 1 — Milestones">
              <ChecklistItem text="Post 'I built this' story in r/preppers and r/SideProject (once karma is ready)" detail="Full post copy blocks are saved in the Reddit section of the Marketing page. Don't rush this — post only once you have enough karma to avoid auto-removal." />
              <ChecklistItem text="Review first-month metrics and write a mini retro" detail="Track: total signups, free→Pro conversion rate, churn, PH final rank, top traffic sources from Umami. Use the Admin Documents page to store it." />
              <ChecklistItem text="Send a 'one month in' newsletter to all users" detail="Share what you've learned, what's coming next, and a thank-you. Keep it under 200 words. Plain text performs better than HTML for founder-to-user emails at this stage." />
              <ChecklistItem text="Reach out to 5 journalists or bloggers in the preparedness / self-improvement space" detail="Personalised one-sentence pitch. Lead with the resilience score angle — it's unique. Attach the whitepaper PDF (Admin Documents → White Paper)." />
              <ChecklistItem text="Run a user research survey (5–10 questions)" detail="Ask: what almost stopped them signing up, what score range they got, what one feature they wish existed. Use Tally (free, GDPR-friendly)." />
            </CollapsibleCategory>

            {/* ── iOS App Store ── */}
            <CollapsibleCategory icon={Smartphone} id="ios" label="iOS App Store — When Ready">
              <InfoBox>This is the largest remaining technical block. The full step-by-step checklist (18 items) is on the Marketing page under 'Mobile Launch Checklist'. These are the key gates.</InfoBox>
              <ChecklistItem text="Apple Developer account active ($99/yr) and banking/tax info complete in App Store Connect" detail="Both must be done before you can submit or receive revenue. Banking verification takes 1–3 business days." />
              <ChecklistItem text="RevenueCat account created and linked to App Store Connect" detail="Required for Apple's mandatory in-app purchase flow. Wire RevenueCat SDK into the Expo mobile app and build the iOS paywall screen." />
              <ChecklistItem text="Sandbox purchase tested on a physical iPhone" detail="Create a Sandbox Tester account in App Store Connect. Test purchase, renewal, and Restore Purchases end-to-end on device." />
              <ChecklistItem text="TestFlight build uploaded and tested" detail="Run: eas build --platform ios --profile production. Test the full assessment flow, report generation, and Pro gating on a real iPhone via TestFlight." />
              <ChecklistItem text="App Store submission sent and approved" detail="First review typically takes 1–3 business days. Have your privacy policy URL (resilium-platform.com/privacy), support URL, and age rating ready." />
            </CollapsibleCategory>

            {/* ── Completed ── */}
            <CollapsibleCategory icon={CheckCircle2} id="completed" label="Already Done — For Reference">
              <CompletedItem text="Umami analytics live" detail="Script in index.html. Website ID: c5f820b3-31df-42c7-9c67-2d669117f9b6. Cookieless, EU region." />
              <CompletedItem text="GDPR contact email published" detail="contact_resilium@pm.me is in Privacy Policy, Terms, Refund Policy, About page, and structured data." />
              <CompletedItem text="11 blog posts published" detail="Strong foundation for long-tail SEO. Continue weekly publishing to compound domain authority." />
              <CompletedItem text="Sentry error monitoring active" detail="Connected to web and API. View at /admin/monitoring." />
              <CompletedItem text="LinkedIn personal and company pages launched" detail="Both pages active ahead of Product Hunt launch." />
              <CompletedItem text="Product Hunt listing prepared" detail="Name: 'Resilium – Score Your Preparedness'. Tags: Productivity · Health & Fitness · Quantified Self. Shoutouts section complete." />
              <CompletedItem text="OpenGraph preview verified on social platforms" detail="Correct image, title, and description confirmed on opengraph.xyz." />
              <CompletedItem text="Resend domain verified — SPF/DKIM live" detail="resilium-platform.com verified in Resend dashboard. Transactional email deliverability confirmed." />
            </CollapsibleCategory>

            {/* ════════════════════════════════════════
                ROMANIAN SRL DUTIES
                ════════════════════════════════════════ */}
            <div style={{ marginTop: 40, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: TEXT }}>
                <MessageSquare className="w-5 h-5 text-primary" />
                Romanian SRL Legal Duties
              </h2>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: MUTED }}>
                Compliance calendar for Resilium SRL. Penalties for late filing can be steep — set calendar reminders for every deadline below.
              </p>
            </div>

            <CollapsibleCategory icon={Calendar} id="srl-daily" label="Daily / Ongoing" storageKey={SRL_CATEGORY_KEY}>
              <ChecklistItem
                text="Issue e-Factura XML for every B2B invoice (mandatory since Jan 2025)"
                detail="All B2B invoices must be sent through the ANAF e-Factura system (e-factura.mfinante.gov.ro) within 5 calendar days of the invoice date. Log in to SPV (Spațiul Privat Virtual) with your token. Retain the XML and the ANAF acknowledgment for each invoice for 10 years."
              />
              <ChecklistItem
                text="Keep all invoices, receipts, and bank statements (10-year retention)"
                detail="Romanian law requires 10 years of retention for fiscal documents (Legea 82/1991). Use an organised cloud folder — one subfolder per year, one per month. Include: issued invoices, supplier invoices, bank statements, payroll records."
              />
            </CollapsibleCategory>

            <CollapsibleCategory icon={RefreshCw} id="srl-monthly" label="Monthly" storageKey={SRL_CATEGORY_KEY}>
              <ChecklistItem
                text="Review VAT register (Jurnal de TVA) — update if VAT-registered"
                detail="If Resilium SRL is VAT-registered (plătitor de TVA), you must maintain a VAT register and submit D300 monthly. If not yet VAT-registered (neplătitor), no D300 is required — but you cannot charge VAT on invoices. VAT registration becomes mandatory once turnover exceeds 300,000 RON/year."
              />
              <ChecklistItem
                text="Save monthly bank statement and reconcile with accounting software"
                detail="Download the bank statement from ING/BCR/your bank. Reconcile with your recorded transactions. Keep original PDFs in the 10-year archive. Share with your accountant if you have one."
              />
              <ChecklistItem
                text="Review social contributions if you also have an individual PFA/SRL salary"
                detail="If you pay yourself a salary from the SRL, the SRL must pay CAS (25%) + CASS (10%) contributions monthly. Declarations D112 are due by the 25th of the following month. Coordinate with your accountant on optimal salary level vs. dividend distribution."
              />
            </CollapsibleCategory>

            <CollapsibleCategory icon={TrendingUp} id="srl-quarterly" label="Quarterly" storageKey={SRL_CATEGORY_KEY}>
              <ChecklistItem
                text="File D100 — Impozit pe venit micro-întreprindere (due by Q+25 days)"
                detail="Resilium SRL is taxed as a microenterprise (impozit micro). The rate is 1% of revenue if the SRL has at least 1 full-time employee, or 3% of revenue with zero employees. D100 is due 25 days after the end of each quarter: Q1 → April 25, Q2 → July 25, Q3 → October 25, Q4 → January 25. File electronically via SPV (Spațiul Privat Virtual) on anaf.ro. Payment via online banking to your IBAN held with the Treasury (Trezorerie)."
              />
              <ChecklistItem
                text="Q1 deadline: April 25 — D100 for January–March"
                detail="Revenue for Q1 × tax rate (1% or 3%). File and pay by April 25."
              />
              <ChecklistItem
                text="Q2 deadline: July 25 — D100 for April–June"
                detail="Revenue for Q2 × tax rate. File and pay by July 25."
              />
              <ChecklistItem
                text="Q3 deadline: October 25 — D100 for July–September"
                detail="Revenue for Q3 × tax rate. File and pay by October 25."
              />
              <ChecklistItem
                text="Q4 deadline: January 25 — D100 for October–December"
                detail="Revenue for Q4 × tax rate. File and pay by January 25 of the following year."
              />
              <ChecklistItem
                text="Review dividend distribution — 8% dividend tax applies"
                detail="Dividends from the SRL to you as shareholder are subject to 8% dividend tax (impozit pe dividende), withheld and paid by the SRL on your behalf. Declare via D205 (annual) or D100 if paying interim dividends. Avoid distributing dividends before filing the quarterly D100 to ensure accurate profit figures."
              />
            </CollapsibleCategory>

            <CollapsibleCategory icon={Rocket} id="srl-annual" label="Annual" storageKey={SRL_CATEGORY_KEY}>
              <ChecklistItem
                text="Bilanț contabil — annual financial statements (deadline: March 31)"
                detail="The annual financial statements (Situații financiare anuale) must be filed with ANAF by March 31 for the previous fiscal year. This includes: bilanț, cont de profit și pierdere, note explicative. File electronically via portalanaf.ro or through your accountant. If revenue exceeds 35,000 EUR, an audit may be required. Late filing penalty: 300–1,000 RON for first offense."
              />
              <ChecklistItem
                text="File D205 — annual dividend tax declaration (deadline: January 31)"
                detail="If you distributed dividends during the year, D205 must be filed by January 31 of the following year. Reports dividends paid and the 8% tax withheld. File via SPV."
              />
              <ChecklistItem
                text="File D394 — informative VAT declaration (if VAT-registered)"
                detail="If Resilium SRL is VAT-registered, D394 (Declarație informativă privind livrările/prestările și achizițiile efectuate pe teritoriul național) must be filed by the 30th of January for the previous year. Summarises all B2B domestic transactions."
              />
              <ChecklistItem
                text="Renew e-token / digital certificate for SPV if expiring"
                detail="The digital certificate used to sign ANAF filings is typically valid for 1–3 years. Check expiry date in your SPV account. Renewal through your certifying authority (certSIGN, DigiSign, etc.) takes 1–5 business days. Do not let it expire — you cannot file declarations without it."
              />
              <ChecklistItem
                text="Update ONRC records if address, shareholders, or administrator changed"
                detail="Any change to registered office address, administrator, or shareholder structure must be filed at the Registrul Comerțului (onrc.ro) within 15 days of the change. Cost: ~200–400 RON per filing. Use a lawyer for complex changes."
              />
              <ChecklistItem
                text="Review GDPR register and update data processing records"
                detail="GDPR requires keeping an up-to-date Record of Processing Activities (ROPA). Review annually: what personal data you process, legal basis, retention periods, third-party processors (Clerk, Resend, Stripe, etc.). No formal filing required — keep internally."
              />
            </CollapsibleCategory>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
