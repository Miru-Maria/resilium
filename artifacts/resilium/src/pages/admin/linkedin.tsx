import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { AdminLayout } from "@/pages/admin/layout";
import {
  LI_POSTS, LI_CTA, FOUNDER_POSTS,
  QUARTER_COLOR, PHASE_COLOR,
  type LIPost,
} from "@/pages/admin/linkedin-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Download, Copy, Check, Linkedin, User, Calendar,
  Target, BookOpen, ChevronDown, ChevronRight,
} from "lucide-react";

const BASE       = import.meta.env.BASE_URL.replace(/\/$/, "");
const FRAME_SIZE = 1080;
const PREV_SIZE  = 432;
const SCALE      = PREV_SIZE / FRAME_SIZE;
const FONT       = '"DM Sans", "Inter", system-ui, sans-serif';

// ─── Color stories ────────────────────────────────────────────────────────────
interface ColorStory {
  key:      string;
  name:     string;
  bg:       string;
  accent:   string;
  text:     string;
  gradient: string;
  overlay:  string;
}

const COLOR_STORIES: ColorStory[] = [
  {
    key: "brand", name: "Resilium Brand",
    bg: "#0D1225", accent: "#E08040", text: "#EAD9BE",
    gradient: "linear-gradient(160deg, rgba(13,18,37,0.55) 0%, rgba(13,18,37,0.78) 100%)",
    overlay:  "rgba(13,18,37,0.40)",
  },
  {
    key: "earth", name: "Warm Earth",
    bg: "#1A0E08", accent: "#C8613A", text: "#EDD5BB",
    gradient: "linear-gradient(160deg, rgba(26,14,8,0.60) 0%, rgba(26,14,8,0.82) 100%)",
    overlay:  "rgba(26,14,8,0.45)",
  },
  {
    key: "slate", name: "Coastal Slate",
    bg: "#0B1521", accent: "#3D9B8A", text: "#D8EBE6",
    gradient: "linear-gradient(160deg, rgba(11,21,33,0.58) 0%, rgba(11,21,33,0.80) 100%)",
    overlay:  "rgba(11,21,33,0.42)",
  },
];

// ─── Logo mark ────────────────────────────────────────────────────────────────
function LogoMark({ size = 42, accent }: { size?: number; accent: string }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.24),
      background: accent,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: Math.round(size * 0.18), flexShrink: 0,
    }}>
      <img
        src={`${BASE}/logo.png`}
        alt="Resilium"
        crossOrigin="anonymous"
        style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0)" }}
      />
    </div>
  );
}

// ─── Visual treatment system ───────────────────────────────────────────────────
type Treatment = "standard" | "hero" | "data" | "quote" | "split" | "geometric";

const TREATMENT_MAP: Record<number, Treatment> = {
  1:  "standard",  2:  "hero",      3:  "geometric",
  4:  "data",      5:  "quote",     6:  "split",
  7:  "standard",  8:  "quote",     9:  "hero",
  10: "geometric", 11: "data",      12: "data",
  13: "split",     14: "data",      15: "data",
  16: "data",      17: "hero",      18: "quote",
  19: "standard",  20: "hero",      21: "split",
  22: "geometric", 23: "data",      24: "quote",
  25: "standard",  26: "data",      27: "hero",
  28: "data",      29: "geometric", 30: "split",
  31: "quote",     32: "hero",
  33: "standard",  34: "quote",     35: "data",
  36: "data",      37: "geometric", 38: "split",
  39: "data",      40: "quote",     41: "standard",
  42: "hero",      43: "data",      44: "geometric",
  45: "hero",
};

