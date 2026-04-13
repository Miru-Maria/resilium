import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ResilienceScore } from "@workspace/api-client-react";

interface RadarChartViewProps {
  score: ResilienceScore;
  previousScore?: ResilienceScore;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: "#131929",
      border: "1px solid rgba(224,128,64,0.3)",
      borderRadius: 10,
      padding: "8px 14px",
      fontSize: 13,
    }}>
      <p style={{ color: "#EAD9BE", fontWeight: 700, marginBottom: 4 }}>{d.subject}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.dataKey === "current" ? "#E08040" : "#6B7280", margin: "2px 0" }}>
          {p.dataKey === "current" ? "Now" : "Before"}: <strong>{Math.round(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

export function RadarChartView({ score, previousScore }: RadarChartViewProps) {
  const data = [
    { subject: "Financial", current: score.financial, previous: previousScore?.financial, fullMark: 100 },
    { subject: "Health", current: score.health, previous: previousScore?.health, fullMark: 100 },
    { subject: "Skills", current: score.skills, previous: previousScore?.skills, fullMark: 100 },
    { subject: "Mobility", current: score.mobility, previous: previousScore?.mobility, fullMark: 100 },
    { subject: "Psych.", current: score.psychological, previous: previousScore?.psychological, fullMark: 100 },
    { subject: "Resources", current: score.resources, previous: previousScore?.resources, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
          <PolarGrid
            stroke="rgba(234,217,190,0.12)"
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#9B8E7E", fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {previousScore && (
            <Radar
              name="Previous"
              dataKey="previous"
              stroke="rgba(155,142,126,0.5)"
              strokeWidth={1.5}
              fill="rgba(155,142,126,0.08)"
              fillOpacity={1}
              strokeDasharray="5 3"
            />
          )}
          <Radar
            name="Current"
            dataKey="current"
            stroke="#E08040"
            strokeWidth={2}
            fill="rgba(224,128,64,0.14)"
            fillOpacity={1}
            dot={{ r: 3, fill: "#E08040", strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
      {previousScore && (
        <div className="flex items-center gap-5 text-xs text-muted-foreground pb-2">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-6 h-0.5 bg-[#E08040] rounded" />
            Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-6 border-t border-dashed border-[#9B8E7E]" />
            Previous
          </span>
        </div>
      )}
    </div>
  );
}
