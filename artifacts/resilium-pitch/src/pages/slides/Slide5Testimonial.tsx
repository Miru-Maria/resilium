const allSlides = typeof window !== "undefined" && window.location.pathname.toLowerCase().endsWith("/allslides");
const a = (delay: string, kf = "fadeUp") =>
  allSlides ? {} : { animation: `${kf} 0.75s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: delay };

export default function Slide5Testimonial() {
  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: "#0D1225" }}>
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(224,128,64,0.07) 0%, transparent 60%)" }}
      />

      <div className="relative flex flex-col items-center justify-center px-[12vw] text-center" style={{ maxWidth: "80vw" }}>

        {/* Opening quote mark */}
        <div
          style={{
            fontSize: "12vw",
            lineHeight: 0.8,
            color: "#E08040",
            opacity: 0.18,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 900,
            marginBottom: "1.5vh",
            ...a("0s", "fadeIn"),
          }}
          aria-hidden="true"
        >
          &ldquo;
        </div>

        {/* Quote */}
        <blockquote
          style={{
            fontSize: "2.8vw",
            fontWeight: 300,
            lineHeight: 1.5,
            color: "#EAD9BE",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.01em",
            marginBottom: "4vh",
            ...a("0.2s", "fadeUp"),
          }}
        >
          Definitely following this project. As a holistic &amp; executive performance coach,
          this is definitely something I&apos;d love to get my clients to use.
        </blockquote>

        {/* Divider */}
        <div
          style={{
            width: "4vw",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #E08040, transparent)",
            marginBottom: "2.5vh",
            ...a("0.45s", "fadeIn"),
          }}
        />

        {/* Attribution */}
        <div style={a("0.55s", "fadeUp")}>
          <div
            style={{
              fontSize: "1.6vw",
              fontWeight: 600,
              color: "#E08040",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              letterSpacing: "0.04em",
              marginBottom: "0.6vh",
            }}
          >
            Pauline H.
          </div>
          <div
            style={{
              fontSize: "1.2vw",
              fontWeight: 300,
              color: "#8A7A6A",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Holistic &amp; Executive Performance Coach
          </div>
        </div>

      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #E08040, transparent)" }}
      />
    </div>
  );
}
