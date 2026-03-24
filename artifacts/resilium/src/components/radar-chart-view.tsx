import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import type { ResilienceScore } from "@workspace/api-client-react/src/generated/api.schemas";

interface RadarChartViewProps {
  score: ResilienceScore;
}

export function RadarChartView({ score }: RadarChartViewProps) {
  const data = [
    { subject: "Financial", A: score.financial, fullMark: 100 },
    { subject: "Health", A: score.health, fullMark: 100 },
    { subject: "Skills", A: score.skills, fullMark: 100 },
    { subject: "Mobility", A: score.mobility, fullMark: 100 },
    { subject: "Psychological", A: score.psychological, fullMark: 100 },
    { subject: "Resources", A: score.resources, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#2A3B32', fontWeight: 600 }}
          />
          <Radar
            name="Resilience"
            dataKey="A"
            stroke="#2A3B32"
            strokeWidth={2}
            fill="#D4C3A3"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
