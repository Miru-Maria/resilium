const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide4Audience() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D1225" }}>
      <div
        className="absolute left-0 top-0 h-full w-[40vw]"
        style={{ background: "linear-gradient(180deg, #1A2240 0%, #0D1225 100%)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(232,168,48,0.06) 0%, transparent 55%)" }}
      />

      <div className="relative h-full flex px-[8vw] py-[7vh] gap-[6vw]">
        <div className="flex flex-col justify-center" style={{ flex: "0 0 32vw" }}>
          <div
            className="text-[1.2vw] font-semibold tracking-[0.18em] uppercase mb-[1.5vh]"
            style={{ color: "#E08040", fontFamily: "Inter, sans-serif", ...a("0.1s", "fadeIn") }}
          >
            Who It&apos;s For
          </div>
          <h2
            className="text-[4.2vw] font-black leading-[1.05] tracking-tight mb-[2.5vh]"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "#EAD9BE", ...a("0.2s", "slideInLeft") }}
          >
            The quietly prepared.
          </h2>
          <p
            className="text-[1.5vw] font-light leading-relaxed"
            style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif", ...a("0.4s", "fadeUp") }}
          >
            Not doomsday preppers. Not fearmongers. People who look at an uncertain world and want a clear-eyed plan — not anxiety.
          </p>
          <div
            className="mt-[3vh] h-[2px] w-[6vw]"
            style={{ background: "linear-gradient(90deg, #E08040, transparent)", ...a("0.55s", "fadeIn") }}
          />
        </div>

        <div className="flex flex-col gap-[2.5vh] justify-center flex-1">
          <div
            className="rounded-xl px-[2vw] py-[2vh]"
            style={{ background: "rgba(26,34,64,0.7)", borderLeft: "3px solid #E08040", ...a("0.35s", "slideInRight") }}
          >
            <div
              className="text-[1.6vw] font-bold mb-[0.5vh]"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              The Financially Anxious
            </div>
            <div
              className="text-[1.3vw] font-light"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Stable income, uncertain future — want to know if their safety net is real.
            </div>
          </div>
          <div
            className="rounded-xl px-[2vw] py-[2vh]"
            style={{ background: "rgba(26,34,64,0.7)", borderLeft: "3px solid #E08040", ...a("0.5s", "slideInRight") }}
          >
            <div
              className="text-[1.6vw] font-bold mb-[0.5vh]"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Expats &amp; Digital Nomads
            </div>
            <div
              className="text-[1.3vw] font-light"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Living across borders, managing multi-currency exposure and relocation risk.
            </div>
          </div>
          <div
            className="rounded-xl px-[2vw] py-[2vh]"
            style={{ background: "rgba(26,34,64,0.7)", borderLeft: "3px solid #E08040", ...a("0.65s", "slideInRight") }}
          >
            <div
              className="text-[1.6vw] font-bold mb-[0.5vh]"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Preparedness Planners
            </div>
            <div
              className="text-[1.3vw] font-light"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Already thinking ahead — want an objective score, not guesswork.
            </div>
          </div>
          <div
            className="rounded-xl px-[2vw] py-[2vh]"
            style={{ background: "rgba(26,34,64,0.7)", borderLeft: "3px solid #E08040", ...a("0.8s", "slideInRight") }}
          >
            <div
              className="text-[1.6vw] font-bold mb-[0.5vh]"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              The Cautiously Aware
            </div>
            <div
              className="text-[1.3vw] font-light"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Don&apos;t call themselves preppers — but they&apos;re quietly paying attention.
            </div>
          </div>
          <div
            className="rounded-xl px-[2vw] py-[2vh]"
            style={{ background: "rgba(26,34,64,0.7)", borderLeft: "3px solid #E08040", ...a("0.95s", "slideInRight") }}
          >
            <div
              className="text-[1.6vw] font-bold mb-[0.5vh]"
              style={{ color: "#EAD9BE", fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Families &amp; Households
            </div>
            <div
              className="text-[1.3vw] font-light"
              style={{ color: "#8A7A6A", fontFamily: "Inter, sans-serif" }}
            >
              Parents, partners, multi-generational households — want a shared readiness score, not separate plans.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
