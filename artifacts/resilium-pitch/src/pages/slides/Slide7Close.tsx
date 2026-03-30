const base = import.meta.env.BASE_URL;
const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide7Close() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <img
        src={`${base}hero-title.png`}
        crossOrigin="anonymous"
        alt="Landscape"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.12 }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(13,18,37,0.97) 0%, rgba(13,18,37,0.85) 100%)" }}
      />

      <div className="relative h-full flex px-[8vw] py-[7vh] gap-[5vw]">

        <div className="flex flex-col justify-center" style={{ flex: "0 0 50vw" }}>
          <div
            className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase mb-[1.5vh]"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif", ...a("0.1s", "fadeIn") }}
          >
            Resilium
          </div>
          <h2
            className="text-[6.5vw] font-black leading-[0.9] tracking-tight mb-[1.5vh]"
            style={{ fontFamily: "Playfair Display, serif", color: "#EAD9BE", ...a("0.2s", "slideInLeft") }}
          >
            Resilium
          </h2>
          <p
            className="text-[2vw] font-light mb-[3.5vh]"
            style={{ color: "#E08040", fontFamily: "Playfair Display, serif", fontStyle: "italic", ...a("0.38s", "fadeUp") }}
          >
            Resilience, quantified.
          </p>
          <div style={a("0.52s", "scaleIn")}>
            <img
              src={`${base}resilium-banner.png`}
              crossOrigin="anonymous"
              alt="Resilium marketing banner"
              className="w-full rounded-xl object-cover"
              style={{ maxHeight: "22vh", objectPosition: "center" }}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center flex-1">
          <div
            className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase mb-[1.5vh]"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif", ...a("0.25s", "fadeIn") }}
          >
            What&apos;s Next
          </div>
          <p
            className="text-[1.4vw] font-light leading-relaxed mb-[3.5vh]"
            style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", ...a("0.38s", "fadeUp") }}
          >
            Expanding scenario library, community anonymized benchmarks, Google Play Store launch, and deeper coaching integration on the roadmap.
          </p>

          <div className="flex flex-col gap-[2vh]" style={a("0.52s", "fadeUp")}>
            <div
              className="flex items-center gap-[1.5vw]"
              style={{ borderBottom: "1px solid rgba(224,128,64,0.15)", paddingBottom: "1.8vh" }}
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
              style={{ borderBottom: "1px solid rgba(224,128,64,0.15)", paddingBottom: "1.8vh" }}
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
              style={{ borderBottom: "1px solid rgba(224,128,64,0.15)", paddingBottom: "1.8vh" }}
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
            <div className="flex items-center gap-[1.5vw]">
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

          <div
            className="mt-[3vh] text-[1.1vw] font-light"
            style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", ...a("0.72s", "fadeIn") }}
          >
            Built with Replit Agent 4 &bull; March 2026
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />
    </div>
  );
}
