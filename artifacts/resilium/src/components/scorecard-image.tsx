import React, { forwardRef } from "react";

interface ScoreObj {
  overall: number;
  financial: number;
  health: number;
  skills: number;
  mobility: number;
  psychological: number;
  resources: number;
}

interface MentalResilienceProfile {
  pathway: "growth" | "compensation";
  composite: number;
}

interface ScorecardImageProps {
  score: ScoreObj;
  overallLabel: string;
  mentalResilienceProfile?: MentalResilienceProfile;
}

const CATEGORY_SCORES = [
  { key: "financial", label: "Financial" },
  { key: "health", label: "Health" },
  { key: "skills", label: "Skills" },
  { key: "mobility", label: "Mobility" },
  { key: "psychological", label: "Psychological" },
  { key: "resources", label: "Resources" },
] as const;

function getScoreColor(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function getOverallColor(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export const ScorecardImage = forwardRef<HTMLDivElement, ScorecardImageProps>(
  ({ score, overallLabel, mentalResilienceProfile }, ref) => {
    const overallColor = getOverallColor(score.overall);
    const scoreInt = Math.round(score.overall);

    const circumference = 2 * Math.PI * 80;
    const dashOffset = circumference - (scoreInt / 100) * circumference;

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1080,
          background: "linear-gradient(135deg, #0c1220 0%, #111827 60%, #1a2035 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            background: `radial-gradient(circle, ${overallColor}18 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            background: "radial-gradient(circle, #e0824022 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(224, 130, 64, 0.15)",
                border: "1.5px solid rgba(224, 130, 64, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🛡️
            </div>
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#e08240",
                letterSpacing: -0.5,
              }}
            >
              Resilium
            </span>
          </div>
          <span
            style={{
              fontSize: 16,
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            resilium-platform.com
          </span>
        </div>

        {/* Main score section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <p
            style={{
              fontSize: 18,
              color: "#9ca3af",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 3,
              margin: 0,
            }}
          >
            My Resilience Score
          </p>

          {/* Circular progress */}
          <div style={{ position: "relative", width: 220, height: 220 }}>
            <svg
              width={220}
              height={220}
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx={110}
                cy={110}
                r={80}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={14}
              />
              <circle
                cx={110}
                cy={110}
                r={80}
                fill="none"
                stroke={overallColor}
                strokeWidth={14}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  color: "#f9fafb",
                  lineHeight: 1,
                  letterSpacing: -3,
                }}
              >
                {scoreInt}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginTop: 4,
                }}
              >
                / 100
              </span>
            </div>
          </div>

          <div
            style={{
              background: `${overallColor}20`,
              border: `1.5px solid ${overallColor}40`,
              borderRadius: 40,
              padding: "10px 28px",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: overallColor,
                letterSpacing: -0.5,
              }}
            >
              {overallLabel}
            </span>
          </div>

          {mentalResilienceProfile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 30,
                padding: "8px 20px",
              }}
            >
              <span style={{ fontSize: 16, color: mentalResilienceProfile.pathway === "growth" ? "#10b981" : "#e08240" }}>
                {mentalResilienceProfile.pathway === "growth" ? "↑" : "◆"}
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#d1d5db",
                }}
              >
                {mentalResilienceProfile.pathway === "growth" ? "Growth Pathway" : "Compensation Pathway"}
              </span>
            </div>
          )}
        </div>

        {/* Category scores */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: 2,
              margin: 0,
              marginBottom: 4,
            }}
          >
            Category Breakdown
          </p>
          {CATEGORY_SCORES.map(({ key, label }) => {
            const val = Math.round(score[key]);
            const color = getScoreColor(val);
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#9ca3af",
                    width: 130,
                    flexShrink: 0,
                  }}
                >
                  {label}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 10,
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${val}%`,
                      height: "100%",
                      borderRadius: 5,
                      background: color,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color,
                    width: 36,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {val}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: "#4b5563",
              fontWeight: 500,
            }}
          >
            Know your readiness at
          </span>
          <span
            style={{
              fontSize: 14,
              color: "#e08240",
              fontWeight: 700,
            }}
          >
            resilium-platform.com
          </span>
        </div>
      </div>
    );
  }
);

ScorecardImage.displayName = "ScorecardImage";
