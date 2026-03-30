const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide7Close() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(224,128,64,0.1) 0%, transparent 55%)"
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />

      <div className="relative h-full flex flex-col items-center justify-between px-[8vw] py-[7vh]">

        <div className="flex flex-col items-center text-center" style={a("0.1s", "fadeUp")}>
          <div
            className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase mb-[1.8vh]"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif" }}
          >
            Where We Are
          </div>
          <h2
            className="text-[4.5vw] font-black leading-[1.0] tracking-tight"
            style={{ fontFamily: "Playfair Display, serif", color: "#EAD9BE", ...a("0.2s", "fadeUp") }}
          >
            The foundation is live.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1px 1fr 1px 1fr 1px 1fr",
            gridTemplateRows: "1fr 4vh auto",
            width: "100%",
            flex: "1 1 0",
            ...a("0.38s", "scaleIn"),
          }}
        >
          <div style={{ gridColumn: 2, gridRow: "1 / 4", background: "rgba(224,128,64,0.2)" }} />
          <div style={{ gridColumn: 4, gridRow: "1 / 4", background: "rgba(224,128,64,0.2)" }} />
          <div style={{ gridColumn: 6, gridRow: "1 / 4", background: "rgba(224,128,64,0.2)" }} />

          <div style={{ gridColumn: 1, gridRow: 1, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: "1vh" }}>
            <span style={{ fontSize: "9vw", fontWeight: 900, lineHeight: 1, fontFamily: "Playfair Display, serif", color: "#E08040", textShadow: "0 0 28px rgba(224,128,64,0.55), 0 0 60px rgba(224,128,64,0.2)" }}>4</span>
          </div>
          <div style={{ gridColumn: 3, gridRow: 1, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: "1vh" }}>
            <span style={{ fontSize: "9vw", fontWeight: 900, lineHeight: 1, fontFamily: "Playfair Display, serif", color: "#E08040", textShadow: "0 0 28px rgba(224,128,64,0.55), 0 0 60px rgba(224,128,64,0.2)" }}>6</span>
          </div>
          <div style={{ gridColumn: 5, gridRow: 1, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: "1vh" }}>
            <span style={{ fontSize: "9vw", fontWeight: 900, lineHeight: 1, fontFamily: "Playfair Display, serif", color: "#E08040", textShadow: "0 0 28px rgba(224,128,64,0.55), 0 0 60px rgba(224,128,64,0.2)" }}>3</span>
          </div>
          <div style={{ gridColumn: 7, gridRow: 1, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: "1vh" }}>
            <span style={{ fontSize: "9vw", fontWeight: 900, lineHeight: 1, fontFamily: "Playfair Display, serif", color: "#E08040", textShadow: "0 0 28px rgba(224,128,64,0.55), 0 0 60px rgba(224,128,64,0.2)" }}>1</span>
          </div>

          <div style={{ gridColumn: 1, gridRow: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5vh" }}>
            <span style={{ fontSize: "1.4vw", fontWeight: 500, color: "#EAD9BE", fontFamily: "Inter, sans-serif", textAlign: "center" }}>Replit artifacts</span>
            <span style={{ fontSize: "1.2vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif", textAlign: "center" }}>deployed</span>
          </div>
          <div style={{ gridColumn: 3, gridRow: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5vh" }}>
            <span style={{ fontSize: "1.4vw", fontWeight: 500, color: "#EAD9BE", fontFamily: "Inter, sans-serif", textAlign: "center" }}>Resilience dimensions</span>
            <span style={{ fontSize: "1.2vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif", textAlign: "center" }}>scored</span>
          </div>
          <div style={{ gridColumn: 5, gridRow: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5vh" }}>
            <span style={{ fontSize: "1.4vw", fontWeight: 500, color: "#EAD9BE", fontFamily: "Inter, sans-serif", textAlign: "center" }}>Revenue streams</span>
            <span style={{ fontSize: "1.2vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif", textAlign: "center" }}>active</span>
          </div>
          <div style={{ gridColumn: 7, gridRow: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5vh" }}>
            <span style={{ fontSize: "1.4vw", fontWeight: 500, color: "#EAD9BE", fontFamily: "Inter, sans-serif", textAlign: "center" }}>Coaching partnership</span>
            <span style={{ fontSize: "1.2vw", fontWeight: 300, color: "#8A7A6A", fontFamily: "Inter, sans-serif", textAlign: "center" }}>live</span>
          </div>
        </div>

        <div
          className="text-center max-w-[68vw]"
          style={a("0.62s", "fadeUp")}
        >
          <div
            className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase mb-[1.2vh]"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif" }}
          >
            What&apos;s Next
          </div>
          <p
            className="text-[1.5vw] font-light leading-relaxed"
            style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
          >
            Expanding the scenario library &bull; anonymized community benchmarks &bull; Google Play Store launch &bull; deeper coaching integration
          </p>
        </div>

      </div>
    </div>
  );
}
