const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide6Monetization() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <div
        className="absolute right-0 top-0 h-full w-[45vw]"
        style={{ background: "linear-gradient(135deg, rgba(26,34,64,0.95) 0%, rgba(13,18,37,0) 100%)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 10% 50%, rgba(232,168,48,0.07) 0%, transparent 50%)" }}
      />

      <div className="relative h-full flex px-[8vw] py-[7vh] gap-[6vw]">
        <div className="flex flex-col justify-center" style={{ flex: "0 0 36vw" }}>
          <div
            className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase mb-[1.5vh]"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif", ...a("0.1s", "fadeIn") }}
          >
            Monetization
          </div>
          <h2
            className="text-[4vw] font-black leading-[1.05] tracking-tight mb-[2.5vh]"
            style={{ fontFamily: "Playfair Display, serif", color: "#EAD9BE", ...a("0.2s", "slideInLeft") }}
          >
            Revenue built in from day one.
          </h2>
          <p
            className="text-[1.5vw] font-light leading-relaxed mb-[3vh]"
            style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", ...a("0.38s", "fadeUp") }}
          >
            Three compounding revenue streams designed to grow with the user — not extract from them.
          </p>
          <div
            className="h-[2px]"
            style={{ background: "linear-gradient(90deg, #E08040, rgba(224,128,64,0.1))", width: "8vw", ...a("0.5s", "fadeIn") }}
          />
        </div>

        <div className="flex flex-col gap-[3vh] justify-center flex-1">
          <div
            className="rounded-2xl px-[2.5vw] py-[2.5vh]"
            style={{ background: "rgba(26,34,64,0.85)", border: "1px solid rgba(224,128,64,0.3)", ...a("0.35s", "slideInRight") }}
          >
            <div className="flex items-center justify-between mb-[1vh]">
              <div
                className="text-[1.6vw] font-bold"
                style={{ color: "#EAD9BE", fontFamily: "Playfair Display, serif" }}
              >
                Freemium Model
              </div>
              <div
                className="text-[1.1vw] font-semibold px-[0.8vw] py-[0.4vh] rounded-full"
                style={{ background: "rgba(224,128,64,0.15)", color: "#E08040", fontFamily: "Inter, sans-serif" }}
              >
                2 free assessments
              </div>
            </div>
            <div
              className="text-[1.3vw] font-light"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Unlimited for Pro — scenario simulations, full history, coaching referral access.
            </div>
          </div>

          <div
            className="rounded-2xl px-[2.5vw] py-[2.5vh]"
            style={{ background: "rgba(26,34,64,0.85)", border: "1px solid rgba(224,128,64,0.3)", ...a("0.5s", "slideInRight") }}
          >
            <div className="flex items-center justify-between mb-[1vh]">
              <div
                className="text-[1.6vw] font-bold"
                style={{ color: "#EAD9BE", fontFamily: "Playfair Display, serif" }}
              >
                Pro Subscriptions
              </div>
              <div
                className="text-[1.1vw] font-semibold px-[0.8vw] py-[0.4vh] rounded-full"
                style={{ background: "rgba(224,128,64,0.15)", color: "#E08040", fontFamily: "Inter, sans-serif" }}
              >
                via Paddle
              </div>
            </div>
            <div
              className="text-[1.3vw] font-light"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Paddle integration with live webhook processing, subscription lifecycle management, and Pro badge on profile.
            </div>
          </div>

          <div
            className="rounded-2xl px-[2.5vw] py-[2.5vh]"
            style={{ background: "rgba(26,34,64,0.85)", border: "1px solid rgba(232,168,48,0.3)", ...a("0.65s", "slideInRight") }}
          >
            <div className="flex items-center justify-between mb-[1vh]">
              <div
                className="text-[1.6vw] font-bold"
                style={{ color: "#EAD9BE", fontFamily: "Playfair Display, serif" }}
              >
                Coaching Referral
              </div>
              <div
                className="text-[1.1vw] font-semibold px-[0.8vw] py-[0.4vh] rounded-full"
                style={{ background: "rgba(232,168,48,0.12)", color: "#E8A830", fontFamily: "Inter, sans-serif" }}
              >
                Phoenix Insight Coaching
              </div>
            </div>
            <div
              className="text-[1.3vw] font-light"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              AI surfaces coaching when psychological scores are low — passive referral funnel to a real coaching service.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
