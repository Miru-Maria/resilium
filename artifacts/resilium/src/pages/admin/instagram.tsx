import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { AdminLayout } from "@/pages/admin/layout";
import {
  IG_POSTS, WEEKS, TYPE_LABEL, TYPE_COLOR, BG_MAP,
  type IGPost, type Slide,
} from "@/pages/admin/instagram-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, ChevronDown, Download, Copy, Check,
  Instagram, Images, ImageIcon, Quote,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const PREVIEW_SIZE = 432;
const FRAME_SIZE   = 1080;
const SCALE        = PREVIEW_SIZE / FRAME_SIZE;
const FONT         = '"DM Sans", "Inter", system-ui, sans-serif';

// ─── Color stories ────────────────────────────────────────────────────────────
interface ColorStory {
  key:     string;
  name:    string;
  bg:      string;
  accent:  string;
  text:    string;
  overlay: string;
}

const COLOR_STORIES: ColorStory[] = [
  {
    key: "brand", name: "Resilium Brand",
    bg: "#0D1225", accent: "#E08040", text: "#EAD9BE",
    overlay: "rgba(13,18,37,0.4)",
  },
  {
    key: "earth", name: "Warm Earth",
    bg: "#1A0E08", accent: "#C8613A", text: "#EDD5BB",
    overlay: "rgba(26,14,8,0.55)",
  },
  {
    key: "slate", name: "Coastal Slate",
    bg: "#0B1521", accent: "#3D9B8A", text: "#D8EBE6",
    overlay: "rgba(11,21,33,0.5)",
  },
];

