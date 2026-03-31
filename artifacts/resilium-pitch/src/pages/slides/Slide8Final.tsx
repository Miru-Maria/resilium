import { useEffect, useRef } from "react";

const allSlides =
  typeof window !== "undefined" &&
  window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

const AMBER = "#E08040";

/* ── Neon draw helper ──────────────────────────────────────────────── */
function neon(ctx: CanvasRenderingContext2D, draw: () => void, color: string, width: number) {
  const passes = [
    { lw: width * 3.5, blur: 28, alpha: 0.25 },
    { lw: width * 2,   blur: 14, alpha: 0.50 },
    { lw: width,       blur: 4,  alpha: 1.00 },
  ];
  for (const { lw, blur, alpha } of passes) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.shadowColor = color;
    ctx.shadowBlur  = blur;
    ctx.globalAlpha = alpha;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    draw();
    ctx.stroke();
    ctx.restore();
  }
}

/* ── Brain + Arms canvas ───────────────────────────────────────────── */
function BrainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const W = 580, H = 320;
    el.width  = W * dpr;
    el.height = H * dpr;
    el.style.width  = W + "px";
    el.style.height = H + "px";
    const ctx = el.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    /* --- purple ambient blob --- */
    const g = ctx.createRadialGradient(290, 115, 10, 290, 115, 155);
    g.addColorStop(0,   "rgba(88,22,130,0.75)");
    g.addColorStop(0.6, "rgba(60,15,95,0.3)");
    g.addColorStop(1,   "rgba(13,18,37,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* ── helper: build a path then stroke neon ── */
    const stroke = (draw: () => void, w = 3) => neon(ctx, () => { ctx.beginPath(); draw(); }, AMBER, w);

    /* ── BRAIN ── */

    /* left lobe outer */
    stroke(() => {
      ctx.moveTo(278, 55);
      ctx.bezierCurveTo(250, 34, 188, 38, 166, 64);
      ctx.bezierCurveTo(136, 72, 126, 100, 144, 124);
      ctx.bezierCurveTo(124, 136, 122, 166, 144, 180);
      ctx.bezierCurveTo(156, 196, 184, 204, 212, 196);
      ctx.bezierCurveTo(226, 208, 246, 212, 252, 204);
    });

    /* right lobe outer */
    stroke(() => {
      ctx.moveTo(302, 55);
      ctx.bezierCurveTo(330, 34, 392, 38, 414, 64);
      ctx.bezierCurveTo(444, 72, 454, 100, 436, 124);
      ctx.bezierCurveTo(456, 136, 458, 166, 436, 180);
      ctx.bezierCurveTo(424, 196, 396, 204, 368, 196);
      ctx.bezierCurveTo(354, 208, 334, 212, 328, 204);
    });

    /* top bridge */
    stroke(() => {
      ctx.moveTo(278, 55);
      ctx.bezierCurveTo(278, 42, 302, 42, 302, 55);
    });

    /* bottom join */
    stroke(() => {
      ctx.moveTo(252, 204);
      ctx.bezierCurveTo(262, 216, 318, 216, 328, 204);
    });

    /* centre groove */
    stroke(() => { ctx.moveTo(290, 55); ctx.lineTo(290, 214); }, 2);

    /* left wrinkles */
    stroke(() => { ctx.moveTo(180, 84); ctx.bezierCurveTo(192, 70, 214, 76, 206, 94); }, 2);
    stroke(() => { ctx.moveTo(164, 116); ctx.bezierCurveTo(178, 104, 200, 110, 192, 128); }, 2);
    stroke(() => { ctx.moveTo(168, 150); ctx.bezierCurveTo(182, 140, 202, 145, 196, 162); }, 2);

    /* right wrinkles (mirror x → 580−x) */
    stroke(() => { ctx.moveTo(400, 84); ctx.bezierCurveTo(388, 70, 366, 76, 374, 94); }, 2);
    stroke(() => { ctx.moveTo(416, 116); ctx.bezierCurveTo(402, 104, 380, 110, 388, 128); }, 2);
    stroke(() => { ctx.moveTo(412, 150); ctx.bezierCurveTo(398, 140, 378, 145, 384, 162); }, 2);

    /* ── LEFT ARM ── */
    stroke(() => {
      ctx.moveTo(144, 114);
      ctx.bezierCurveTo(114, 114, 62, 138, 44, 174);
      ctx.bezierCurveTo(28, 200, 34, 234, 54, 250);
      ctx.bezierCurveTo(64, 264, 90, 270, 110, 262);
      ctx.bezierCurveTo(122, 274, 144, 272, 152, 260);
      ctx.bezierCurveTo(162, 270, 182, 266, 182, 250);
      ctx.bezierCurveTo(190, 238, 186, 212, 172, 200);
      ctx.bezierCurveTo(180, 184, 178, 156, 162, 144);
      ctx.bezierCurveTo(156, 130, 146, 118, 144, 114);
    });

    /* ── RIGHT ARM (mirror: x → 580−x) ── */
    stroke(() => {
      ctx.moveTo(436, 114);
      ctx.bezierCurveTo(466, 114, 518, 138, 536, 174);
      ctx.bezierCurveTo(552, 200, 546, 234, 526, 250);
      ctx.bezierCurveTo(516, 264, 490, 270, 470, 262);
      ctx.bezierCurveTo(458, 274, 436, 272, 428, 260);
      ctx.bezierCurveTo(418, 270, 398, 266, 398, 250);
      ctx.bezierCurveTo(390, 238, 394, 212, 408, 200);
      ctx.bezierCurveTo(400, 184, 402, 156, 418, 144);
      ctx.bezierCurveTo(424, 130, 434, 118, 436, 114);
    });
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ display: "block", imageRendering: "crisp-edges" }}
    />
  );
}

