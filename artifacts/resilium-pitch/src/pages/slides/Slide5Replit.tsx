const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide5Replit() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(224,128,64,0.1) 0%, transparent 55%)"
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />

      <div className="relative h-full flex flex-col px-[8vw] py-[7vh]">
        <div
          className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase mb-[1vh]"
          style={{ color: "#E08040", fontFamily: "Inter, sans-serif", ...a("0.1s", "fadeIn") }}
        >
          Built on Replit
        </div>
        <h2
          className="text-[4vw] font-black tracking-tight mb-[4vh]"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "#EAD9BE", ...a("0.2s", "slideInLeft") }}
        >
          Four artifacts. One cohesive platform.
        </h2>

        <div className="grid gap-[2vh]" style={{ gridTemplateColumns: "1fr 1fr", flex: 1 }}>
          <div
            className="rounded-2xl px-[2.5vw] py-[2.5vh] flex flex-col gap-[1vh]"
            style={{ background: "rgba(26,34,64,0.9)", border: "1px solid rgba(224,128,64,0.25)", ...a("0.35s", "fadeUp") }}
          >
            <div
              className="text-[1.2vw] font-bold tracking-widest uppercase"
              style={{ color: "#E08040", fontFamily: "Inter, sans-serif" }}
            >
              Web App
            </div>
            <div
              className="text-[1.7vw] font-bold"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              React + Vite
            </div>
            <div
              className="text-[1.3vw] font-light leading-relaxed"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Full assessment flow, dashboard, admin panel, GDPR tools, scenario simulations, coaching page
            </div>
          </div>

          <div
            className="rounded-2xl px-[2.5vw] py-[2.5vh] flex flex-col gap-[1vh]"
            style={{ background: "rgba(26,34,64,0.9)", border: "1px solid rgba(224,128,64,0.25)", ...a("0.45s", "fadeUp") }}
          >
            <div
              className="text-[1.2vw] font-bold tracking-widest uppercase"
              style={{ color: "#E08040", fontFamily: "Inter, sans-serif" }}
            >
              Mobile App
            </div>
            <div
              className="text-[1.7vw] font-bold"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Expo + React Native
            </div>
            <div
              className="text-[1.3vw] font-light leading-relaxed"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Full assessment on Android (Google Play), push notifications, GDPR data management, score sharing
            </div>
          </div>

          <div
            className="rounded-2xl px-[2.5vw] py-[2.5vh] flex flex-col gap-[1vh]"
            style={{ background: "rgba(26,34,64,0.9)", border: "1px solid rgba(224,128,64,0.25)", ...a("0.55s", "fadeUp") }}
          >
            <div
              className="text-[1.2vw] font-bold tracking-widest uppercase"
              style={{ color: "#E08040", fontFamily: "Inter, sans-serif" }}
            >
              API Server
            </div>
            <div
              className="text-[1.7vw] font-bold"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Express + PostgreSQL
            </div>
            <div
              className="text-[1.3vw] font-light leading-relaxed"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Replit Auth (OIDC), Drizzle ORM, Paddle webhooks, Resend emails, rate limiting, cron digest
            </div>
          </div>

          <div
            className="rounded-2xl px-[2.5vw] py-[2.5vh] flex flex-col gap-[1vh]"
            style={{ background: "rgba(26,34,64,0.9)", border: "1px solid rgba(224,128,64,0.25)", ...a("0.65s", "fadeUp") }}
          >
            <div
              className="text-[1.2vw] font-bold tracking-widest uppercase"
              style={{ color: "#E08040", fontFamily: "Inter, sans-serif" }}
            >
              AI Integration
            </div>
            <div
              className="text-[1.7vw] font-bold"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              GPT-5.2 via Replit
            </div>
            <div
              className="text-[1.3vw] font-light leading-relaxed"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              AI Integrations proxy — zero API key management. Structured JSON output for reports and scenario analysis.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
