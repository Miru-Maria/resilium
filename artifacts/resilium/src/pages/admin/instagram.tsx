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
  ChevronLeft, ChevronRight, Download, Copy, Check,
  Instagram, Images, ImageIcon, Quote,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const PREVIEW_SIZE = 432;
const FRAME_SIZE = 1080;
const SCALE = PREVIEW_SIZE / FRAME_SIZE;

// ─── Colors & fonts ───────────────────────────────────────────────────────────
const AMBER = "#E08040";
const CREAM = "#EAD9BE";
const NAVY  = "#0D1225";
const FONT  = '"DM Sans", "Inter", system-ui, sans-serif';

// ─── Frame renderer (used for both preview and PNG capture) ───────────────────
interface FrameProps {
  post: IGPost;
  slideIndex: number;
}

function FrameContent({ post, slideIndex }: FrameProps) {
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
      fontFamily: FONT, backgroundColor: NAVY,
    }}>
      {/* Background */}
      <img
        src={bg}
        alt=""
        crossOrigin="anonymous"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Carousel: Hook slide */}
      {isCarousel && slide?.isHook && (
        <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: AMBER, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: NAVY, fontWeight: 900, fontSize: 20 }}>R</span>
            </div>
            <span style={{ color: AMBER, fontWeight: 700, fontSize: 28, letterSpacing: 2, textTransform: "uppercase" }}>RESILIUM</span>
          </div>

          {/* Headline */}
          <div style={{ textAlign: "left", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 40, paddingBottom: 40 }}>
            {slide.lines.map((line, i) => (
              <div key={i} style={{
                fontSize: i === 0 ? 86 : 76,
                fontWeight: 900,
                color: i === 0 ? CREAM : AMBER,
                lineHeight: 1.1,
                marginBottom: i < slide.lines.length - 1 ? 12 : 0,
                whiteSpace: "pre-line",
              }}>{line}</div>
            ))}
          </div>

          {/* Swipe hint + dots */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: CREAM, opacity: 0.5, fontSize: 26 }}>Calm. Grounded. Intelligent.</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {Array.from({ length: totalSlides }).map((_, i) => (
                <div key={i} style={{ width: i === 0 ? 28 : 14, height: 14, borderRadius: 7, background: i === 0 ? AMBER : CREAM, opacity: i === 0 ? 1 : 0.35 }} />
              ))}
              <span style={{ color: AMBER, fontSize: 28, marginLeft: 12 }}>→</span>
            </div>
          </div>
        </div>
      )}

      {/* Carousel: CTA slide */}
      {isCarousel && slide?.isCta && (
        <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ textAlign: "right", color: AMBER, fontSize: 28, opacity: 0.7, fontWeight: 600 }}>
            {slideIndex + 1} / {totalSlides}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
            {slide.lines.map((line, i) => {
              const isUrl = line.includes("resilium-platform.com");
              return (
                <div key={i} style={{
                  fontSize: isUrl ? 44 : 42,
                  fontWeight: isUrl ? 800 : 500,
                  color: isUrl ? AMBER : CREAM,
                  lineHeight: 1.3,
                  whiteSpace: "pre-line",
                }}>{line}</div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: AMBER, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: NAVY, fontWeight: 900, fontSize: 18 }}>R</span>
            </div>
            <span style={{ color: CREAM, opacity: 0.5, fontSize: 24, letterSpacing: 1 }}>RESILIUM</span>
          </div>
        </div>
      )}

      {/* Carousel: Content slide */}
      {isCarousel && slide && !slide.isHook && !slide.isCta && (
        <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ textAlign: "right", color: AMBER, fontSize: 26, opacity: 0.6, fontWeight: 600 }}>
            {slideIndex + 1} / {totalSlides}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
            {slide.lines.map((line, i) => (
              <div key={i} style={{
                fontSize: i === 0 ? 60 : 40,
                fontWeight: i === 0 ? 800 : 400,
                color: i === 0 ? AMBER : CREAM,
                lineHeight: 1.4,
                whiteSpace: "pre-line",
                opacity: i === 0 ? 1 : 0.9,
              }}>{line}</div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: AMBER, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: NAVY, fontWeight: 900, fontSize: 18 }}>R</span>
            </div>
            <span style={{ color: CREAM, opacity: 0.4, fontSize: 24, letterSpacing: 1 }}>RESILIUM</span>
          </div>
        </div>
      )}

      {/* Single Image */}
      {isSingle && (
        <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: AMBER, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: NAVY, fontWeight: 900, fontSize: 20 }}>R</span>
            </div>
            <span style={{ color: AMBER, fontWeight: 700, fontSize: 26, letterSpacing: 2, textTransform: "uppercase" }}>RESILIUM</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
            {(post.imageLines ?? []).map((line, i) => (
              <div key={i} style={{
                fontSize: i === 0 && (post.imageLines?.length ?? 0) > 1 ? 52 : 48,
                fontWeight: i === 0 ? 700 : 400,
                color: i === 0 ? AMBER : CREAM,
                lineHeight: 1.45,
                whiteSpace: "pre-line",
              }}>{line}</div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: AMBER, fontSize: 32, fontWeight: 700 }}>resilium-platform.com</span>
            <span style={{ color: CREAM, opacity: 0.4, fontSize: 22, letterSpacing: 2 }}>LINK IN BIO</span>
          </div>
        </div>
      )}

      {/* Quote Graphic */}
      {isQuote && (
        <div style={{ position: "absolute", inset: 0, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Decorative quote mark */}
          <div style={{ fontSize: 200, lineHeight: 0.8, color: AMBER, opacity: 0.25, fontWeight: 900, fontFamily: "Georgia, serif" }}>"</div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, marginTop: -60 }}>
            {(post.imageLines ?? []).map((line, i) => (
              <div key={i} style={{
                fontSize: i === 0 ? 62 : 44,
                fontWeight: i === 0 ? 600 : 500,
                color: i === 0 ? CREAM : AMBER,
                lineHeight: 1.4,
                whiteSpace: "pre-line",
                fontStyle: i === 0 ? "italic" : "normal",
              }}>{line}</div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: AMBER, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: NAVY, fontWeight: 900, fontSize: 18 }}>R</span>
              </div>
              <span style={{ color: CREAM, opacity: 0.5, fontSize: 22, letterSpacing: 1 }}>RESILIUM</span>
            </div>
            <span style={{ color: AMBER, opacity: 0.7, fontSize: 26, fontWeight: 600 }}>resilium-platform.com</span>
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminInstagramPage() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [slideIndex, setSlideIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const post = IG_POSTS.find(p => p.id === selectedId) ?? IG_POSTS[0];
  const totalSlides = post.slides?.length ?? 1;

  const selectPost = useCallback((id: number) => {
    setSelectedId(id);
    setSlideIndex(0);
  }, []);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        pixelRatio: 1,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      const slideLabel = post.type === "carousel" ? `-slide${slideIndex + 1}` : "";
      a.download = `resilium-ig-${post.week}-${post.type}${slideLabel}.png`;
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
        a.download = `resilium-ig-${post.week}-carousel-slide${i + 1}of${totalSlides}.png`;
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

        {/* ── Left Sidebar: Post List ── */}
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
              const weekPosts = IG_POSTS.filter(p => p.week === week);
              const weekNum = parseInt(week.slice(1));
              return (
                <div key={week} className="mb-3">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Week {weekNum}
                  </div>
                  {weekPosts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => selectPost(p.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-all",
                        selectedId === p.id
                          ? "bg-[#E08040]/10 border border-[#E08040]/30"
                          : "hover:bg-muted/50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                          TYPE_COLOR[p.type]
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
              );
            })}
          </nav>
        </aside>

        {/* ── Main Studio Area ── */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="max-w-4xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border",
                    TYPE_COLOR[post.type]
                  )}>
                    <TypeIcon type={post.type} />
                    {TYPE_LABEL[post.type]}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md font-medium">{post.week} · {post.day}</span>
                  <span className="text-xs text-muted-foreground">Post #{post.id}</span>
                </div>
                <h1 className="text-lg font-bold text-foreground">{post.topic}</h1>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {post.type === "carousel" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadAll}
                    disabled={downloading}
                    className="gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    All {totalSlides} slides
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="gap-1.5 text-xs bg-[#E08040] hover:bg-[#E08040]/90 text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloading ? "Exporting…" : `Download${post.type === "carousel" ? ` slide ${slideIndex + 1}` : ""}`}
                </Button>
              </div>
            </div>

            {/* Preview + Controls row */}
            <div className="flex gap-6 items-start">

              {/* Preview */}
              <div className="flex-shrink-0 space-y-3">
                <div style={{
                  width: PREVIEW_SIZE,
                  height: PREVIEW_SIZE,
                  overflow: "hidden",
                  position: "relative",
                  borderRadius: 12,
                  boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
                }}>
                  <div style={{
                    transform: `scale(${SCALE})`,
                    transformOrigin: "top left",
                    position: "absolute",
                    width: FRAME_SIZE,
                    height: FRAME_SIZE,
                  }}>
                    <FrameContent post={post} slideIndex={slideIndex} />
                  </div>
                </div>

                {/* Slide navigation */}
                {post.type === "carousel" && (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSlideIndex(i => Math.max(0, i - 1))}
                      disabled={slideIndex === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-1.5">
                      {post.slides?.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSlideIndex(i)}
                          className={cn(
                            "rounded-full transition-all",
                            i === slideIndex
                              ? "w-5 h-2.5 bg-[#E08040]"
                              : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                          )}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSlideIndex(i => Math.min(totalSlides - 1, i + 1))}
                      disabled={slideIndex === totalSlides - 1}
                      className="h-8 w-8 p-0"
                    >
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
                    <CopyButton
                      text={post.slides[slideIndex].lines.join("\n")}
                      label="Copy slide text"
                    />
                  </div>
                </div>
              )}

              {/* Single / Quote image text */}
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
                    <CopyButton
                      text={post.imageLines.join("\n")}
                      label="Copy image text"
                    />
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

            {/* Full caption + hashtags combined */}
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

      {/* ── Hidden capture target (actual 1080×1080) ── */}
      <div style={{ position: "fixed", top: -9999, left: -9999, zIndex: -1 }}>
        <div ref={captureRef}>
          <FrameContent post={post} slideIndex={slideIndex} />
        </div>
      </div>
    </AdminLayout>
  );
}
