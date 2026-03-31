import { useEffect, useRef } from "react";

const base = import.meta.env.BASE_URL;
const allSlides =
  typeof window !== "undefined" &&
  window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

const AMBER = "#E08040";

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
            { headline: "Clarity over anxiety",         body: "Know exactly where you stand — not a vague feeling, a number." },
            { headline: "A plan, not doom-scrolling",   body: "Structured actions that come directly from your own score." },
            { headline: "Real coaching when it counts", body: "AI flags the gap; a human helps close it." },
          ].map(({ headline, body }) => (
            <div key={headline}>
              <div style={{ fontSize: "1.4vw", fontWeight: 600, color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: "0.5vh" }}>{headline}</div>
              <div style={{ fontSize: "1.1vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>{body}</div>
            </div>
          ))}
        </div>

        {/* Centre — logo + text */}
        <div className="flex-1 flex flex-col items-center justify-center" style={{ gap: "0.8vh" }}>

          {/* Neon brain image — mix-blend-mode:screen dissolves the dark bg */}
          <div style={{ ...a("0.1s", "scaleIn") }}>
            <img
              src={`${base}brain-logo.png`}
              alt="Resilium brain logo"
              style={{
                width: "26vw",
                height: "26vw",
                objectFit: "contain",
                mixBlendMode: "screen",
                maskImage: "radial-gradient(ellipse 92% 84% at 50% 47%, black 34%, transparent 62%)",
                WebkitMaskImage: "radial-gradient(ellipse 92% 84% at 50% 47%, black 34%, transparent 62%)",
                display: "block",
              }}
            />
          </div>

          {/* Brand name — matches website navbar logo exactly */}
          <div style={{
            fontSize: "3.6vw",
            fontWeight: 700,
            color: AMBER,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            ...a("0.3s", "fadeUp"),
          }}>
            Resilium
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: "1.2vw",
            fontWeight: 300,
            color: "#C4B09A",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            letterSpacing: "0.04em",
            ...a("0.42s", "fadeUp"),
          }}>
            Know your readiness.&nbsp;&nbsp;Build your resilience.
          </div>

          {/* URL */}
          <div style={{
            fontSize: "1.3vw",
            fontWeight: 600,
            color: AMBER,
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.05em",
            marginTop: "0.4vh",
            ...a("0.54s", "fadeUp"),
          }}>
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
              <div style={{ fontSize: "1.4vw", fontWeight: 600, color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: "0.5vh" }}>{headline}</div>
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
