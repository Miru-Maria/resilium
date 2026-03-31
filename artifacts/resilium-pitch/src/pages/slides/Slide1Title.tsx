const base = import.meta.env.BASE_URL;
const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide1Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <img
        src={`${base}hero-title.png`}
        crossOrigin="anonymous"
        alt="Hero landscape"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.45, ...a("0s", "fadeIn") }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(13,18,37,0.92) 0%, rgba(13,18,37,0.6) 50%, rgba(224,128,64,0.12) 100%)"
        }}
      />

      <div className="relative h-full flex flex-col justify-between px-[8vw] py-[7vh]">
        <div className="flex items-center gap-[1.2vw]" style={a("0.1s", "fadeIn")}>
          <div className="w-[3px] h-[3vh]" style={{ background: "#E08040" }} />
          <span
            className="text-[1.3vw] font-medium tracking-[0.22em] uppercase"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif" }}
          >
            Replit Agent 4 Buildathon
          </span>
        </div>

        <div className="max-w-[65vw]">
          <div
            className="text-[1.2vw] font-medium tracking-[0.14em] uppercase mb-[2vh]"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif", ...a("0.2s", "fadeUp") }}
          >
            Personal Resilience Planning
          </div>
          <h1
            className="text-[7vw] leading-[0.92] tracking-tight font-black mb-[3vh]"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "#EAD9BE", ...a("0.35s", "slideInLeft") }}
          >
            Resilium
          </h1>
          <p
            className="text-[2.2vw] font-light leading-snug"
            style={{ color: "#EAD9BE", opacity: 0.82, fontFamily: "Inter, sans-serif", maxWidth: "52vw", ...a("0.55s", "fadeUp") }}
          >
            Know how ready you really are.
          </p>
        </div>

        <div className="flex items-center justify-between" style={a("0.75s", "fadeIn")}>
          <div
            className="text-[1.3vw] font-light"
            style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
          >
            Web &bull; Mobile &bull; API &bull; AI
          </div>
          <div
            className="text-[1.2vw] font-medium tracking-wide"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif" }}
          >
            resilium-ai.replit.app
          </div>
        </div>
      </div>

      <div
        className="absolute right-0 top-0 h-full w-[2px]"
        style={{ background: "linear-gradient(180deg, transparent, #E08040, transparent)", ...a("0.9s", "fadeIn") }}
      />
    </div>
  );
}
