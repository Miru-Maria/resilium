const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide7Close() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 10% 50%, rgba(232,168,48,0.07) 0%, transparent 50%)" }}
      />
      <div
        className="absolute right-0 top-0 h-full w-[45vw]"
        style={{ background: "linear-gradient(135deg, rgba(26,34,64,0.95) 0%, rgba(13,18,37,0) 100%)" }}
      />

      <div className="relative h-full flex px-[8vw] py-[7vh] gap-[6vw]">

        <div className="flex flex-col justify-center" style={{ flex: "0 0 38vw" }}>
          <div
            className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase mb-[1.5vh]"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif", ...a("0.1s", "fadeIn") }}
          >
            What&apos;s Next
          </div>
          <h2
            className="text-[4vw] font-black leading-[1.05] tracking-tight mb-[2.5vh]"
            style={{ fontFamily: "Playfair Display, serif", color: "#EAD9BE", ...a("0.2s", "slideInLeft") }}
          >
            The foundation is live.
          </h2>
          <p
            className="text-[1.5vw] font-light leading-relaxed mb-[3.5vh]"
            style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", maxWidth: "34vw", ...a("0.38s", "fadeUp") }}
          >
            Expanding the scenario library, anonymized community benchmarks, Google Play Store launch, and deeper coaching integration — all on the near-term roadmap.
          </p>
          <div
            className="h-[2px]"
            style={{ background: "linear-gradient(90deg, #E08040, rgba(224,128,64,0.1))", width: "8vw", ...a("0.5s", "fadeIn") }}
          />
        </div>

        <div className="flex flex-col gap-[2.5vh] justify-center flex-1">
          <div
            className="flex items-center gap-[1.5vw]"
            style={{ borderBottom: "1px solid rgba(224,128,64,0.15)", paddingBottom: "2vh", ...a("0.35s", "slideInRight") }}
          >
            <div
              className="text-[2vw] font-black"
              style={{ color: "#E08040", fontFamily: "Playfair Display, serif", minWidth: "4vw" }}
            >
              4
            </div>
            <div
              className="text-[1.4vw] font-light"
              style={{ color: "#EAD9BE", fontFamily: "Inter, sans-serif" }}
            >
              Replit artifacts deployed
            </div>
          </div>
          <div
            className="flex items-center gap-[1.5vw]"
            style={{ borderBottom: "1px solid rgba(224,128,64,0.15)", paddingBottom: "2vh", ...a("0.48s", "slideInRight") }}
          >
            <div
              className="text-[2vw] font-black"
              style={{ color: "#E08040", fontFamily: "Playfair Display, serif", minWidth: "4vw" }}
            >
              6
            </div>
            <div
              className="text-[1.4vw] font-light"
              style={{ color: "#EAD9BE", fontFamily: "Inter, sans-serif" }}
            >
              Resilience dimensions scored
            </div>
          </div>
          <div
            className="flex items-center gap-[1.5vw]"
            style={{ borderBottom: "1px solid rgba(224,128,64,0.15)", paddingBottom: "2vh", ...a("0.61s", "slideInRight") }}
          >
            <div
              className="text-[2vw] font-black"
              style={{ color: "#E08040", fontFamily: "Playfair Display, serif", minWidth: "4vw" }}
            >
              3
            </div>
            <div
              className="text-[1.4vw] font-light"
              style={{ color: "#EAD9BE", fontFamily: "Inter, sans-serif" }}
            >
              Active revenue streams
            </div>
          </div>
          <div
            className="flex items-center gap-[1.5vw]"
            style={a("0.74s", "slideInRight")}
          >
            <div
              className="text-[2vw] font-black"
              style={{ color: "#E8A830", fontFamily: "Playfair Display, serif", minWidth: "4vw" }}
            >
              1
            </div>
            <div
              className="text-[1.4vw] font-light"
              style={{ color: "#EAD9BE", fontFamily: "Inter, sans-serif" }}
            >
              Coaching partnership live
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
