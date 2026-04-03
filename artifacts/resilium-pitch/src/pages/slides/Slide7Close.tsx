const base = import.meta.env.BASE_URL;
const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

const NUM = { fontSize: "4.8vw", fontWeight: 900, lineHeight: 1, fontFamily: "Plus Jakarta Sans, sans-serif", color: "#E08040", textShadow: "0 0 24px rgba(224,128,64,0.5), 0 0 50px rgba(224,128,64,0.18)", minWidth: "6.5vw", textAlign: "right" as const };
const RULE = { width: "1px", height: "4.5vh", background: "rgba(224,128,64,0.3)", flexShrink: 0 };
const LABEL = { fontSize: "1.6vw", fontWeight: 500, color: "#EAD9BE", fontFamily: "Inter, sans-serif" };
const SUB   = { fontSize: "1.2vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif" };

export default function Slide7Close() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      {/* Photo background — same treatment as slide 2 */}
      <img
        src={`${base}hero-problem.png`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.32 }}
        alt=""
      />
      {/* Dark gradient overlay for legibility */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(13,18,37,0.72) 0%, rgba(13,18,37,0.92) 65%)" }}
      />
      {/* Amber radial accent */}
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
            Where I Am
          </div>
          <h2
            style={{ fontSize: "4.5vw", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.02em", fontFamily: "Plus Jakarta Sans, sans-serif", color: "#EAD9BE", ...a("0.2s", "fadeUp") }}
          >
            The foundation is live.
          </h2>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "2.8vh", width: "54vw", ...a("0.35s", "fadeUp") }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2.2vw" }}>
            <span style={NUM}>4</span>
            <div style={RULE} />
            <div>
              <div style={LABEL}>Replit artifacts</div>
              <div style={SUB}>deployed</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2.2vw" }}>
            <span style={NUM}>6</span>
            <div style={RULE} />
            <div>
              <div style={LABEL}>Resilience dimensions</div>
              <div style={SUB}>scored</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2.2vw" }}>
            <span style={NUM}>3</span>
            <div style={RULE} />
            <div>
              <div style={LABEL}>Revenue streams</div>
              <div style={SUB}>active</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2.2vw" }}>
            <span style={NUM}>1</span>
            <div style={RULE} />
            <div>
              <div style={LABEL}>Coaching partnership</div>
              <div style={SUB}>live</div>
            </div>
          </div>
        </div>

        <div className="text-center" style={{ maxWidth: "68vw", ...a("0.55s", "fadeUp") }}>
          <div
            style={{ fontSize: "1.2vw", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#E08040", fontFamily: "Inter, sans-serif", marginBottom: "1.2vh" }}
          >
            What&apos;s Next
          </div>
          <p style={{ fontSize: "1.5vw", fontWeight: 300, lineHeight: 1.6, color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}>
            Expanding the scenario library &bull; anonymized community benchmarks &bull; Google Play Store launch &bull; deeper coaching integration
          </p>
        </div>

      </div>
    </div>
  );
}
