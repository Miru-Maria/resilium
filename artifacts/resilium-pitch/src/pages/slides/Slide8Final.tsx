const base = import.meta.env.BASE_URL;
const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide8Final() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(224,128,64,0.07) 0%, transparent 60%)"
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />

      <div className="relative h-full flex flex-col items-center justify-center px-[8vw] py-[7vh]">

        <div style={a("0.1s", "scaleIn")}>
          <img
            src={`${base}resilium-logo.png`}
            crossOrigin="anonymous"
            alt="Resilium — Know your readiness. Build your resilience."
            style={{ width: "22vw", height: "22vw", objectFit: "contain" }}
          />
        </div>

        <div className="mt-[3vh] text-center">
          <h2
            className="text-[3.2vw] font-black tracking-tight leading-tight mb-[1.5vh]"
            style={{ fontFamily: "Playfair Display, serif", color: "#EAD9BE", ...a("0.3s", "fadeUp") }}
          >
            Built for people who&apos;d rather know.
          </h2>
          <div
            className="text-[1.6vw] font-medium mb-[3vh]"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif", letterSpacing: "0.04em", ...a("0.48s", "fadeUp") }}
          >
            resilium-ai.replit.app
          </div>
        </div>

        <div
          className="text-[1.1vw] font-light"
          style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", ...a("0.65s", "fadeIn") }}
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