// ─── Branded LinkedIn graphic ─────────────────────────────────────────────────
function LinkedInFrame({
  post, isFounder = false, founderTitle = "", founderBody = "", colors,
}: {
  post?:         LIPost;
  isFounder?:    boolean;
  founderTitle?: string;
  founderBody?:  string;
  colors:        ColorStory;
}) {
  const hook        = post?.hook ?? founderTitle;
  const phase       = post?.phase ?? "Authority";
  const phaseColors: Record<string, string> = {
    Awareness:  "#38bdf8",
    Authority:  "#a78bfa",
    Conversion: colors.accent,
    Retention:  "#34d399",
  };
  const accentColor = phaseColors[phase] ?? colors.accent;
  const treatment: Treatment = isFounder ? "standard" : (TREATMENT_MAP[post?.id ?? 1] ?? "standard");

  const bodyPreview = isFounder
    ? founderBody.split("\n").filter(Boolean).slice(0, 3).join("\n")
    : "";

  const hookSize = hook.length > 70 ? 58 : hook.length > 55 ? 64 : 74;

  // ─── Shared full-bleed content overlay ──────────────────────────────────────
  const FullBleedContent = () => (
    <div style={{
      position: "absolute", inset: 0, padding: 80,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <LogoMark size={42} accent={colors.accent} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ color: colors.accent, fontWeight: 700, fontSize: 28, letterSpacing: 2, textTransform: "uppercase" }}>RESILIUM</span>
          <span style={{ color: colors.text, opacity: 0.5, fontSize: 18, letterSpacing: 1 }}>resilium-platform.com</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ width: 40, height: 3, background: accentColor, borderRadius: 2 }} />
          <div style={{ fontSize: hookSize, fontWeight: 800, color: colors.text, lineHeight: 1.2, whiteSpace: "pre-line" }}>
            {hook}
          </div>
          {isFounder && bodyPreview && (
            <div style={{ fontSize: 34, color: colors.text, opacity: 0.65, lineHeight: 1.55, whiteSpace: "pre-line", fontWeight: 400 }}>
              {bodyPreview}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ background: colors.accent, borderRadius: 10, padding: "14px 30px", color: colors.bg, fontWeight: 800, fontSize: 26, letterSpacing: 0.5 }}>
          Take the free assessment →
        </div>
        <span style={{ color: colors.text, opacity: 0.4, fontSize: 20, letterSpacing: 1 }}>
          Calm. Grounded. Intelligent.
        </span>
      </div>
    </div>
  );

  // ─── Split treatment — structurally different layout ─────────────────────────
  if (treatment === "split") {
    return (
      <div style={{ width: FRAME_SIZE, height: FRAME_SIZE, position: "relative", overflow: "hidden", fontFamily: FONT, backgroundColor: colors.bg, display: "flex" }}>

        {/* Left accent panel */}
        <div style={{ width: 340, height: "100%", flexShrink: 0, background: accentColor, position: "relative" }}>
          <div style={{ position: "absolute", top: 80, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <LogoMark size={56} accent={colors.bg} />
          </div>
          {/* Decorative circle */}
          <div style={{ position: "absolute", bottom: -140, left: -140, width: 520, height: 520, borderRadius: "50%", background: colors.bg, opacity: 0.08 }} />
        </div>

        {/* Right dark panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "80px 70px" }}>
          <div>
            <span style={{ color: accentColor, fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7 }}>resilium-platform.com</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ width: 40, height: 3, background: accentColor, borderRadius: 2 }} />
            <div style={{ fontSize: hook.length > 60 ? 56 : 64, fontWeight: 800, color: colors.text, lineHeight: 1.2 }}>
              {hook}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: accentColor, borderRadius: 10, padding: "14px 28px", color: colors.bg, fontWeight: 800, fontSize: 23, alignSelf: "flex-start" }}>
              Take the free assessment →
            </div>
            <span style={{ color: colors.text, opacity: 0.35, fontSize: 17, letterSpacing: 1 }}>Calm. Grounded. Intelligent.</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Full-bleed treatments ────────────────────────────────────────────────────
  const bgSrc: Record<Treatment, string> = {
    standard: `${BASE}/instagram/bg-single-image.png`,
    hero:     `${BASE}/bg-hero.png`,
    data:     `${BASE}/instagram/bg-carousel-dark.png`,
    quote:    `${BASE}/bg-quote.png`,
    geometric:`${BASE}/instagram/bg-carousel-dark.png`,
    split:    "",
  };
  const bgOpacity: Record<Treatment, number> = {
    standard: 1, hero: 1, data: 0.30, quote: 1, geometric: 0.18, split: 1,
  };
  const overlayGradient: Record<Treatment, string> = {
    standard: colors.gradient,
    hero:     `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, ${colors.bg}bb 65%, ${colors.bg}ee 100%)`,
    data:     `linear-gradient(160deg, ${colors.bg}80 0%, ${colors.bg}d0 100%)`,
    quote:    colors.gradient,
    geometric:`linear-gradient(160deg, ${colors.bg}70 0%, ${colors.bg}cc 100%)`,
    split:    "",
  };

  return (
    <div style={{ width: FRAME_SIZE, height: FRAME_SIZE, position: "relative", overflow: "hidden", fontFamily: FONT, backgroundColor: colors.bg }}>

      {/* Background image */}
      <img
        src={bgSrc[treatment]} alt="" crossOrigin="anonymous"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: bgOpacity[treatment] }}
      />

      {/* Data treatment: horizontal grid lines + left accent bar */}
      {treatment === "data" && <>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", top: `${Math.round((i + 1) * 100 / 15)}%`, left: 0, right: 0, height: 1, background: accentColor, opacity: 0.12 }} />
        ))}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: accentColor }} />
      </>}

      {/* Quote treatment: giant decorative quotation mark */}
      {treatment === "quote" && (
        <div style={{ position: "absolute", top: -100, left: 40, fontSize: 640, fontWeight: 900, color: accentColor, opacity: 0.07, lineHeight: 1, userSelect: "none", fontFamily: "Georgia, 'Times New Roman', serif" }}>
          "
        </div>
      )}

      {/* Geometric treatment: large circles */}
      {treatment === "geometric" && <>
        <div style={{ position: "absolute", top: -240, right: -240, width: 760, height: 760, borderRadius: "50%", background: accentColor, opacity: 0.08 }} />
        <div style={{ position: "absolute", bottom: -180, left: -140, width: 540, height: 540, borderRadius: "50%", border: `3px solid ${accentColor}`, opacity: 0.13, background: "transparent" }} />
        <div style={{ position: "absolute", top: "40%", right: 80, width: 110, height: 110, borderRadius: "50%", border: `2px solid ${accentColor}`, opacity: 0.20, background: "transparent" }} />
      </>}

      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: overlayGradient[treatment] }} />

      {/* Content */}
      <FullBleedContent />
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline" size="sm" className="gap-1.5 text-xs h-7"
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