// ─── Logo mark (replaces the old "R" text) ───────────────────────────────────
function LogoMark({ size = 36, accent }: { size?: number; accent: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.22),
      background: accent, display: "flex", alignItems: "center",
      justifyContent: "center", padding: Math.round(size * 0.18), flexShrink: 0,
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

// ─── Frame renderer ───────────────────────────────────────────────────────────
interface FrameProps {
  post:       IGPost;
  slideIndex: number;
  colors:     ColorStory;
}

function FrameContent({ post, slideIndex, colors }: FrameProps) {
  const isCarousel = post.type === "carousel";
  const isSingle   = post.type === "single";
  const isQuote    = post.type === "quote";

  let bg = `${BASE}/instagram/bg-carousel-dark.png`;
  if (isCarousel && post.slides) {
    const slide = post.slides[slideIndex];
    bg = slide.bg === "alt"
      ? `${BASE}/instagram/bg-carousel-alt.png`
      : `${BASE}/instagram/bg-carousel-dark.png`;
  } else if (isSingle) {
    bg = `${BASE}/instagram/bg-single-image.png`;
  } else if (isQuote) {
    bg = `${BASE}/instagram/bg-quote.png`;
  }

  const totalSlides = post.slides?.length ?? 1;
  const slide: Slide | null = isCarousel && post.slides ? post.slides[slideIndex] : null;

  return (
    <div style={{
      width: FRAME_SIZE, height: FRAME_SIZE,
      position: "relative", overflow: "hidden",
      fontFamily: FONT, backgroundColor: colors.bg,
    }}>
      {/* Background image */}
      <img
        src={bg} alt="" crossOrigin="anonymous"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Color story tint overlay (helps non-brand stories blend with the bg image) */}
      <div style={{
        position: "absolute", inset: 0,
        background: colors.overlay,
      }} />

      {/* ── Hook slide ── */}
      {isCarousel && slide?.isHook && (
        <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogoMark size={36} accent={colors.accent} />
            <span style={{ color: colors.accent, fontWeight: 700, fontSize: 28, letterSpacing: 2, textTransform: "uppercase" }}>RESILIUM</span>
          </div>

          <div style={{ textAlign: "left", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 40, paddingBottom: 40 }}>
            {slide.lines.map((line, i) => (
              <div key={i} style={{
                fontSize: i === 0 ? 86 : 76,
                fontWeight: 900,
                color: i === 0 ? colors.text : colors.accent,
                lineHeight: 1.1,
                marginBottom: i < slide.lines.length - 1 ? 12 : 0,
                whiteSpace: "pre-line",
              }}>{line}</div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: colors.text, opacity: 0.5, fontSize: 26 }}>Calm. Grounded. Intelligent.</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {Array.from({ length: totalSlides }).map((_, i) => (
                <div key={i} style={{ width: i === 0 ? 28 : 14, height: 14, borderRadius: 7, background: i === 0 ? colors.accent : colors.text, opacity: i === 0 ? 1 : 0.35 }} />
              ))}
              <span style={{ color: colors.accent, fontSize: 28, marginLeft: 12 }}>→</span>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA slide ── */}
      {isCarousel && slide?.isCta && (
        <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
            {slide.lines.map((line, i) => {
              const isUrl = line.includes("resilium-platform.com");
              const isTitle = i === 0;
              return (
                <div key={i} style={{
                  fontSize: isUrl ? 44 : isTitle ? 60 : 42,
                  fontWeight: isUrl || isTitle ? 800 : 400,
                  color: isUrl || isTitle ? colors.accent : colors.text,
                  lineHeight: 1.3,
                  whiteSpace: "pre-line",
                  opacity: isUrl || isTitle ? 1 : 0.9,
                }}>{line}</div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogoMark size={32} accent={colors.accent} />
            <span style={{ color: colors.text, opacity: 0.6, fontSize: 24, letterSpacing: 1 }}>RESILIUM</span>
          </div>
        </div>
      )}

      {/* ── Content slide ── */}
      {isCarousel && slide && !slide.isHook && !slide.isCta && (
        <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {slide.lines.map((line, i) => (
                <div key={i} style={{
                  fontSize: i === 0 ? 60 : 40,
                  fontWeight: i === 0 ? 800 : 400,
                  color: i === 0 ? colors.accent : colors.text,
                  lineHeight: 1.4,
                  whiteSpace: "pre-line",
                  opacity: i === 0 ? 1 : 0.9,
                }}>{line}</div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogoMark size={32} accent={colors.accent} />
            <span style={{ color: colors.text, opacity: 0.6, fontSize: 24, letterSpacing: 1 }}>RESILIUM</span>
          </div>
        </div>
      )}

      {/* ── Single image ── */}
      {isSingle && (
        <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogoMark size={36} accent={colors.accent} />
            <span style={{ color: colors.accent, fontWeight: 700, fontSize: 26, letterSpacing: 2, textTransform: "uppercase" }}>RESILIUM</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
            {(post.imageLines ?? []).map((line, i) => (
              <div key={i} style={{
                fontSize: i === 0 && (post.imageLines?.length ?? 0) > 1 ? 52 : 48,
                fontWeight: i === 0 ? 700 : 400,
                color: i === 0 ? colors.accent : colors.text,
                lineHeight: 1.45,
                whiteSpace: "pre-line",
              }}>{line}</div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: colors.accent, fontSize: 32, fontWeight: 700 }}>resilium-platform.com</span>
            <span style={{ color: colors.text, opacity: 0.4, fontSize: 22, letterSpacing: 2 }}>LINK IN BIO</span>
          </div>
        </div>
      )}

      {/* ── Quote graphic ── */}
      {isQuote && (
        <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ fontSize: 200, lineHeight: 0.8, color: colors.accent, opacity: 0.25, fontWeight: 900, fontFamily: "Georgia, serif" }}>"</div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, marginTop: -60 }}>
            {(post.imageLines ?? []).map((line, i) => (
              <div key={i} style={{
                fontSize: i === 0 ? 62 : 44,
                fontWeight: i === 0 ? 600 : 500,
                color: i === 0 ? colors.text : colors.accent,
                lineHeight: 1.4,
                whiteSpace: "pre-line",
                fontStyle: i === 0 ? "italic" : "normal",
              }}>{line}</div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <LogoMark size={32} accent={colors.accent} />
              <span style={{ color: colors.text, opacity: 0.5, fontSize: 22, letterSpacing: 1 }}>RESILIUM</span>
            </div>
            <span style={{ color: colors.accent, opacity: 0.7, fontSize: 26, fontWeight: 600 }}>resilium-platform.com</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs h-7">
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

// ─── Post type icon ───────────────────────────────────────────────────────────
function TypeIcon({ type }: { type: IGPost["type"] }) {
  if (type === "carousel") return <Images className="w-3.5 h-3.5" />;
  if (type === "single")   return <ImageIcon className="w-3.5 h-3.5" />;
  return <Quote className="w-3.5 h-3.5" />;
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
export default function AdminInstagramPage() {
  const [selectedId,     setSelectedId]     = useState<number>(1);
  const [slideIndex,     setSlideIndex]     = useState(0);
  const [downloading,    setDownloading]    = useState(false);
  const [storyKey,       setStoryKey]       = useState("brand");
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem("ig-collapsed-weeks");
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch { return new Set(); }
  });
  const captureRef = useRef<HTMLDivElement>(null);

  const toggleWeek = (week: string) => {
    setCollapsedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week); else next.add(week);
      localStorage.setItem("ig-collapsed-weeks", JSON.stringify([...next]));
      return next;
    });
  };

  const post         = IG_POSTS.find(p => p.id === selectedId) ?? IG_POSTS[0];
  const totalSlides  = post.slides?.length ?? 1;
  const colors       = COLOR_STORIES.find(s => s.key === storyKey) ?? COLOR_STORIES[0];

  const selectPost = useCallback((id: number) => {
    setSelectedId(id);
    setSlideIndex(0);
  }, []);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true, width: FRAME_SIZE, height: FRAME_SIZE, pixelRatio: 1,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      const slideLabel = post.type === "carousel" ? `-slide${slideIndex + 1}` : "";
      a.download = `resilium-ig-${post.week}-${post.type}${slideLabel}-${storyKey}.png`;
      a.click();
    } catch (e) {
      console.error("Download failed", e);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!captureRef.current || post.type !== "carousel") return;
    setDownloading(true);
    try {
      for (let i = 0; i < totalSlides; i++) {
        setSlideIndex(i);
        await new Promise(r => setTimeout(r, 300));
        if (!captureRef.current) break;
        const dataUrl = await toPng(captureRef.current, { cacheBust: true, width: FRAME_SIZE, height: FRAME_SIZE, pixelRatio: 1 });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `resilium-ig-${post.week}-carousel-slide${i + 1}of${totalSlides}-${storyKey}.png`;
        a.click();
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (e) {
      console.error("Download all failed", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminLayout activeSection="instagram">
      <div className="flex h-screen overflow-hidden">

        {/* ── Left sidebar ── */}
        <aside className="w-72 border-r bg-background overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-[#E08040]" />
              <span className="font-bold text-sm">Instagram Studio</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">90-day content plan · 39 posts</p>
          </div>

          <nav className="p-2">
            {WEEKS.map(week => {
              const weekPosts  = IG_POSTS.filter(p => p.week === week);
              const weekNum    = parseInt(week.slice(1));
              const collapsed  = collapsedWeeks.has(week);
              const hasActive  = weekPosts.some(p => p.id === selectedId);
              return (
                <div key={week} className="mb-1">
                  <button
                    onClick={() => toggleWeek(week)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors hover:bg-muted/50 group",
                      collapsed && hasActive && "bg-[#E08040]/8",
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      collapsed ? "text-muted-foreground/40" : "text-muted-foreground/70",
                    )}>
                      Week {weekNum}
                    </span>
                    <ChevronDown className={cn(
                      "w-3 h-3 text-muted-foreground/40 transition-transform duration-200",
                      collapsed && "-rotate-90",
                    )} />
                  </button>
                  {!collapsed && (
                    <div className="mt-0.5 mb-2">
                      {weekPosts.map(p => (
                        <button
                          key={p.id}
                          onClick={() => selectPost(p.id)}
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-all",
                            selectedId === p.id
                              ? "bg-[#E08040]/10 border border-[#E08040]/30"
                              : "hover:bg-muted/50 border border-transparent",
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                              TYPE_COLOR[p.type],
                            )}>
                              <TypeIcon type={p.type} />
                              {p.day}
                            </span>
                            <span className="text-[10px] text-muted-foreground">#{p.id}</span>
                          </div>
                          <p className="text-xs font-medium text-foreground leading-snug truncate">{p.topic}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ── Main studio area ── */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="max-w-4xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border",
                    TYPE_COLOR[post.type],
                  )}>
                    <TypeIcon type={post.type} />
                    {TYPE_LABEL[post.type]}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md font-medium">{post.week} · {post.day}</span>
                  <span className="text-xs text-muted-foreground">Post #{post.id}</span>
                </div>
                <h1 className="text-lg font-bold text-foreground">{post.topic}</h1>
              </div>
              <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
                <StoryPicker value={storyKey} onChange={setStoryKey} />
                {post.type === "carousel" && (
                  <Button variant="outline" size="sm" onClick={handleDownloadAll} disabled={downloading} className="gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" />
                    All {totalSlides} slides
                  </Button>
                )}
                <Button
                  size="sm" onClick={handleDownload} disabled={downloading}
                  className="gap-1.5 text-xs bg-[#E08040] hover:bg-[#E08040]/90 text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloading ? "Exporting…" : `Download${post.type === "carousel" ? ` slide ${slideIndex + 1}` : ""}`}
                </Button>
              </div>
            </div>

            {/* Preview + controls */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 space-y-3">
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
                    <FrameContent post={post} slideIndex={slideIndex} colors={colors} />
                  </div>
                </div>

                {post.type === "carousel" && (
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={() => setSlideIndex(i => Math.max(0, i - 1))} disabled={slideIndex === 0} className="h-8 w-8 p-0">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-1.5">
                      {post.slides?.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSlideIndex(i)}
                          className={cn(
                            "rounded-full transition-all",
                            i === slideIndex ? "w-5 h-2.5 bg-[#E08040]" : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                          )}
                        />
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSlideIndex(i => Math.min(totalSlides - 1, i + 1))} disabled={slideIndex === totalSlides - 1} className="h-8 w-8 p-0">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground text-center">
                  {FRAME_SIZE}×{FRAME_SIZE}px · PNG export
                </p>
              </div>

              {/* Slide text content */}
              {post.type === "carousel" && post.slides && (
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Slide {slideIndex + 1} text
                  </h3>
                  <div className="space-y-2">
                    {post.slides[slideIndex].lines.map((line, i) => (
                      <div
                        key={i}
                        className="text-sm p-3 rounded-lg bg-background border border-border/60 leading-relaxed whitespace-pre-line"
                        style={{ color: i === 0 && !post.slides![slideIndex].isHook ? "#E08040" : undefined }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <CopyButton text={post.slides[slideIndex].lines.join("\n")} label="Copy slide text" />
                  </div>
                </div>
              )}

              {(post.type === "single" || post.type === "quote") && post.imageLines && (
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Image text
                  </h3>
                  <div className="space-y-2">
                    {post.imageLines.map((line, i) => (
                      <div key={i} className="text-sm p-3 rounded-lg bg-background border border-border/60 leading-relaxed whitespace-pre-line">
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <CopyButton text={post.imageLines.join("\n")} label="Copy image text" />
                  </div>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="bg-background border border-border/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Caption</h3>
                <CopyButton text={post.caption} label="Copy caption" />
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{post.caption}</p>
            </div>

            {/* Hashtags */}
            <div className="bg-background border border-border/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hashtags</h3>
                <CopyButton text={post.hashtags} label="Copy hashtags" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{post.hashtags}</p>
            </div>

            {/* Full post copy */}
            <div className="bg-[#E08040]/5 border border-[#E08040]/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#E08040] uppercase tracking-wider">Full post copy (caption + hashtags)</h3>
                <CopyButton text={`${post.caption}\n\n${post.hashtags}`} label="Copy all" />
              </div>
              <p className="text-xs text-muted-foreground">Ready to paste directly into Instagram.</p>
            </div>
          </div>
        </main>
      </div>

      {/* ── Hidden capture target ── */}
      <div style={{ position: "fixed", top: -9999, left: -9999, zIndex: -1 }}>
        <div ref={captureRef}>
          <FrameContent post={post} slideIndex={slideIndex} colors={colors} />
        </div>
      </div>
    </AdminLayout>
  );
}
