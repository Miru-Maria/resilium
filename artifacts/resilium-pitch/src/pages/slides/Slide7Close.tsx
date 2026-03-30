const base = import.meta.env.BASE_URL;

export default function Slide7Close() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <img
        src={`${base}hero-title.png`}
        crossOrigin="anonymous"
        alt="Landscape"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.18 }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(13,18,37,0.97) 0%, rgba(13,18,37,0.85) 100%)" }}
      />

      <div className="relative h-full flex flex-col justify-between px-[8vw] py-[7vh]">
        <div
          className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase"
          style={{ color: "#E08040", fontFamily: "Inter, sans-serif" }}
        >
          What&apos;s Next
        </div>

        <div className="flex gap-[6vw] items-center">
          <div style={{ flex: "0 0 50vw" }}>
            <h2
              className="text-[5vw] font-black leading-[1.0] tracking-tight mb-[3vh]"
              style={{ fontFamily: "Playfair Display, serif", color: "#EAD9BE" }}
            >
              Resilience isn&apos;t a score.
              <span style={{ color: "#E08040" }}> It&apos;s a practice.</span>
            </h2>
            <p
              className="text-[1.6vw] font-light leading-relaxed mb-[4vh]"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", maxWidth: "42vw" }}
            >
              Expanding scenario library, community anonymized benchmarks, iOS app store submission, and deeper coaching integration on the roadmap.
            </p>
            <div
              className="text-[1.8vw] font-semibold"
              style={{ color: "#E08040", fontFamily: "Inter, sans-serif" }}
            >
              resilium.replit.app
            </div>
          </div>

          <div className="flex flex-col gap-[2.5vh] flex-1">
            <div
              className="flex items-center gap-[1.5vw]"
              style={{ borderBottom: "1px solid rgba(224,128,64,0.15)", paddingBottom: "2vh" }}
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
              style={{ borderBottom: "1px solid rgba(224,128,64,0.15)", paddingBottom: "2vh" }}
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
              style={{ borderBottom: "1px solid rgba(224,128,64,0.15)", paddingBottom: "2vh" }}
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

        <div
          className="text-[1.2vw] font-light"
          style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
        >
          Built with Replit Agent 4 &bull; March 2026
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />
    </div>
  );
}
