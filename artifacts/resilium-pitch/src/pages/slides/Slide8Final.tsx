const base = import.meta.env.BASE_URL;
const allSlides =
  typeof window !== "undefined" &&
  window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

const AMBER = "#E08040";

const NODES: { cx: string; cy: string; r: number }[] = [
  { cx: "12%",  cy: "18%", r: 1.6 }, { cx: "28%",  cy: "9%",  r: 1.1 },
  { cx: "44%",  cy: "22%", r: 1.4 }, { cx: "61%",  cy: "12%", r: 1.8 },
  { cx: "77%",  cy: "28%", r: 1.2 }, { cx: "88%",  cy: "14%", r: 1.5 },
  { cx: "6%",   cy: "42%", r: 1.3 }, { cx: "19%",  cy: "55%", r: 1.7 },
  { cx: "34%",  cy: "47%", r: 1.0 }, { cx: "50%",  cy: "38%", r: 1.9 },
  { cx: "65%",  cy: "52%", r: 1.3 }, { cx: "82%",  cy: "44%", r: 1.1 },
  { cx: "93%",  cy: "58%", r: 1.6 }, { cx: "10%",  cy: "70%", r: 1.4 },
  { cx: "25%",  cy: "78%", r: 1.2 }, { cx: "41%",  cy: "66%", r: 1.8 },
  { cx: "57%",  cy: "74%", r: 1.0 }, { cx: "73%",  cy: "68%", r: 1.5 },
  { cx: "87%",  cy: "80%", r: 1.3 }, { cx: "96%",  cy: "72%", r: 1.1 },
  { cx: "15%",  cy: "88%", r: 1.7 }, { cx: "33%",  cy: "92%", r: 1.2 },
  { cx: "52%",  cy: "85%", r: 1.4 }, { cx: "70%",  cy: "90%", r: 1.6 },
  { cx: "85%",  cy: "94%", r: 1.0 },
];

const EDGES: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[0,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],
  [7,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[13,20],[20,21],[21,22],
  [22,23],[23,24],[2,9],[9,16],[4,11],[1,8],[15,22],[10,17],[6,13],
];

function StaticNetwork() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{ pointerEvents: "none" }}
    >
      {EDGES.map(([i, j], k) => (
        <line
          key={k}
          x1={NODES[i].cx} y1={NODES[i].cy}
          x2={NODES[j].cx} y2={NODES[j].cy}
          stroke="rgba(224,128,64,0.13)"
          strokeWidth="0.3"
        />
      ))}
      {NODES.map((n, i) => (
        <circle key={i} cx={n.cx} cy={n.cy} r={n.r * 0.35} fill="rgba(224,128,64,0.38)" />
      ))}
    </svg>
  );
}

export default function Slide8Final() {
  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: "#0D1225" }}>
      <StaticNetwork />

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
          resilium-platform.com
        </div>

      </div>

      <div className="absolute bottom-[4vh] left-0 right-0 text-center"
        style={{ fontSize: "1.05vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif", ...a("0.65s", "fadeIn") }}
      >
        Built with Replit Agent 4 &bull; April 2026
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />
    </div>
  );
}
