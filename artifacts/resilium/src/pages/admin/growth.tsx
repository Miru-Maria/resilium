import React, { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "./layout";
import {
  Loader2, RefreshCw, Send, Users, Mail, TrendingUp, GitBranch,
  CheckCircle, XCircle, Clock, AlertCircle, Sparkles, Megaphone,
  ChevronDown, ChevronUp, Play, Plus,
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

  const [refStats, setRefStats] = useState<ReferralStats | null>(null);
  const [refLoading, setRefLoading] = useState(true);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campLoading, setCampLoading] = useState(true);

  const [blogGenerating, setBlogGenerating] = useState(false);
  const [blogResult, setBlogResult] = useState<{ title: string; slug: string } | null>(null);
  const [blogError, setBlogError] = useState<string | null>(null);

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

  useEffect(() => { loadDrip(); loadReferrals(); loadCampaigns(); }, []);

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
    } finally { setBlogGenerating(false); }
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
          <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 14 }}>Drip sequences, referrals, broadcasts, and content generation — all in one place.</p>
        </div>

        {/* ── DRIP SYNC ──────────────────────────────────── */}
        <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Mail size={18} color={AMBER} />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>Email Drip Sequences</h2>
          </div>

          {dripLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}><Loader2 size={16} className="animate-spin" /> Loading…</div>
          ) : dripStats ? (
            <>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <StatCard label="Total queued" value={dripStats.total} />
                <StatCard label="Sent" value={dripStats.sent} color="#22c55e" />
                <StatCard label="Pending" value={dripStats.pending} color={AMBER} />
                <StatCard label="Cancelled" value={dripStats.cancelled} color="#6b7280" />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {dripStats.byType.map(t => (
                  <span key={t.emailType} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: MUTED }}>
                    <strong style={{ color: TEXT }}>{t.sent}</strong> {t.emailType}
                  </span>
                ))}
              </div>
              {dripStats.recentSent.length > 0 && (
                <div style={{ marginBottom: 20 }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Button
              onClick={syncDrip}
              disabled={dripSyncing}
              style={{ background: AMBER, color: "#0D1225", fontWeight: 700, border: "none", display: "flex", alignItems: "center", gap: 6 }}
            >
              {dripSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Sync Existing Users
            </Button>
            <span style={{ color: MUTED, fontSize: 12 }}>Enrolls any users not yet in the drip sequence based on their signup date.</span>
          </div>

          {dripSyncResult && (
            <div style={{ marginTop: 16, background: CARD_BG, borderRadius: 10, padding: "14px 18px", border: `1px solid ${BORDER}` }}>
              <CheckCircle size={14} color="#22c55e" style={{ display: "inline", marginRight: 6 }} />
              <strong style={{ color: "#22c55e" }}>Sync complete.</strong>{" "}
              <span style={{ color: MUTED, fontSize: 13 }}>
                Enrolled <strong style={{ color: TEXT }}>{dripSyncResult.enrolled}</strong> new users,{" "}
                <strong style={{ color: TEXT }}>{dripSyncResult.skipped}</strong> already enrolled,{" "}
                {dripSyncResult.failed > 0 && <><strong style={{ color: "#ef4444" }}>{dripSyncResult.failed}</strong> failed. </>}
                Total: {dripSyncResult.total}
              </span>
            </div>
          )}
        </section>

        {/* ── REFERRALS ──────────────────────────────────── */}
        <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <GitBranch size={18} color={AMBER} />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>Referral Program</h2>
          </div>

          <div style={{ background: CARD_BG, borderRadius: 10, padding: "14px 18px", border: `1px solid ${BORDER}`, marginBottom: 20, fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
            Each user gets a unique referral link (<code style={{ color: TEXT, background: "#0D1225", padding: "1px 6px", borderRadius: 4 }}>resilium-platform.com?ref=CODE</code>) available via <code style={{ color: TEXT, background: "#0D1225", padding: "1px 6px", borderRadius: 4 }}>GET /api/referral/my-code</code>. When a new user signs up, the frontend should call <code style={{ color: TEXT, background: "#0D1225", padding: "1px 6px", borderRadius: 4 }}>POST /api/referral/claim</code> with the code from localStorage. When referrals convert to Pro, mark them here.
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

        {/* ── BLOG AUTO-GENERATION ───────────────────────── */}
        <section style={{ background: SECTION_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "24px 28px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Sparkles size={18} color={AMBER} />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>AI Blog Content Engine</h2>
          </div>
          <p style={{ margin: "0 0 20px", color: MUTED, fontSize: 13 }}>
            Every Monday at 08:00 UTC, a blog post draft is auto-generated targeting a rotating SEO keyword and saved to the Blog admin page for your review. You can also trigger generation manually below.
          </p>
          <div style={{ background: CARD_BG, borderRadius: 10, padding: "14px 18px", border: `1px solid ${BORDER}`, marginBottom: 20, fontSize: 13, color: MUTED }}>
            <strong style={{ color: TEXT }}>Keyword pool (15 topics):</strong> emergency fund, job loss prep, relocation checklist, disaster kit, mental resilience, income diversification, geopolitical risk, financial independence, and more — rotating weekly.
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
            <div style={{ color: MUTED, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No campaigns yet. Create your first one above.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {campaigns.map((c, i) => (
                <div key={c.id} style={{ padding: "14px 0", borderBottom: i < campaigns.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div style={{ color: MUTED, fontSize: 12, marginBottom: 4 }}>{c.subject}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: DIM }}>
                      <span>{SEGMENT_LABELS[c.segment] ?? c.segment}</span>
                      {c.status === "sent" && <span>✓ {c.sentCount} sent · {c.failedCount} failed</span>}
                      {c.sentAt && <span>{new Date(c.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                    </div>
                  </div>
                  {c.status === "draft" && (
                    <button
                      onClick={() => sendDraftCampaign(c.id)}
                      style={{ background: AMBER, color: "#0D1225", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
                    >
                      <Play size={12} /> Send now
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
