import { useEffect, useRef } from "react";

const base = import.meta.env.BASE_URL;
const allSlides =
  typeof window !== "undefined" &&
  window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

const AMBER = "#E08040";

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

export default function Slide8Final() {
  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: "#0D1225" }}>
      {!allSlides && <NeuralCanvas />}

      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />

      {/* Centered brand moment */}
      <div className="relative flex flex-col items-center justify-center" style={{ gap: "0.8vh" }}>

        <div style={a("0.1s", "scaleIn")}>
          <img
            src={`${base}brain-logo.png`}
            alt="Resilium"
            style={{
              width: "32vw",
              height: "32vw",
              objectFit: "contain",
              mixBlendMode: "screen",
              maskImage: "radial-gradient(ellipse 92% 84% at 50% 47%, black 24%, transparent 50%)",
              WebkitMaskImage: "radial-gradient(ellipse 92% 84% at 50% 47%, black 24%, transparent 50%)",
              display: "block",
            }}
          />
        </div>

        <div style={{
          fontSize: "4.8vw",
          fontWeight: 700,
          color: AMBER,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          letterSpacing: "-0.01em",
          lineHeight: 1,
          ...a("0.3s", "fadeUp"),
        }}>
          Resilium
        </div>

        <div style={{
          fontSize: "1.55vw",
          fontWeight: 300,
          color: "#C4B09A",
          fontFamily: "Inter, sans-serif",
          textAlign: "center",
          letterSpacing: "0.04em",
          ...a("0.42s", "fadeUp"),
        }}>
          Know your readiness.&nbsp;&nbsp;Build your resilience.
        </div>

        <div style={{
          fontSize: "1.35vw",
          fontWeight: 600,
          color: AMBER,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.05em",
          marginTop: "0.6vh",
          ...a("0.54s", "fadeUp"),
        }}>
          resilium-ai.replit.app
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