/* ── Background neural network ─────────────────────────────────────── */
function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const COUNT = 60;
    const nodes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.8 + 0.8,
    }));
    const MAX_DIST = 170;
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.strokeStyle = `rgba(224,128,64,${(1 - dist / MAX_DIST) * 0.22})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(224,128,64,0.45)"; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />;
}

/* ── Slide ──────────────────────────────────────────────────────────── */
export default function Slide8Final() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      {!allSlides && <NeuralCanvas />}

      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />

      <div className="relative h-full flex px-[5vw] py-[6vh] items-center">

        {/* Left — user outcomes */}
        <div className="flex flex-col gap-[3.5vh] justify-center" style={{ flex: "0 0 18vw", ...a("0.25s", "fadeUp") }}>
          {[
            { headline: "Clarity over anxiety",        body: "Know exactly where you stand — not a vague feeling, a number." },
            { headline: "A plan, not doom-scrolling",  body: "Structured actions that come directly from your own score." },
            { headline: "Real coaching when it counts",body: "AI flags the gap; a human helps close it." },
          ].map(({ headline, body }) => (
            <div key={headline}>
              <div style={{ fontSize: "1.4vw", fontWeight: 600, color: "#EAD9BE", fontFamily: "Playfair Display, serif", marginBottom: "0.5vh" }}>{headline}</div>
              <div style={{ fontSize: "1.1vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>{body}</div>
            </div>
          ))}
        </div>

        {/* Centre — canvas logo + text */}
        <div className="flex-1 flex flex-col items-center justify-center" style={{ gap: "1.2vh" }}>
          <div style={{ transform: "scale(0.78)", transformOrigin: "top center", ...a("0.1s", "scaleIn") }}>
            <BrainCanvas />
          </div>
          <div style={{ fontSize: "3.6vw", fontWeight: 900, color: "#FFFFFF", fontFamily: "Inter, sans-serif", letterSpacing: "0.14em", lineHeight: 1, marginTop: "-1vh", ...a("0.3s", "fadeUp") }}>
            RESILIUM
          </div>
          <div style={{ fontSize: "1.2vw", fontWeight: 300, color: "#C4B09A", fontFamily: "Inter, sans-serif", textAlign: "center", letterSpacing: "0.04em", ...a("0.42s", "fadeUp") }}>
            Know your readiness.&nbsp;&nbsp;Build your resilience.
          </div>
          <div style={{ fontSize: "1.3vw", fontWeight: 600, color: AMBER, fontFamily: "Inter, sans-serif", letterSpacing: "0.05em", marginTop: "0.4vh", ...a("0.54s", "fadeUp") }}>
            resilium-ai.replit.app
          </div>
        </div>

        {/* Right — why it scales */}
        <div className="flex flex-col gap-[3.5vh] justify-center" style={{ flex: "0 0 18vw", ...a("0.25s", "fadeUp") }}>
          {[
            { headline: "Earns passively",      body: "Subscriptions, referral commissions, coaching fees — revenue compounds as users engage." },
            { headline: "Zero ops burden",      body: "Fully Replit-hosted. No servers to manage, no infra bill to dread." },
            { headline: "Borderless by design", body: "Built for expats and nomads from day one — no geographic lock-in." },
          ].map(({ headline, body }) => (
            <div key={headline} style={{ borderLeft: "2px solid rgba(224,128,64,0.28)", paddingLeft: "1.1vw" }}>
              <div style={{ fontSize: "1.4vw", fontWeight: 600, color: "#EAD9BE", fontFamily: "Playfair Display, serif", marginBottom: "0.5vh" }}>{headline}</div>
              <div style={{ fontSize: "1.1vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>{body}</div>
            </div>
          ))}
        </div>

      </div>

      <div className="absolute bottom-[4vh] left-0 right-0 text-center"
        style={{ fontSize: "1.05vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif", ...a("0.65s", "fadeIn") }}
      >
        Built with Replit Agent 4 &bull; March 2026
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />
    </div>
  );
}
