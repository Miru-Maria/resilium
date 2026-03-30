import { useEffect, useRef } from "react";

const base = import.meta.env.BASE_URL;
const allSlides =
  typeof window !== "undefined" &&
  window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 60;
    const nodes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1280),
      y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 720),
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.8 + 0.8,
    }));

    const MAX_DIST = 170;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.22;
            ctx.strokeStyle = `rgba(224, 128, 64, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(224, 128, 64, 0.45)";
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}

export default function Slide8Final() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      {!allSlides && <NeuralCanvas />}

      {/* Glow radiating FROM the logo position — reversed: bright at top-centre, fading down */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 36%, rgba(224,128,64,0.2) 0%, rgba(224,128,64,0.07) 30%, transparent 62%)",
        }}
      />
      {/* Edge vignette to keep corners dark */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(13,18,37,0.55) 100%)",
        }}
      />

      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />

      <div className="relative h-full flex px-[5vw] py-[6vh] items-center">

        {/* Left — key build stats */}
        <div
          className="flex flex-col gap-[3.2vh] justify-center"
          style={{ flex: "0 0 18vw", ...a("0.25s", "fadeUp") }}
        >
          {[
            { n: "4", label: "artifacts", sub: "web · mobile · API · AI" },
            { n: "6", label: "dimensions", sub: "resilience scored" },
            { n: "3", label: "revenue streams", sub: "live from day one" },
            { n: "1", label: "coaching partner", sub: "Phoenix Insight" },
          ].map(({ n, label, sub }) => (
            <div key={label} style={{ display: "flex", alignItems: "baseline", gap: "0.9vw" }}>
              <span
                style={{
                  fontSize: "2.8vw",
                  fontWeight: 900,
                  color: "#E08040",
                  fontFamily: "Playfair Display, serif",
                  lineHeight: 1,
                  textShadow: "0 0 18px rgba(224,128,64,0.45)",
                  minWidth: "3.5vw",
                  textAlign: "right" as const,
                }}
              >
                {n}
              </span>
              <div>
                <div style={{ fontSize: "1.15vw", fontWeight: 500, color: "#EAD9BE", fontFamily: "Inter, sans-serif" }}>{label}</div>
                <div style={{ fontSize: "0.95vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Centre — logo as focus */}
        <div className="flex-1 flex flex-col items-center justify-center gap-[2.5vh]">
          <div style={a("0.1s", "scaleIn")}>
            <img
              src={`${base}resilium-logo.png`}
              crossOrigin="anonymous"
              alt="Resilium — Know your readiness. Build your resilience."
              style={{ width: "28vw", height: "28vw", objectFit: "contain" }}
            />
          </div>
          <div
            style={{
              fontSize: "1.55vw",
              fontWeight: 600,
              color: "#E08040",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "0.05em",
              ...a("0.42s", "fadeUp"),
            }}
          >
            resilium-ai.replit.app
          </div>
        </div>

        {/* Right — tech stack */}
        <div
          className="flex flex-col gap-[2.8vh] justify-center"
          style={{ flex: "0 0 18vw", ...a("0.25s", "fadeUp") }}
        >
          {[
            { label: "Replit Auth", sub: "OIDC · PKCE · sessions" },
            { label: "Paddle", sub: "subscriptions · webhooks" },
            { label: "GPT-5.2", sub: "via Replit AI proxy" },
            { label: "Resend", sub: "transactional email" },
          ].map(({ label, sub }) => (
            <div
              key={label}
              style={{ borderLeft: "2px solid rgba(224,128,64,0.28)", paddingLeft: "1.1vw" }}
            >
              <div style={{ fontSize: "1.15vw", fontWeight: 600, color: "#EAD9BE", fontFamily: "Inter, sans-serif" }}>{label}</div>
              <div style={{ fontSize: "0.95vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}>{sub}</div>
            </div>
          ))}
        </div>

      </div>

      <div
        className="absolute bottom-[4vh] left-0 right-0 text-center"
        style={{
          fontSize: "1.05vw",
          fontWeight: 300,
          color: "#8A7A6A",
          fontFamily: "Inter, sans-serif",
          ...a("0.65s", "fadeIn"),
        }}
      >
        Built with Replit Agent 4 &bull; March 2026
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />
    </div>
  );
}
