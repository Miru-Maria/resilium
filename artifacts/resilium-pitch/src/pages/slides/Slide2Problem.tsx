const base = import.meta.env.BASE_URL;
const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide2Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <img
        src={`${base}hero-problem.png`}
        crossOrigin="anonymous"
        alt="Storm over city"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.28, ...a("0s", "fadeIn") }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(13,18,37,0.75) 0%, rgba(13,18,37,0.95) 70%)" }}
      />

      <div className="relative h-full flex flex-col justify-center px-[8vw]">
        <div
          className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase mb-[3vh]"
          style={{ color: "#E08040", fontFamily: "Inter, sans-serif", ...a("0.1s", "fadeUp") }}
        >
          The Problem
        </div>

        <h2
          className="text-[5vw] font-black leading-[1.0] tracking-tight mb-[5vh]"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "#EAD9BE", maxWidth: "72vw", ...a("0.25s", "slideInLeft") }}
        >
          Disruption doesn&apos;t announce itself.
        </h2>

        <div className="flex gap-[4vw] items-start">
          <div style={{ flex: "0 0 auto", ...a("0.45s", "fadeUp") }}>
            <div
              className="text-[9vw] font-black leading-none"
              style={{ color: "#E08040", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              56%
            </div>
            <div
              className="text-[1.5vw] font-medium mt-[1vh]"
              style={{ color: "#EAD9BE", opacity: 0.75, fontFamily: "Inter, sans-serif", maxWidth: "28vw" }}
            >
              of Americans have less than 3 months of emergency savings
            </div>
          </div>

          <div
            className="self-stretch w-[1px] mx-[1vw]"
            style={{ background: "rgba(224,128,64,0.3)", ...a("0.55s", "fadeIn") }}
          />

          <div className="flex flex-col gap-[3vh] pt-[1vh]">
            <div style={a("0.6s", "slideInRight")}>
              <div
                className="text-[2.8vw] font-bold mb-[0.8vh]"
                style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                No map for uncertainty
              </div>
              <div
                className="text-[1.5vw] font-light leading-relaxed"
                style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", maxWidth: "38vw" }}
              >
                Job loss, health crises, relocation, natural disaster — people face these without a clear picture of their own readiness.
              </div>
            </div>
            <div style={a("0.75s", "slideInRight")}>
              <div
                className="text-[2.8vw] font-bold mb-[0.8vh]"
                style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Gut feel is not a plan
              </div>
              <div
                className="text-[1.5vw] font-light leading-relaxed"
                style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", maxWidth: "38vw" }}
              >
                Most people feel either falsely confident or quietly anxious — neither state helps them act.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-[4vh] left-[8vw] text-[1.1vw]"
        style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", ...a("0.9s", "fadeIn") }}
      >
        Source: Bankrate Emergency Savings Report 2024
      </div>
    </div>
  );
}
