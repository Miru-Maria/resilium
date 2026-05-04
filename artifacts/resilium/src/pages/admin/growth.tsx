import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "./layout";
import {
  Loader2, RefreshCw, Send, Mail, TrendingUp, GitBranch,
  CheckCircle, XCircle, Clock, Sparkles, Megaphone,
  Plus, Search, Trash2, ExternalLink, Target, Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const SEGMENT_LABELS: Record<string, string> = {
  all: "All users",
  pro: "Pro subscribers",
  free: "Free users (not Pro)",
  free_assessed_14d: "Free users who assessed 14+ days ago (no upgrade)",
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
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

export default function AdminGrowthPage() {
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
    keyPresent: boolean; keyPrefix: string; clerkCount: number | null; clerkError: string | null; localCount: number | null;
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

  return (
    <AdminLayout activeSection="growth">
      <div style={{ padding: "32px 40px", color: TEXT, minHeight: "100vh" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: TEXT }}>Growth Automation</h1>
          <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 14 }}>Drip sequences, referrals, content generation, Reddit opportunities, and broadcast campaigns — all in one place.</p>
        </div>

        {/* ── REDDIT OPPORTUNITIES ────────────────────────── */}
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
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
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

        {/* ── BLOG AUTO-GENERATION ───────────────────────── */}
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
            <div style={{ marginTop: 16, background: CARD_BG, borderRadius: 10, padding: "14px 18px", border: `1px solid #22c55e` }}>
              <CheckCircle size={14} color="#22c55e" style={{ display: "inline", marginRight: 6 }} />
              <strong style={{ color: "#22c55e" }}>Draft created:</strong>{" "}
              <span style={{ color: TEXT }}>{blogResult.title}</span>
              <span style={{ color: MUTED, fontSize: 12, display: "block", marginTop: 4 }}>Saved as draft at /blog/{blogResult.slug} — go to Blog Admin to publish.</span>
            </div>
          )}
          {blogError && (
            <div style={{ marginTop: 16, background: CARD_BG, borderRadius: 10, padding: "14px 18px", border: `1px solid #ef4444` }}>
              <XCircle size={14} color="#ef4444" style={{ display: "inline", marginRight: 6 }} />
              <span style={{ color: "#ef4444" }}>{blogError}</span>
            </div>
          )}
        </section>

        {/* ── USER SYNC + DRIP ───────────────────────────── */}
        <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Mail size={18} color={AMBER} />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>User Sync &amp; Email Drip</h2>
          </div>
          <p style={{ margin: "0 0 24px", color: MUTED, fontSize: 13, lineHeight: 1.7 }}>
            Use the two steps below to make sure every Clerk-registered user is in your growth pipeline. Run these once when first setting up, then periodically to catch new signups.
          </p>

          {/* ── Step 1: Clerk Import ── */}
          <div style={{ background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ background: AMBER, color: "#0D1225", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0, marginTop: 2 }}>1</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: TEXT, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Import all users from Clerk</div>
                <p style={{ margin: "0 0 14px", color: MUTED, fontSize: 13, lineHeight: 1.65 }}>
                  Clerk is your auth provider — every registered account lives there. Your local database only knows about users who have already signed in to the app at least once. This step fetches <strong style={{ color: TEXT }}>all</strong> Clerk users (paginated, no limit) and upserts them into your local database, so broadcasts and segment counts include everyone, even users who registered but never completed onboarding.
                </p>
                <div style={{ background: "#0D1225", borderRadius: 8, padding: "10px 14px", border: `1px solid ${BORDER}`, marginBottom: 14, fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                  <span style={{ color: AMBER, fontWeight: 700 }}>What it does:</span> calls the Clerk REST API → upserts each user (id, email, name, avatar) into your <code style={{ color: TEXT }}>users</code> table → updates name/email for existing users in case they changed it in Clerk. Safe to run multiple times.
                </div>

                {/* Diagnostic status bar */}
                <div style={{ background: "#0D1225", borderRadius: 8, padding: "10px 14px", border: `1px solid ${BORDER}`, marginBottom: 14, fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: DIM, textTransform: "uppercase", letterSpacing: 1, fontSize: 10 }}>Connection Status</span>
                    <button onClick={checkClerk} disabled={clerkChecking} style={{ background: "none", border: "none", cursor: "pointer", color: DIM, display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                      <RefreshCw size={10} style={{ animation: clerkChecking ? "spin 1s linear infinite" : "none" }} /> refresh
                    </button>
                  </div>
                  {clerkChecking && !clerkCheck ? (
                    <span style={{ color: MUTED }}>Checking…</span>
                  ) : clerkCheck ? (
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      <span style={{ color: MUTED }}>
                        Secret key: <strong style={{ color: clerkCheck.keyPresent ? "#22c55e" : "#ef4444" }}>
                          {clerkCheck.keyPresent ? `✓ present (${clerkCheck.keyPrefix})` : "✗ missing"}
                        </strong>
                      </span>
                      <span style={{ color: MUTED }}>
                        Clerk sees: <strong style={{ color: clerkCheck.clerkCount === null ? "#ef4444" : TEXT }}>
                          {clerkCheck.clerkCount === null ? `error — ${clerkCheck.clerkError?.slice(0, 60)}` : `${clerkCheck.clerkCount} users`}
                        </strong>
                      </span>
                      <span style={{ color: MUTED }}>
                        Local DB: <strong style={{ color: TEXT }}>{clerkCheck.localCount ?? "?"} users</strong>
                      </span>
                      {clerkCheck.clerkCount !== null && clerkCheck.localCount !== null && clerkCheck.clerkCount > clerkCheck.localCount && (
                        <span style={{ color: AMBER, fontWeight: 600 }}>
                          ↑ {clerkCheck.clerkCount - clerkCheck.localCount} not yet imported
                        </span>
                      )}
                      {clerkCheck.clerkCount !== null && clerkCheck.localCount !== null && clerkCheck.clerkCount <= clerkCheck.localCount && (
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>✓ all synced</span>
                      )}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <Button
                    onClick={importFromClerk}
                    disabled={clerkImporting}
                    style={{ background: AMBER, color: "#0D1225", fontWeight: 700, border: "none", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {clerkImporting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {clerkImporting ? "Importing from Clerk…" : "Import from Clerk"}
                  </Button>
                  <span style={{ color: DIM, fontSize: 12 }}>Safe to run multiple times · takes ~2–10 s</span>
                </div>

                {clerkImportResult && (
                  <div style={{ marginTop: 14, background: "#0D1225", borderRadius: 10, padding: "14px 18px", border: `1px solid #22c55e` }}>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{ color: MUTED, fontSize: 13 }}>Total in Clerk: <strong style={{ color: TEXT }}>{clerkImportResult.totalClerk}</strong></span>
                      <span style={{ color: MUTED, fontSize: 13 }}>Newly imported: <strong style={{ color: "#22c55e" }}>{clerkImportResult.imported}</strong></span>
                      <span style={{ color: MUTED, fontSize: 13 }}>Already existed: <strong style={{ color: TEXT }}>{clerkImportResult.alreadyExisted}</strong></span>
                      {clerkImportResult.failed > 0 && <span style={{ color: MUTED, fontSize: 13 }}>Failed: <strong style={{ color: "#ef4444" }}>{clerkImportResult.failed}</strong></span>}
                    </div>
                    <div style={{ color: MUTED, fontSize: 12 }}>
                      <CheckCircle size={12} color="#22c55e" style={{ display: "inline", marginRight: 5 }} />
                      {clerkImportResult.message} All imported users are now visible to broadcast segments. Proceed to Step 2 to enroll assessed users in the drip.
                    </div>
                  </div>
                )}
                {clerkImportError && (
                  <div style={{ marginTop: 14, background: "#0D1225", borderRadius: 10, padding: "12px 16px", border: `1px solid #ef4444`, color: "#ef4444", fontSize: 13 }}>
                    <XCircle size={13} style={{ display: "inline", marginRight: 6 }} /> {clerkImportError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Step 2: Drip Enrollment ── */}
          <div style={{ background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "20px 22px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ background: BORDER, color: TEXT, borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0, marginTop: 2 }}>2</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: TEXT, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Enroll assessed users in drip sequence</div>
                <p style={{ margin: "0 0 14px", color: MUTED, fontSize: 13, lineHeight: 1.65 }}>
                  The drip sequence sends a series of 5 personalized emails over 14 days based on a user's resilience score (day 0, 2, 5, 9, 14). This step scans all users in your local database who have completed at least one assessment and enrolls them — scheduling the right emails relative to their signup date and automatically marking past emails as skipped. Requires <code style={{ color: TEXT }}>DRIP_EMAILS_ENABLED=true</code> in your environment.
                </p>
                <div style={{ background: "#0D1225", borderRadius: 8, padding: "10px 14px", border: `1px solid ${BORDER}`, marginBottom: 14, fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                  <span style={{ color: AMBER, fontWeight: 700 }}>Note:</span> users without an assessment score are skipped — they'll be enrolled automatically the moment they complete their first assessment. Safe to run multiple times; already-enrolled users are skipped.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <Button
                    onClick={syncDrip}
                    disabled={dripSyncing}
                    style={{ background: "none", color: AMBER, fontWeight: 700, border: `1px solid ${AMBER}`, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
                  >
                    {dripSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {dripSyncing ? "Enrolling…" : "Enroll in Drip"}
                  </Button>
                  <span style={{ color: DIM, fontSize: 12 }}>Only users with a completed assessment are enrolled</span>
                </div>

                {dripSyncResult && (
                  <div style={{ marginTop: 14, background: "#0D1225", borderRadius: 10, padding: "14px 18px", border: `1px solid ${BORDER}` }}>
                    <CheckCircle size={14} color="#22c55e" style={{ display: "inline", marginRight: 6 }} />
                    <strong style={{ color: "#22c55e" }}>Enrollment complete.</strong>{" "}
                    <span style={{ color: MUTED, fontSize: 13 }}>
                      Enrolled <strong style={{ color: TEXT }}>{dripSyncResult.enrolled}</strong> users,{" "}
                      <strong style={{ color: TEXT }}>{dripSyncResult.skipped}</strong> already enrolled.{" "}
                      {dripSyncResult.failed > 0 && <><strong style={{ color: "#ef4444" }}>{dripSyncResult.failed}</strong> failed. </>}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Drip Stats ── */}
          {dripLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}><Loader2 size={16} className="animate-spin" /> Loading stats…</div>
          ) : dripStats ? (
            <>
              <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 4 }}>Drip Queue Stats</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <StatCard label="Total queued" value={dripStats.total} />
                <StatCard label="Sent" value={dripStats.sent} color="#22c55e" />
                <StatCard label="Pending" value={dripStats.pending} color={AMBER} />
                <StatCard label="Cancelled / skipped" value={dripStats.cancelled} color="#6b7280" />
              </div>
              {dripStats.byType.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {dripStats.byType.map(t => (
                    <span key={t.emailType} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: MUTED }}>
                      <strong style={{ color: TEXT }}>{t.sent}</strong> {t.emailType}
                    </span>
                  ))}
                </div>
              )}
              {dripStats.recentSent.length > 0 && (
                <div>
                  <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Recent Sends</div>
                  {dripStats.recentSent.slice(0, 5).map(r => (
                    <div key={r.id} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                      <span style={{ color: AMBER, fontWeight: 600, minWidth: 50 }}>{r.emailType}</span>
                      <span style={{ color: MUTED }}>score {r.scoreOverall}</span>
                      <span style={{ color: DIM, marginLeft: "auto" }}>{r.sentAt ? new Date(r.sentAt).toLocaleDateString("en-US") : "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </section>

        {/* ── REFERRALS ──────────────────────────────────── */}
        <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <GitBranch size={18} color={AMBER} />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>Referral Program</h2>
          </div>

          <div style={{ background: CARD_BG, borderRadius: 10, padding: "14px 18px", border: `1px solid ${BORDER}`, marginBottom: 20, fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
            Each user gets a unique referral link (<code style={{ color: TEXT, background: "#0D1225", padding: "1px 6px", borderRadius: 4 }}>resilium-platform.com?ref=CODE</code>) via <code style={{ color: TEXT, background: "#0D1225", padding: "1px 6px", borderRadius: 4 }}>GET /api/referral/my-code</code>. When a new user lands with a ref code and signs up, the frontend auto-claims it. Mark conversions to Pro manually below.
          </div>

          {refLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}><Loader2 size={16} className="animate-spin" /> Loading…</div>
          ) : refStats ? (
            <>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <StatCard label="Total codes" value={refStats.totalCodes} />
                <StatCard label="Referrals made" value={refStats.totalReferrals} />
                <StatCard label="Converted to Pro" value={refStats.converted} color="#22c55e" />
                <StatCard label="Conversion rate" value={`${refStats.conversionRate}%`} color={AMBER} />
              </div>
              {refStats.recentReferrals.length > 0 ? (
                <div>
                  <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Recent Referrals</div>
                  {refStats.recentReferrals.slice(0, 8).map(r => (
                    <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                      <span style={{ color: AMBER, fontWeight: 600, fontFamily: "monospace" }}>{r.code}</span>
                      <span style={{ color: MUTED, flex: 1 }}>{r.referredId.slice(0, 16)}…</span>
                      <span style={{ color: DIM }}>{new Date(r.createdAt).toLocaleDateString("en-US")}</span>
                      {r.convertedAt ? (
                        <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 600 }}>✓ Pro</span>
                      ) : (
                        <button
                          onClick={() => markReferralConverted(r.id)}
                          style={{ color: AMBER, fontSize: 11, background: "none", border: `1px solid ${BORDER}`, borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}
                        >
                          Mark converted
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: MUTED, fontSize: 13 }}>No referrals yet. Once users start sharing their links, they'll appear here.</div>
              )}
            </>
          ) : null}
        </section>

        {/* ── BROADCAST CAMPAIGNS ────────────────────────── */}
        <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Megaphone size={18} color={AMBER} />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>Broadcast Campaigns</h2>
            <button
              onClick={() => setCampCompose(o => !o)}
              style={{ marginLeft: "auto", background: AMBER, color: "#0D1225", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={14} /> New Campaign
            </button>
          </div>
          <p style={{ margin: "0 0 20px", color: MUTED, fontSize: 13 }}>
            Send a targeted email to a segment of your users. Use <code style={{ color: TEXT }}>[Name]</code> in the body to personalize.
          </p>

          {campCompose && (
            <div style={{ background: CARD_BG, borderRadius: 12, padding: "20px 24px", border: `1px solid ${BORDER}`, marginBottom: 24 }}>
              <div style={{ color: TEXT, fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Compose Campaign</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Campaign Name</label>
                  <input
                    value={newCamp.name}
                    onChange={e => setNewCamp(p => ({ ...p, name: e.target.value }))}
                    placeholder="May Re-engagement"
                    style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", color: TEXT, fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Segment</label>
                  <select
                    value={newCamp.segment}
                    onChange={e => { setNewCamp(p => ({ ...p, segment: e.target.value })); previewSegmentCount(e.target.value); }}
                    style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", color: TEXT, fontSize: 13 }}
                  >
                    {Object.entries(SEGMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  {campSegmentCount !== null && (
                    <div style={{ color: AMBER, fontSize: 12, marginTop: 4 }}>~{campSegmentCount} recipient{campSegmentCount !== 1 ? "s" : ""}</div>
                  )}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Subject Line</label>
                <input
                  value={newCamp.subject}
                  onChange={e => setNewCamp(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Your resilience plan is waiting, [Name]"
                  style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", color: TEXT, fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Body (plain text — use [Name] to personalize)</label>
                <textarea
                  value={newCamp.body}
                  onChange={e => setNewCamp(p => ({ ...p, body: e.target.value }))}
                  rows={8}
                  placeholder={`Hi [Name],\n\nYou started your resilience journey but haven't come back yet...\n\n— Miruna at Resilium`}
                  style={{ width: "100%", background: "#0D1225", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: TEXT, fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: MUTED, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={newCamp.sendNow}
                    onChange={e => setNewCamp(p => ({ ...p, sendNow: e.target.checked }))}
                    style={{ accentColor: AMBER }}
                  />
                  Send immediately (otherwise saved as draft)
                </label>
                {campError && <span style={{ color: "#ef4444", fontSize: 13 }}>{campError}</span>}
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <Button variant="ghost" onClick={() => { setCampCompose(false); setCampError(null); }} style={{ color: MUTED, fontSize: 13 }}>Cancel</Button>
                  <Button
                    onClick={submitCampaign}
                    disabled={campSending}
                    style={{ background: AMBER, color: "#0D1225", fontWeight: 700, border: "none", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {campSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {newCamp.sendNow ? "Send Campaign" : "Save Draft"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {campLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}><Loader2 size={16} className="animate-spin" /> Loading…</div>
          ) : campaigns.length === 0 ? (
            <div style={{ color: MUTED, fontSize: 13 }}>No campaigns yet.</div>
          ) : (
            <div>
              {campaigns.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: TEXT, fontWeight: 600, marginBottom: 2 }}>{c.name}</div>
                    <div style={{ color: MUTED, fontSize: 12 }}>{c.subject} · <span style={{ color: DIM }}>{SEGMENT_LABELS[c.segment] ?? c.segment}</span></div>
                  </div>
                  <StatusBadge status={c.status} />
                  {c.sentCount > 0 && <span style={{ color: MUTED, fontSize: 12 }}>{c.sentCount} sent</span>}
                  <span style={{ color: DIM, fontSize: 12 }}>{c.sentAt ? new Date(c.sentAt).toLocaleDateString("en-US") : new Date(c.createdAt).toLocaleDateString("en-US")}</span>
                  {c.status === "draft" && (
                    <button
                      onClick={() => sendDraftCampaign(c.id)}
                      style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px", color: AMBER, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Send size={11} /> Send
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
