const base = import.meta.env.BASE_URL;
const allSlides =
  typeof window !== "undefined" &&
  window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

const AMBER = "#E08040";

export default function Slide8Final() {
  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: "#0D1225" }}>
      {/* Soft echo of the opening slide — same hero image, heavily veiled */}
      <img
        src={`${base}hero-title.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.20 }}
      />
      {/* Deep veil so text stays fully legible */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(13,18,37,0.88) 0%, rgba(13,18,37,0.72) 50%, rgba(224,128,64,0.06) 100%)" }}
      />

      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />

      {/* Centered brand moment */}
      <div className="relative flex flex-col items-center justify-center" style={{ gap: "0.8vh" }}>

        <div style={a("0.1s", "scaleIn")}>
          <img
            src={`${base}brain-logo.png`}
            alt="Resilium"
            style={{
              width: "32vw",
              height: "32vw",
              objectFit: "contain",
              mixBlendMode: "screen",
              maskImage: "radial-gradient(ellipse 92% 84% at 50% 47%, black 24%, transparent 50%)",
              WebkitMaskImage: "radial-gradient(ellipse 92% 84% at 50% 47%, black 24%, transparent 50%)",
              display: "block",
            }}
          />
        </div>

        <div style={{
          fontSize: "4.8vw",
          fontWeight: 700,
          color: AMBER,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          letterSpacing: "-0.01em",
          lineHeight: 1,
          ...a("0.3s", "fadeUp"),
        }}>
          Resilium
        </div>

        <div style={{
          fontSize: "1.55vw",
          fontWeight: 300,
          color: "#C4B09A",
          fontFamily: "Inter, sans-serif",
          textAlign: "center",
          letterSpacing: "0.04em",
          ...a("0.42s", "fadeUp"),
        }}>
          Know your readiness.&nbsp;&nbsp;Build your resilience.
        </div>

        <div style={{
          fontSize: "1.35vw",
          fontWeight: 600,
          color: AMBER,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.05em",
          marginTop: "0.6vh",
          ...a("0.54s", "fadeUp"),
        }}>
          resilium-platform.com
        </div>

      </div>

      <div className="absolute bottom-[4vh] left-0 right-0 text-center"
        style={{ fontSize: "1.15vw", fontWeight: 500, color: "#E08040", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", ...a("0.65s", "fadeIn") }}
      >
        Start free today &mdash; no account required &bull; resilium-platform.com
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />
    </div>
  );
}
