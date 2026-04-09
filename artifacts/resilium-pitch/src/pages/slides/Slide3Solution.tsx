const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide3Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 80% 50%, rgba(224,128,64,0.08) 0%, transparent 60%)"
        }}
      />

      <div className="relative h-full flex flex-col px-[8vw] py-[7vh]">
        <div
          className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase mb-[1.5vh]"
          style={{ color: "#E08040", fontFamily: "Inter, sans-serif", ...a("0.1s", "fadeIn") }}
        >
          The Solution
        </div>
        <h2
          className="text-[4vw] font-black tracking-tight mb-[5vh]"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "#EAD9BE", ...a("0.2s", "slideInLeft") }}
        >
          A personal resilience score — and the plan to improve it.
        </h2>

        <div className="flex gap-[3vw] flex-1">
          <div
            className="flex-1 rounded-2xl px-[2.5vw] py-[3vh] flex flex-col"
            style={{ background: "rgba(26,34,64,0.8)", border: "1px solid rgba(224,128,64,0.2)", ...a("0.35s", "fadeUp") }}
          >
            <div
              className="text-[3vw] font-black mb-[1.5vh]"
              style={{ color: "#E08040", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              01
            </div>
            <div
              className="text-[1.8vw] font-bold mb-[1vh]"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              14-Step Assessment
            </div>
            <div
              className="text-[1.4vw] font-light leading-relaxed"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Financial runway, skills, health, mobility, psychological capacity, and emergency resources — six weighted dimensions, answered in under 10 minutes. Available in English & Romanian.
            </div>
          </div>

          <div
            className="flex-1 rounded-2xl px-[2.5vw] py-[3vh] flex flex-col"
            style={{ background: "rgba(26,34,64,0.8)", border: "1px solid rgba(224,128,64,0.2)", ...a("0.5s", "fadeUp") }}
          >
            <div
              className="text-[3vw] font-black mb-[1.5vh]"
              style={{ color: "#E08040", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              02
            </div>
            <div
              className="text-[1.8vw] font-bold mb-[1vh]"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              AI-Generated Report
            </div>
            <div
              className="text-[1.4vw] font-light leading-relaxed"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              GPT-5.2 produces a 0–100 resilience score, top vulnerabilities, 5 scenario stress-tests, and a personalized action plan.
            </div>
          </div>

          <div
            className="flex-1 rounded-2xl px-[2.5vw] py-[3vh] flex flex-col"
            style={{ background: "rgba(26,34,64,0.8)", border: "1px solid rgba(224,128,64,0.2)", ...a("0.65s", "fadeUp") }}
          >
            <div
              className="text-[3vw] font-black mb-[1.5vh]"
              style={{ color: "#E08040", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              03
            </div>
            <div
              className="text-[1.8vw] font-bold mb-[1vh]"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Track Progress
            </div>
            <div
              className="text-[1.4vw] font-light leading-relaxed"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Daily habits, checklists, progress snapshots over time. Pro users unlock crisis scenario simulations and coaching referrals.
            </div>
          </div>
        </div>

        <div
          className="mt-[3vh] text-[1.3vw] font-light"
          style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", ...a("0.85s", "fadeIn") }}
        >
          Grounded. Strategic. Empowering — not alarmist.
        </div>
      </div>
    </div>
  );
}
