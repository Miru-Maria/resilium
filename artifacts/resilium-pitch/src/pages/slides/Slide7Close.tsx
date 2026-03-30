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

        <div className="flex items-stretch w-full" style={a("0.38s", "scaleIn")}>
          <div className="flex-1 flex flex-col items-center px-[2vw]">
            <div style={{ height: "17vh", display: "flex", alignItems: "flex-end", paddingBottom: "2.5vh" }}>
              <div
                className="text-[9vw] font-black leading-none"
                style={{ color: "#E08040", fontFamily: "Playfair Display, serif", textShadow: "0 0 28px rgba(224,128,64,0.55), 0 0 60px rgba(224,128,64,0.2)" }}
              >
                4
              </div>
            </div>
            <div style={{ height: "7vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4vh" }}>
              <div className="text-[1.4vw] font-medium text-center" style={{ color: "#EAD9BE", fontFamily: "Inter, sans-serif" }}>Replit artifacts</div>
              <div className="text-[1.2vw] font-light text-center" style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}>deployed</div>
            </div>
          </div>

          <div className="w-[1px] self-stretch" style={{ background: "rgba(224,128,64,0.2)" }} />

          <div className="flex-1 flex flex-col items-center px-[2vw]">
            <div style={{ height: "17vh", display: "flex", alignItems: "flex-end", paddingBottom: "2.5vh" }}>
              <div
                className="text-[9vw] font-black leading-none"
                style={{ color: "#E08040", fontFamily: "Playfair Display, serif", textShadow: "0 0 28px rgba(224,128,64,0.55), 0 0 60px rgba(224,128,64,0.2)" }}
              >
                6
              </div>
            </div>
            <div style={{ height: "7vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4vh" }}>
              <div className="text-[1.4vw] font-medium text-center" style={{ color: "#EAD9BE", fontFamily: "Inter, sans-serif" }}>Resilience dimensions</div>
              <div className="text-[1.2vw] font-light text-center" style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}>scored</div>
            </div>
          </div>

          <div className="w-[1px] self-stretch" style={{ background: "rgba(224,128,64,0.2)" }} />

          <div className="flex-1 flex flex-col items-center px-[2vw]">
            <div style={{ height: "17vh", display: "flex", alignItems: "flex-end", paddingBottom: "2.5vh" }}>
              <div
                className="text-[9vw] font-black leading-none"
                style={{ color: "#E08040", fontFamily: "Playfair Display, serif", textShadow: "0 0 28px rgba(224,128,64,0.55), 0 0 60px rgba(224,128,64,0.2)" }}
              >
                3
              </div>
            </div>
            <div style={{ height: "7vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4vh" }}>
              <div className="text-[1.4vw] font-medium text-center" style={{ color: "#EAD9BE", fontFamily: "Inter, sans-serif" }}>Revenue streams</div>
              <div className="text-[1.2vw] font-light text-center" style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}>active</div>
            </div>
          </div>

          <div className="w-[1px] self-stretch" style={{ background: "rgba(224,128,64,0.2)" }} />

          <div className="flex-1 flex flex-col items-center px-[2vw]">
            <div style={{ height: "17vh", display: "flex", alignItems: "flex-end", paddingBottom: "2.5vh" }}>
              <div
                className="font-black leading-none"
                style={{ fontSize: "10.5vw", color: "#E08040", fontFamily: "Playfair Display, serif", textShadow: "0 0 28px rgba(224,128,64,0.55), 0 0 60px rgba(224,128,64,0.2)" }}
              >
                1
              </div>
            </div>
            <div style={{ height: "7vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4vh" }}>
              <div className="text-[1.4vw] font-medium text-center" style={{ color: "#EAD9BE", fontFamily: "Inter, sans-serif" }}>Coaching partnership</div>
              <div className="text-[1.2vw] font-light text-center" style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}>live</div>
            </div>
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
