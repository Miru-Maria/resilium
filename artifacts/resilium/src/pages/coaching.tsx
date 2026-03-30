import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, CalendarDays, MessageCircle, TrendingUp, Heart, Brain, Shield } from "lucide-react";

const COACHING_URL = "https://healing-through-understanding.replit.app/";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block",
      background: "#F5EAD8",
      color: "#9B6A3A",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
      padding: "4px 12px",
      borderRadius: "20px",
      border: "1px solid #E8C99A",
    }}>
      {children}
    </span>
  );
}

function SectionDivider() {
  return (
    <div style={{
      width: "48px",
      height: "3px",
      background: "linear-gradient(90deg, #C4956A, #E8B87A)",
      borderRadius: "2px",
      margin: "0 auto 32px",
    }} />
  );
}

export default function CoachingPage() {
  const [fromResilium, setFromResilium] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const s = params.get("score");
    setFromResilium(ref === "resilium");
    if (s) setScore(parseInt(s, 10));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FEFAF5",
      color: "#2C1A0E",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Top nav bar */}
      <div style={{
        position: "sticky",
        top: 0,
        background: "rgba(254,250,245,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #EDE0CE",
        zIndex: 50,
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9B6A3A", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>
          <ArrowLeft size={14} />
          Back to Resilium
        </Link>
        <a
          href={COACHING_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#C4956A",
            color: "#FEFAF5",
            borderRadius: "8px",
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Book a Free Call
        </a>
      </div>

      {/* Hero */}
      <section style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "72px 24px 56px",
        textAlign: "center",
      }}>
        <Badge>
          {fromResilium ? "Based on your Resilium assessment" : "For Resilium Pro Members"}
        </Badge>

        {fromResilium && score !== null && score < 50 && (
          <div style={{
            margin: "24px auto 0",
            maxWidth: "480px",
            background: "#FDF3E5",
            border: "1px solid #E8C99A",
            borderRadius: "12px",
            padding: "16px 20px",
            fontSize: "14px",
            color: "#7A4F20",
            lineHeight: 1.6,
          }}>
            Your psychological resilience score was <strong>{score}/100</strong>. That's not a verdict — it's a starting point. This page is here because scores like that usually mean something worth addressing with more than a checklist.
          </div>
        )}

        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 800,
          letterSpacing: "-1.5px",
          lineHeight: 1.1,
          margin: "32px 0 20px",
          color: "#1E0F05",
        }}>
          Build the resilience<br />
          <span style={{ color: "#C4956A" }}>numbers can't measure.</span>
        </h1>

        <p style={{
          fontSize: "18px",
          lineHeight: 1.7,
          color: "#6B4226",
          maxWidth: "560px",
          margin: "0 auto 36px",
        }}>
          Your Resilium score tracks preparation. This coaching works on what sits underneath it — how you process uncertainty, make decisions under pressure, and find ground again after disruption.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" as const }}>
          <a
            href={COACHING_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#C4956A",
              color: "#FEFAF5",
              padding: "15px 32px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "16px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CalendarDays size={16} />
            Book a Free Discovery Call
          </a>
          <a
            href={COACHING_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "transparent",
              color: "#9B6A3A",
              padding: "15px 28px",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
              border: "1.5px solid #D4A87A",
            }}
          >
            Learn More
          </a>
        </div>
      </section>

      {/* What your score is telling you */}
      <section style={{
        background: "#F7EEE1",
        padding: "64px 24px",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <Badge>What your score is telling you</Badge>
          <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "20px 0 8px", color: "#1E0F05" }}>
            A low psychological resilience score isn't a character flaw.
          </h2>
          <p style={{ color: "#6B4226", lineHeight: 1.7, marginBottom: "40px", fontSize: "16px" }}>
            It usually reflects accumulated stress, past disruption, or simply not having had the space or tools to build those muscles yet.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {[
              {
                icon: "🔍",
                title: "What it often means",
                text: "You're carrying more than most people see. Stress tolerance and emotional regulation are learnable — they're just skills that haven't been prioritised yet.",
              },
              {
                icon: "🚫",
                title: "What it doesn't mean",
                text: "It doesn't mean you're fragile or unready. Many people with lower scores show remarkable grit — they just don't have a structured approach yet.",
              },
              {
                icon: "✨",
                title: "What we can change",
                text: "With the right support, psychological resilience is one of the fastest dimensions to improve — and it raises your performance across all the others.",
              },
            ].map(({ icon, title, text }) => (
              <div key={title} style={{
                background: "#FEFAF5",
                borderRadius: "14px",
                padding: "24px",
                textAlign: "left",
                border: "1px solid #E8C99A",
              }}>
                <span style={{ fontSize: "24px", display: "block", marginBottom: "10px" }}>{icon}</span>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1E0F05", marginBottom: "8px" }}>{title}</div>
                <div style={{ fontSize: "14px", color: "#6B4226", lineHeight: 1.6 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we work on */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Badge>What we work on together</Badge>
          <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "20px 0 12px", color: "#1E0F05" }}>
            Practical resilience. Real life.
          </h2>
          <p style={{ color: "#6B4226", lineHeight: 1.7, fontSize: "16px", maxWidth: "520px", margin: "0 auto" }}>
            Sessions are grounded in your actual situation — your score, your stressors, your timeline. Not generic wellness advice.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
          {[
            { icon: <Brain size={20} />, title: "Stress tolerance & decision-making", text: "Developing your ability to make clear, grounded decisions when things feel unstable or uncertain — a direct complement to your Resilium action plan." },
            { icon: <TrendingUp size={20} />, title: "Adaptive habits for uncertain environments", text: "Building routines that hold up under pressure, not just when life is smooth. Aligned with your financial and daily preparation goals." },
            { icon: <Shield size={20} />, title: "Change management and processing disruption", text: "Working through the emotional weight of major life changes — job loss, relocation, health changes — without it derailing your recovery." },
            { icon: <Heart size={20} />, title: "Confidence after setbacks", text: "Rebuilding your sense of agency after financial stress, health challenges, or mobility limitations. This is where sustainable change actually starts." },
            { icon: <MessageCircle size={20} />, title: "Integrative nutrition & wellbeing", text: "Your physical health and mental resilience are deeply connected. Cristiana's integrative approach addresses both — because your body is part of your preparedness." },
            { icon: <CheckCircle size={20} />, title: "A personalised plan alongside Resilium", text: "Sessions can be structured around your Resilium report. We work the psychological dimension while you execute the practical action plan on your own." },
          ].map(({ icon, title, text }) => (
            <div key={title} style={{
              display: "flex",
              gap: "16px",
              padding: "20px 24px",
              background: "#FEFAF5",
              border: "1px solid #EDE0CE",
              borderRadius: "14px",
            }}>
              <div style={{
                flexShrink: 0,
                width: "36px",
                height: "36px",
                background: "#F5EAD8",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9B6A3A",
              }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1E0F05", marginBottom: "6px" }}>{title}</div>
                <div style={{ fontSize: "13px", color: "#6B4226", lineHeight: 1.6 }}>{text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Cristiana */}
      <section style={{
        background: "#F0E6D3",
        padding: "64px 24px",
      }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
          <SectionDivider />
          <Badge>Your coach</Badge>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C4956A, #E8B87A)",
            margin: "20px auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
          }}>
            🌿
          </div>
          <h2 style={{ fontSize: "26px", fontWeight: 700, margin: "0 0 6px", color: "#1E0F05" }}>
            Cristiana Paun
          </h2>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#9B6A3A", marginBottom: "20px", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
            Integrative Nutrition Health Coach
          </p>
          <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#4A2E14", maxWidth: "560px", margin: "0 auto 24px" }}>
            Cristiana works with people navigating uncertainty, health transitions, and life disruptions. Her integrative approach connects physical wellbeing, nutrition, and mental resilience — because lasting stability is built from the inside out.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#6B4226", maxWidth: "520px", margin: "0 auto" }}>
            She works specifically with Resilium users whose assessments surface a gap between their practical preparation and their inner capacity to carry it out — the gap no checklist can close.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: "760px", margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Badge>How it works</Badge>
          <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "20px 0 0", color: "#1E0F05" }}>Three steps. No commitment required.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {[
            { step: "01", title: "Free discovery call", text: "30 minutes. No pressure. We look at your Resilium report together and see if there's a fit." },
            { step: "02", title: "Tailored programme", text: "A coaching plan built around your specific score, circumstances, and goals — not a generic template." },
            { step: "03", title: "Ongoing support", text: "Bi-weekly or weekly sessions, plus async support between sessions when you need it." },
          ].map(({ step, title, text }) => (
            <div key={step} style={{
              padding: "24px",
              borderRadius: "14px",
              border: "1px solid #EDE0CE",
              background: "#FEFAF5",
              position: "relative" as const,
            }}>
              <div style={{
                fontSize: "40px",
                fontWeight: 900,
                color: "#F0E2CC",
                lineHeight: 1,
                marginBottom: "12px",
                fontVariantNumeric: "tabular-nums",
              }}>
                {step}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1E0F05", marginBottom: "8px" }}>{title}</div>
              <div style={{ fontSize: "13px", color: "#6B4226", lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        background: "linear-gradient(135deg, #3D1F08 0%, #5C3015 100%)",
        padding: "72px 24px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#FEFAF5", marginBottom: "16px", letterSpacing: "-0.5px" }}>
            Ready to work on the part that matters most?
          </h2>
          <p style={{ fontSize: "16px", color: "#D4B08A", lineHeight: 1.7, marginBottom: "32px" }}>
            The free discovery call is 30 minutes with no obligation. Bring your Resilium report and we'll take it from there.
          </p>
          <a
            href={COACHING_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#C4956A",
              color: "#FEFAF5",
              padding: "16px 36px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "16px",
              textDecoration: "none",
              marginBottom: "16px",
            }}
          >
            Book Your Free Discovery Call →
          </a>
          <p style={{ fontSize: "12px", color: "#9B7050", marginTop: "12px" }}>
            Sessions available online. Flexible scheduling across time zones.
          </p>
        </div>
      </section>

      {/* Footer note */}
      <div style={{
        background: "#F7EEE1",
        borderTop: "1px solid #EDE0CE",
        padding: "20px 24px",
        textAlign: "center",
        fontSize: "12px",
        color: "#9B7050",
      }}>
        This coaching service is independent of Resilium. Resilium is a risk assessment tool; coaching is provided by Cristiana Paun separately.
        <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
        <Link href="/" style={{ color: "#9B6A3A", textDecoration: "none" }}>Return to Resilium</Link>
      </div>
    </div>
  );
}
