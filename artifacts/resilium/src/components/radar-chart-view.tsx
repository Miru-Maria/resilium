import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import type { ResilienceScore } from "@workspace/api-client-react/src/generated/api.schemas";

interface RadarChartViewProps {
  score: ResilienceScore;
  previousScore?: ResilienceScore;
}

export function RadarChartView({ score, previousScore }: RadarChartViewProps) {
  const data = [
    { subject: "Financial", current: score.financial, previous: previousScore?.financial, fullMark: 100 },
    { subject: "Health", current: score.health, previous: previousScore?.health, fullMark: 100 },
    { subject: "Skills", current: score.skills, previous: previousScore?.skills, fullMark: 100 },
    { subject: "Mobility", current: score.mobility, previous: previousScore?.mobility, fullMark: 100 },
    { subject: "Psychological", current: score.psychological, previous: previousScore?.psychological, fullMark: 100 },
    { subject: "Resources", current: score.resources, previous: previousScore?.resources, fullMark: 100 },
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
          {previousScore && (
            <Radar
              name="Previous"
              dataKey="previous"
              stroke="#9CA3AF"
              strokeWidth={2}
              fill="#9CA3AF"
              fillOpacity={0.2}
              strokeDasharray="4 4"
            />
          )}
          <Radar
            name="Current"
            dataKey="current"
            stroke="#2A3B32"
            strokeWidth={2}
            fill="#D4C3A3"
            fillOpacity={0.5}
          />
          {previousScore && <Legend />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