// ─── Color story selector ─────────────────────────────────────────────────────
function StoryPicker({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  const current = COLOR_STORIES.find(s => s.key === value) ?? COLOR_STORIES[0];
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hidden sm:block">
        Color story
      </span>
      <div className="flex gap-1.5 items-center">
        {COLOR_STORIES.map(s => (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            title={s.name}
            className={cn(
              "w-5 h-5 rounded-full transition-all flex-shrink-0",
              value === s.key
                ? "ring-2 ring-offset-2 ring-foreground/40 scale-110"
                : "opacity-50 hover:opacity-80",
            )}
            style={{ background: s.accent }}
          />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground font-medium">{current.name}</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Tab = "calendar" | "founder";

export default function AdminLinkedInPage() {
  const [tab,              setTab]              = useState<Tab>("calendar");
  const [selectedId,       setSelectedId]       = useState<number>(1);
  const [founderId,        setFounderId]        = useState<string>("fl-1");
  const [downloading,      setDownloading]      = useState(false);
  const [storyKey,         setStoryKey]         = useState("brand");
  const [collapsedQuarters, setCollapsedQuarters] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem("li-collapsed-quarters");
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch { return new Set(); }
  });
  const captureRef = useRef<HTMLDivElement>(null);

  const toggleQuarter = (q: string) => {
    setCollapsedQuarters(prev => {
      const next = new Set(prev);
      if (next.has(q)) next.delete(q); else next.add(q);
      localStorage.setItem("li-collapsed-quarters", JSON.stringify([...next]));
      return next;
    });
  };

  const post        = LI_POSTS.find(p => p.id === selectedId) ?? LI_POSTS[0];
  const founderPost = FOUNDER_POSTS.find(p => p.id === founderId) ?? FOUNDER_POSTS[0];
  const isCalendar  = tab === "calendar";
  const colors      = COLOR_STORIES.find(s => s.key === storyKey) ?? COLOR_STORIES[0];

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true, width: FRAME_SIZE, height: FRAME_SIZE, pixelRatio: 1,
      });
      const a    = document.createElement("a");
      a.href     = dataUrl;
      a.download = isCalendar
        ? `resilium-li-w${post.week}-${post.date.replace(/[, ]+/g, "-")}-${storyKey}.png`
        : `resilium-li-founder-${founderPost.id}-${storyKey}.png`;
      a.click();
    } catch (e) {
      console.error("Download failed", e);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const fullPostCopy = isCalendar
    ? `${post.hook}\n\n${post.body}\n\n${LI_CTA}`
    : `${founderPost.body}\n\n${founderPost.cta}`;

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

            <div className="flex gap-1 mt-3 p-1 bg-muted/50 rounded-lg">
              <button
                onClick={() => setTab("calendar")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  tab === "calendar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
                )}
              >
                <Calendar className="w-3 h-3" /> Calendar
              </button>
              <button
                onClick={() => setTab("founder")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  tab === "founder" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
                )}
              >
                <User className="w-3 h-3" /> Founder
              </button>
            </div>
          </div>

          <nav className="p-2">
            {tab === "calendar" && quarters.map(q => {
              const qPosts   = LI_POSTS.filter(p => p.quarter === q);
              const collapsed = collapsedQuarters.has(q);
              const hasActive = qPosts.some(p => p.id === selectedId);
              return (
                <div key={q} className="mb-1">
                  <button
                    onClick={() => toggleQuarter(q)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors hover:bg-muted/50",
                      collapsed && hasActive && "bg-[#E08040]/8",
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      collapsed ? "text-muted-foreground/40" : "text-muted-foreground/70",
                    )}>
                      {q}
                    </span>
                    <ChevronDown className={cn(
                      "w-3 h-3 text-muted-foreground/40 transition-transform duration-200",
                      collapsed && "-rotate-90",
                    )} />
                  </button>
                  {!collapsed && (
                    <div className="mt-0.5 mb-2">
                      {qPosts.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedId(p.id)}
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-all",
                            selectedId === p.id
                              ? "bg-[#E08040]/10 border border-[#E08040]/30"
                              : "hover:bg-muted/50 border border-transparent",
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                              PHASE_COLOR[p.phase],
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
                  )}
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
                    : "hover:bg-muted/50 border border-transparent",
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

        {/* ── Main studio ── */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="max-w-4xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
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
              <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
                <StoryPicker value={storyKey} onChange={setStoryKey} />
                <Button
                  size="sm" onClick={handleDownload} disabled={downloading}
                  className="gap-1.5 text-xs bg-[#E08040] hover:bg-[#E08040]/90 text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloading ? "Exporting…" : "Download graphic"}
                </Button>
              </div>
            </div>

            {/* Preview + details */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 space-y-2">
                <div style={{
                  width: PREV_SIZE, height: PREV_SIZE,
                  overflow: "hidden", position: "relative",
                  borderRadius: 12, boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
                }}>
                  <div style={{
                    transform: `scale(${SCALE})`, transformOrigin: "top left",
                    position: "absolute", width: FRAME_SIZE, height: FRAME_SIZE,
                  }}>
                    {isCalendar
                      ? <LinkedInFrame post={post} colors={colors} />
                      : <LinkedInFrame isFounder founderTitle={founderPost.title} founderBody={founderPost.body} colors={colors} />
                    }
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  {FRAME_SIZE}×{FRAME_SIZE}px · PNG export
                </p>
              </div>

              {/* Design notes + hook */}
              <div className="flex-1 min-w-0 space-y-4">
                {isCalendar && (
                  <div className="bg-muted/40 border border-border/50 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      🔒 Internal design notes — not on graphic
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
                <CopyBtn text={isCalendar ? post.body : founderPost.body} label="Copy body" />
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {isCalendar ? post.body : founderPost.body}
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

            {/* Full post */}
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
            ? <LinkedInFrame post={post} colors={colors} />
            : <LinkedInFrame isFounder founderTitle={founderPost.title} founderBody={founderPost.body} colors={colors} />
          }
        </div>
      </div>
    </AdminLayout>
  );
}
