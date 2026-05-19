import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { AdminLayout } from "@/pages/admin/layout";
import {
  LI_POSTS, LI_BODY, LI_CTA, FOUNDER_POSTS,
  QUARTER_COLOR, PHASE_COLOR,
  type LIPost,
} from "@/pages/admin/linkedin-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Download, Copy, Check, Linkedin, User, Calendar,
  Target, BookOpen,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const FRAME_SIZE = 1080;
const PREVIEW_SIZE = 432;
const SCALE = PREVIEW_SIZE / FRAME_SIZE;

const AMBER = "#E08040";
const CREAM = "#EAD9BE";
const NAVY  = "#0D1225";
const FONT  = '"DM Sans", "Inter", system-ui, sans-serif';

// ─── Branded LinkedIn Graphic ─────────────────────────────────────────────────
function LinkedInFrame({ post, isFounder = false, founderTitle = "", founderBody = "" }: {
  post?: LIPost;
  isFounder?: boolean;
  founderTitle?: string;
  founderBody?: string;
}) {
  const hook        = post?.hook ?? founderTitle;
  const phase       = post?.phase ?? "Authority";
  const quarter     = post?.quarter ?? "";
  const weekLabel   = post ? `Week ${post.week}` : "Founder Series";
  const dateLabel   = post?.date ?? "";
  const phaseColors: Record<string, string> = {
    Awareness:  "#38bdf8",
    Authority:  "#a78bfa",
    Conversion: AMBER,
  };
  const accentColor = phaseColors[phase] ?? AMBER;

  // For founder posts, show opening lines of body instead of hook
  const bodyPreview = isFounder
    ? founderBody.split("\n").filter(Boolean).slice(0, 3).join("\n")
    : "";

  return (
    <div style={{
      width: FRAME_SIZE, height: FRAME_SIZE,
      position: "relative", overflow: "hidden",
      fontFamily: FONT, backgroundColor: NAVY,
    }}>
      {/* Background image */}
      <img
        src={`${BASE}/instagram/bg-single-image.png`}
        alt=""
        crossOrigin="anonymous"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Dark gradient overlay for readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, rgba(13,18,37,0.55) 0%, rgba(13,18,37,0.75) 100%)",
      }} />

      {/* Content */}
      <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

        {/* Top row: logo + quarter/week badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: AMBER, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: NAVY, fontWeight: 900, fontSize: 22 }}>R</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color: AMBER, fontWeight: 700, fontSize: 28, letterSpacing: 2, textTransform: "uppercase" }}>RESILIUM</span>
              <span style={{ color: CREAM, opacity: 0.5, fontSize: 18, letterSpacing: 1 }}>resilium-platform.com</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            {quarter && (
              <div style={{
                background: `${accentColor}22`,
                border: `1.5px solid ${accentColor}55`,
                borderRadius: 8,
                padding: "6px 16px",
                color: accentColor,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 1,
              }}>
                {quarter}
              </div>
            )}
            <div style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "5px 14px",
              color: CREAM,
              fontSize: 20,
              opacity: 0.7,
            }}>
              {isFounder ? "Founder Series" : weekLabel} {dateLabel ? `· ${dateLabel}` : ""}
            </div>
          </div>
        </div>

        {/* Center: Hook / title */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
          {/* Phase label */}
          {!isFounder && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 3, background: accentColor, borderRadius: 2 }} />
              <span style={{ color: accentColor, fontSize: 22, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
                {phase} — {post?.phaseGoal}
              </span>
            </div>
          )}

          {isFounder && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 3, background: AMBER, borderRadius: 2 }} />
              <span style={{ color: AMBER, fontSize: 22, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
                Founder Thought-Leadership
              </span>
            </div>
          )}

          {/* Hook / title — main text */}
          <div style={{
            fontSize: hook.length > 60 ? 64 : 74,
            fontWeight: 800,
            color: CREAM,
            lineHeight: 1.2,
            whiteSpace: "pre-line",
          }}>
            {hook}
          </div>

          {/* Founder: body preview */}
          {isFounder && bodyPreview && (
            <div style={{
              fontSize: 34,
              color: CREAM,
              opacity: 0.65,
              lineHeight: 1.55,
              whiteSpace: "pre-line",
              fontWeight: 400,
            }}>
              {bodyPreview}
            </div>
          )}

          {/* Graphic direction brief */}
          {!isFounder && post?.graphicDirection && (
            <div style={{
              background: "rgba(224,128,64,0.10)",
              border: `1px solid ${AMBER}40`,
              borderRadius: 12,
              padding: "18px 24px",
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
            }}>
              <span style={{ color: AMBER, fontSize: 22, marginTop: 2 }}>✦</span>
              <div>
                <span style={{ color: AMBER, fontSize: 18, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                  Canva direction:{" "}
                </span>
                <span style={{ color: CREAM, fontSize: 22, opacity: 0.8, lineHeight: 1.4 }}>
                  {post.graphicDirection}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom row: CTA + brand tagline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{
            background: AMBER,
            borderRadius: 10,
            padding: "14px 30px",
            color: NAVY,
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: 0.5,
          }}>
            Take the free assessment →
          </div>
          <span style={{ color: CREAM, opacity: 0.4, fontSize: 20, letterSpacing: 1 }}>
            Calm. Grounded. Intelligent.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline" size="sm"
      className="gap-1.5 text-xs h-7"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = "calendar" | "founder";

export default function AdminLinkedInPage() {
  const [tab,         setTab]         = useState<Tab>("calendar");
  const [selectedId,  setSelectedId]  = useState<number>(1);
  const [founderId,   setFounderId]   = useState<string>("fl-1");
  const [downloading, setDownloading] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const post        = LI_POSTS.find(p => p.id === selectedId) ?? LI_POSTS[0];
  const founderPost = FOUNDER_POSTS.find(p => p.id === founderId) ?? FOUNDER_POSTS[0];

  const isCalendar = tab === "calendar";

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true, width: FRAME_SIZE, height: FRAME_SIZE, pixelRatio: 1,
      });
      const a      = document.createElement("a");
      a.href       = dataUrl;
      a.download   = isCalendar
        ? `resilium-li-w${post.week}-${post.date.replace(/[, ]+/g, "-")}.png`
        : `resilium-li-founder-${founderPost.id}.png`;
      a.click();
    } catch (e) {
      console.error("Download failed", e);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Full post copy (hook + body + CTA)
  const fullPostCopy = isCalendar
    ? `${post.hook}\n\n${LI_BODY}\n\n${LI_CTA}`
    : `${founderPost.body}\n\n${founderPost.cta}`;

  // Group calendar posts by quarter
  const quarters = Array.from(new Set(LI_POSTS.map(p => p.quarter)));

  return (
    <AdminLayout activeSection="linkedin">
      <div className="flex h-screen overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-72 border-r bg-background overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center gap-2 mb-1">
              <Linkedin className="w-4 h-4 text-[#E08040]" />
              <span className="font-bold text-sm">LinkedIn Studio</span>
            </div>
            <p className="text-[11px] text-muted-foreground">May–Dec 2026 · 32 weekly posts</p>

            {/* Tab switcher */}
            <div className="flex gap-1 mt-3 p-1 bg-muted/50 rounded-lg">
              <button
                onClick={() => setTab("calendar")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  tab === "calendar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                <Calendar className="w-3 h-3" /> Calendar
              </button>
              <button
                onClick={() => setTab("founder")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  tab === "founder" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                <User className="w-3 h-3" /> Founder
              </button>
            </div>
          </div>

          <nav className="p-2">
            {tab === "calendar" && quarters.map(q => {
              const qPosts = LI_POSTS.filter(p => p.quarter === q);
              return (
                <div key={q} className="mb-3">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {q}
                  </div>
                  {qPosts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-all",
                        selectedId === p.id
                          ? "bg-[#E08040]/10 border border-[#E08040]/30"
                          : "hover:bg-muted/50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                          PHASE_COLOR[p.phase]
                        )}>
                          {p.phase}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">W{p.week}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">{p.hook}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{p.date}</p>
                    </button>
                  ))}
                </div>
              );
            })}

            {tab === "founder" && FOUNDER_POSTS.map(fp => (
              <button
                key={fp.id}
                onClick={() => setFounderId(fp.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all",
                  founderId === fp.id
                    ? "bg-[#E08040]/10 border border-[#E08040]/30"
                    : "hover:bg-muted/50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3 h-3 text-[#E08040]" />
                  <span className="text-[10px] font-semibold text-[#E08040] uppercase tracking-wide">Thought-Leadership</span>
                </div>
                <p className="text-xs font-semibold text-foreground">{fp.title}</p>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main Studio ── */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="max-w-4xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                {isCalendar ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border", QUARTER_COLOR[post.quarter])}>
                        {post.quarter}
                      </span>
                      <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border", PHASE_COLOR[post.phase])}>
                        <Target className="w-3 h-3 mr-1" />{post.phase}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md font-medium">
                        Week {post.week} · {post.date}
                      </span>
                    </div>
                    <h1 className="text-base font-bold text-foreground leading-snug max-w-xl">{post.hook}</h1>
                    <p className="text-xs text-muted-foreground mt-1">Goal: {post.phaseGoal}</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border bg-amber-500/20 text-amber-300 border-amber-500/30">
                        <User className="w-3 h-3 mr-1" /> Founder Series
                      </span>
                    </div>
                    <h1 className="text-base font-bold text-foreground">{founderPost.title}</h1>
                  </>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
                className="gap-1.5 text-xs bg-[#E08040] hover:bg-[#E08040]/90 text-white flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading ? "Exporting…" : "Download graphic"}
              </Button>
            </div>

            {/* Preview + details */}
            <div className="flex gap-6 items-start">
              {/* Preview */}
              <div className="flex-shrink-0 space-y-2">
                <div style={{
                  width: PREVIEW_SIZE, height: PREVIEW_SIZE,
                  overflow: "hidden", position: "relative",
                  borderRadius: 12,
                  boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
                }}>
                  <div style={{
                    transform: `scale(${SCALE})`,
                    transformOrigin: "top left",
                    position: "absolute",
                    width: FRAME_SIZE, height: FRAME_SIZE,
                  }}>
                    {isCalendar
                      ? <LinkedInFrame post={post} />
                      : <LinkedInFrame isFounder founderTitle={founderPost.title} founderBody={founderPost.body} />
                    }
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  {FRAME_SIZE}×{FRAME_SIZE}px · PNG export
                </p>
              </div>

              {/* Canva direction + hook */}
              <div className="flex-1 min-w-0 space-y-4">
                {isCalendar && (
                  <div className="bg-[#E08040]/5 border border-[#E08040]/20 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-[#E08040] uppercase tracking-widest mb-2">
                      ✦ Canva graphic direction
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{post.graphicDirection}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Dark navy background · Amber highlights · Warm cream typography · Premium, calm, not alarmist
                    </p>
                  </div>
                )}

                <div className="bg-background border border-border/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hook (opening line)</p>
                    <CopyBtn text={isCalendar ? post.hook : founderPost.title} label="Copy hook" />
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">
                    {isCalendar ? post.hook : founderPost.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Post body */}
            <div className="bg-background border border-border/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Post body</p>
                <CopyBtn text={isCalendar ? LI_BODY : founderPost.body} label="Copy body" />
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {isCalendar ? LI_BODY : founderPost.body}
              </p>
            </div>

            {/* CTA */}
            <div className="bg-background border border-border/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">CTA</p>
                <CopyBtn text={isCalendar ? LI_CTA : founderPost.cta} label="Copy CTA" />
              </div>
              <p className="text-sm font-semibold text-[#E08040]">
                {isCalendar ? LI_CTA : founderPost.cta}
              </p>
            </div>

            {/* Full post combined */}
            <div className="bg-[#E08040]/5 border border-[#E08040]/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#E08040] uppercase tracking-widest">Full post (hook + body + CTA)</p>
                <CopyBtn text={fullPostCopy} label="Copy full post" />
              </div>
              <p className="text-xs text-muted-foreground">Paste directly into LinkedIn. The hook is your opening line — post it before the body.</p>
            </div>
          </div>
        </main>
      </div>

      {/* ── Hidden capture target ── */}
      <div style={{ position: "fixed", top: -9999, left: -9999, zIndex: -1 }}>
        <div ref={captureRef}>
          {isCalendar
            ? <LinkedInFrame post={post} />
            : <LinkedInFrame isFounder founderTitle={founderPost.title} founderBody={founderPost.body} />
          }
        </div>
      </div>
    </AdminLayout>
  );
}
