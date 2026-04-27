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

      <div className="relative h-full flex flex-col px-[8vw] py-[5vh]">
        <div
          className="text-[1.1vw] font-semibold tracking-[0.18em] uppercase mb-[1vh]"
          style={{ color: "#E08040", fontFamily: "Inter, sans-serif", ...a("0.1s", "fadeIn") }}
        >
          The Solution
        </div>
        <h2
          className="text-[3.2vw] font-black tracking-tight leading-tight mb-[3vh]"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "#EAD9BE", ...a("0.2s", "slideInLeft") }}
        >
          A personal resilience score — and the plan to improve it.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2vw", flex: 1, minHeight: 0 }}>
          <div
            className="overflow-hidden rounded-2xl px-[2.5vw] py-[3vh] flex flex-col min-h-0"
            style={{ background: "rgba(26,34,64,0.8)", border: "1px solid rgba(224,128,64,0.2)", ...a("0.1s", "fadeUp") }}
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
              Financial runway, skills, health, mobility, psychological capacity, and emergency resources — six weighted dimensions, answered in under 10 minutes. Assess as an individual or as a full household. Available in English & Romanian.
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl px-[2.5vw] py-[3vh] flex flex-col min-h-0"
            style={{ background: "rgba(26,34,64,0.8)", border: "1px solid rgba(224,128,64,0.2)", ...a("0.2s", "fadeUp") }}
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
              gpt-5.4 produces a 0–100 resilience score, top vulnerabilities, 4 scenario stress-tests, and a personalized action plan. An AI Companion (gpt-4.1-mini) answers follow-up questions in context.
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl px-[2.5vw] py-[3vh] flex flex-col min-h-0"
            style={{ background: "rgba(26,34,64,0.8)", border: "1px solid rgba(224,128,64,0.2)", ...a("0.3s", "fadeUp") }}
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
              Daily coaching tips, streak tracking, achievement badges, and a 30-day challenge weighted to your weakest areas. The action plan surfaces "One thing right now" — the single highest-impact task from your gaps. Pro users unlock scenario simulations, AI Companion, and offline plan access.
            </div>
          </div>
        </div>

        <div
          className="mt-[2vh] text-[1.2vw] font-light"
          style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", ...a("0.4s", "fadeIn") }}
        >
          Grounded. Strategic. Empowering — not alarmist.
        </div>
      </div>
    </div>
  );
}
