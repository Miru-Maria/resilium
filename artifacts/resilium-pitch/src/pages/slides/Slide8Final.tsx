import { useEffect, useRef } from "react";

const allSlides =
  typeof window !== "undefined" &&
  window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

const C = "#E08040";
const S = { fill: "none", stroke: C, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function BrainLogo({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 25 300 210"
      style={{ width: "30vw", overflow: "visible", display: "block", ...style }}
    >
      <defs>
        {/* Layered neon glow — outer halo + inner crispness */}
        <filter id="ng" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="outer" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="inner" />
          <feMerge>
            <feMergeNode in="outer" />
            <feMergeNode in="inner" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Soft ambient blob behind brain */}
        <filter id="blob" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
      </defs>

      {/* Purple ambient glow */}
      <ellipse cx="150" cy="100" rx="108" ry="68" fill="rgba(78,28,112,0.7)" filter="url(#blob)" />

      {/* ── BRAIN ── */}
      {/* Left lobe */}
      <path {...S} strokeWidth="2.8" filter="url(#ng)"
        d="M 148,42 C 130,26 98,30 86,52 C 74,60 70,82 82,96 C 70,108 72,130 86,140 C 94,154 114,162 134,156 C 140,168 148,172 150,167"
      />
      {/* Right lobe */}
      <path {...S} strokeWidth="2.8" filter="url(#ng)"
        d="M 152,42 C 170,26 202,30 214,52 C 226,60 230,82 218,96 C 230,108 228,130 214,140 C 206,154 186,162 166,156 C 160,168 152,172 150,167"
      />
      {/* Top centre arch */}
      <path {...S} strokeWidth="2.8" filter="url(#ng)"
        d="M 148,42 C 148,35 152,35 152,42"
      />
      {/* Longitudinal groove */}
      <line x1="150" y1="42" x2="150" y2="166" {...S} strokeWidth="1.8" filter="url(#ng)" />

      {/* Left wrinkles */}
      <path {...S} strokeWidth="1.7" filter="url(#ng)" d="M 100,68 C 110,57 124,63 118,76" />
      <path {...S} strokeWidth="1.7" filter="url(#ng)" d="M 90,97 C 102,88 116,93 110,106" />
      <path {...S} strokeWidth="1.7" filter="url(#ng)" d="M 95,123 C 108,116 122,121 116,132" />

      {/* Right wrinkles */}
      <path {...S} strokeWidth="1.7" filter="url(#ng)" d="M 200,68 C 190,57 176,63 182,76" />
      <path {...S} strokeWidth="1.7" filter="url(#ng)" d="M 210,97 C 198,88 184,93 190,106" />
      <path {...S} strokeWidth="1.7" filter="url(#ng)" d="M 205,123 C 192,116 178,121 184,132" />

      {/* ── LEFT ARM ── */}
      {/* Outer (bicep) sweep down */}
      <path {...S} strokeWidth="2.8" filter="url(#ng)"
        d="M 82,96 C 56,98 24,118 14,150 C 6,174 18,200 36,210"
      />
      {/* Fist and inner arm back up */}
      <path {...S} strokeWidth="2.8" filter="url(#ng)"
        d="M 36,210 C 44,220 60,222 70,216 C 76,224 90,221 94,211 C 100,217 112,213 112,202 C 118,192 114,174 103,166 C 110,152 108,132 97,122 C 92,112 87,103 82,97"
      />

      {/* ── RIGHT ARM (mirror x → 300−x) ── */}
      {/* Outer (bicep) sweep down */}
      <path {...S} strokeWidth="2.8" filter="url(#ng)"
        d="M 218,96 C 244,98 276,118 286,150 C 294,174 282,200 264,210"
      />
      {/* Fist and inner arm back up */}
      <path {...S} strokeWidth="2.8" filter="url(#ng)"
        d="M 264,210 C 256,220 240,222 230,216 C 224,224 210,221 206,211 C 200,217 188,213 188,202 C 182,192 186,174 197,166 C 190,152 192,132 203,122 C 208,112 213,103 218,97"
      />
    </svg>
  );
}

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
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.strokeStyle = `rgba(224,128,64,${(1 - dist / MAX_DIST) * 0.22})`;
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
        ctx.fillStyle = "rgba(224,128,64,0.45)";
        ctx.fill();
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
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      {!allSlides && <NeuralCanvas />}

      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />

      <div className="relative h-full flex px-[5vw] py-[6vh] items-center">

        {/* Left — user outcomes */}
        <div className="flex flex-col gap-[3.5vh] justify-center" style={{ flex: "0 0 18vw", ...a("0.25s", "fadeUp") }}>
          {[
            { headline: "Clarity over anxiety", body: "Know exactly where you stand — not a vague feeling, a number." },
            { headline: "A plan, not doom-scrolling", body: "Structured actions that come directly from your own score." },
            { headline: "Real coaching when it counts", body: "AI flags the gap; a human helps close it." },
          ].map(({ headline, body }) => (
            <div key={headline}>
              <div style={{ fontSize: "1.4vw", fontWeight: 600, color: "#EAD9BE", fontFamily: "Playfair Display, serif", marginBottom: "0.5vh" }}>{headline}</div>
              <div style={{ fontSize: "1.1vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>{body}</div>
            </div>
          ))}
        </div>

        {/* Centre — coded logo */}
        <div className="flex-1 flex flex-col items-center justify-center" style={{ gap: "1.6vh" }}>
          <div style={a("0.1s", "scaleIn")}>
            <BrainLogo />
          </div>
          <div style={{ fontSize: "3.8vw", fontWeight: 900, color: "#FFFFFF", fontFamily: "Inter, sans-serif", letterSpacing: "0.12em", lineHeight: 1, ...a("0.3s", "fadeUp") }}>
            RESILIUM
          </div>
          <div style={{ fontSize: "1.25vw", fontWeight: 300, color: "#C4B09A", fontFamily: "Inter, sans-serif", textAlign: "center", letterSpacing: "0.04em", ...a("0.42s", "fadeUp") }}>
            Know your readiness. Build your resilience.
          </div>
          <div style={{ fontSize: "1.3vw", fontWeight: 600, color: C, fontFamily: "Inter, sans-serif", letterSpacing: "0.05em", marginTop: "0.6vh", ...a("0.54s", "fadeUp") }}>
            resilium-ai.replit.app
          </div>
        </div>

        {/* Right — why it scales */}
        <div className="flex flex-col gap-[3.5vh] justify-center" style={{ flex: "0 0 18vw", ...a("0.25s", "fadeUp") }}>
          {[
            { headline: "Earns passively", body: "Subscriptions, referral commissions, coaching fees — revenue compounds as users engage." },
            { headline: "Zero ops burden", body: "Fully Replit-hosted. No servers to manage, no infra bill to dread." },
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
