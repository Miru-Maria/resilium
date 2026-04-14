const base = import.meta.env.BASE_URL;
const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

const NUM = { fontSize: "3.0vw", fontWeight: 900, lineHeight: 1, fontFamily: "Plus Jakarta Sans, sans-serif", color: "#E08040", textShadow: "0 0 24px rgba(224,128,64,0.5), 0 0 50px rgba(224,128,64,0.18)", width: "7vw", flexShrink: 0, textAlign: "right" as const };
const RULE = { width: "1px", height: "3.5vh", background: "rgba(224,128,64,0.3)", flexShrink: 0 };
const LABEL = { fontSize: "1.6vw", fontWeight: 500, color: "#EAD9BE", fontFamily: "Inter, sans-serif" };
const SUB   = { fontSize: "1.2vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif" };

export default function Slide7Close() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <img
        src={`${base}hero-problem.png`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.32 }}
        alt=""
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(13,18,37,0.72) 0%, rgba(13,18,37,0.92) 65%)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(224,128,64,0.08) 0%, transparent 55%)" }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />

      <div className="relative h-full flex flex-col items-center justify-between px-[8vw] py-[7vh]">

        <div className="flex flex-col items-center text-center" style={a("0.1s", "fadeUp")}>
          <div
            style={{ fontSize: "1.2vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#E08040", fontFamily: "Inter, sans-serif", marginBottom: "1.8vh" }}
          >
            Why Resilium
          </div>
          <h2
            style={{ fontSize: "4.5vw", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.02em", fontFamily: "Plus Jakarta Sans, sans-serif", color: "#EAD9BE", ...a("0.2s", "fadeUp") }}
          >
            Not fear. Clarity.
          </h2>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "2.8vh", width: "54vw", ...a("0.35s", "fadeUp") }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2.2vw" }}>
            <span style={NUM}>10</span>
            <div style={RULE} />
            <div>
              <div style={LABEL}>Minutes to your first score</div>
              <div style={SUB}>no account required to start</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2.2vw" }}>
            <span style={NUM}>6</span>
            <div style={RULE} />
            <div>
              <div style={LABEL}>Resilience dimensions scored</div>
              <div style={SUB}>financial, health, skills, mobility, psychological, resources</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2.2vw" }}>
            <span style={{ ...NUM, fontSize: "1.4vw", width: "11vw" }}>Individual<br/>& Household</span>
            <div style={RULE} />
            <div>
              <div style={LABEL}>Assessment modes</div>
              <div style={SUB}>assess yourself, or your full household together</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2.2vw" }}>
            <span style={NUM}>0–100</span>
            <div style={RULE} />
            <div>
              <div style={LABEL}>Your score — clear and actionable</div>
              <div style={SUB}>with top vulnerabilities and a personalized action plan</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2.2vw" }}>
            <span style={{ ...NUM, fontSize: "2.4vw" }}>Free</span>
            <div style={RULE} />
            <div>
              <div style={LABEL}>To start — always</div>
              <div style={SUB}>3 full assessments before you decide on Pro</div>
            </div>
          </div>
        </div>

        <div className="text-center" style={{ maxWidth: "68vw", ...a("0.55s", "fadeUp") }}>
          <div
            style={{ fontSize: "1.2vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#E08040", fontFamily: "Inter, sans-serif", marginBottom: "1.2vh" }}
          >
            Grounded. Strategic. Empowering — not alarmist.
          </div>
          <p style={{ fontSize: "1.5vw", fontWeight: 300, lineHeight: 1.6, color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}>
            Resilium doesn&apos;t sell anxiety &bull; it gives you the map to act on what you already sense
          </p>
        </div>

      </div>
    </div>
  );
}
