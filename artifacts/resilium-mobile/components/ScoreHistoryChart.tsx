import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Polyline, Line, Circle, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

const C = {
  bg: "#0D1225",
  surface: "#141B30",
  border: "#252E4A",
  primary: "#E08040",
  text: "#F0EBE3",
  text2: "#A09880",
  text3: "#6A6070",
  success: "#34D399",
  muted: "rgba(240,235,227,0.08)",
};

const DIMENSION_COLORS: Record<string, string> = {
  overall:      "#E08040",
  financial:    "#60A5FA",
  health:       "#34D399",
  skills:       "#A78BFA",
  mobility:     "#FBBF24",
  psychological:"#F472B6",
  resources:    "#38BDF8",
};

const DIMENSION_LABELS: Record<string, string> = {
  overall:      "Overall",
  financial:    "Financial",
  health:       "Health",
  skills:       "Skills",
  mobility:     "Mobility",
  psychological:"Psychological",
  resources:    "Resources",
};

export type ScoreSnapshot = {
  date: string;
  overall: number | null;
  financial?: number | null;
  health?: number | null;
  skills?: number | null;
  mobility?: number | null;
  psychological?: number | null;
  resources?: number | null;
};

interface Props {
  snapshots: ScoreSnapshot[];
  isPro: boolean;
  width: number;
}

export function ScoreHistoryChart({ snapshots, isPro, width }: Props) {
  if (snapshots.length === 0) {
    return <EmptyState />;
  }

  const H = 180;
  const padX = 36;
  const padY = 16;
  const chartW = width - padX * 2;
  const chartH = H - padY * 2;

  const dims: (keyof ScoreSnapshot)[] = isPro
    ? ["overall", "financial", "health", "skills", "mobility", "psychological", "resources"]
    : ["overall"];

  const n = snapshots.length;

  function toX(i: number) {
    return padX + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  }

  function toY(v: number | null | undefined) {
    const val = v ?? 0;
    return padY + chartH - (val / 100) * chartH;
  }

  function pointsStr(dim: keyof ScoreSnapshot) {
    return snapshots
      .filter(s => s[dim] != null)
      .map((s, i) => {
        const idx = snapshots.indexOf(s);
        return `${toX(idx)},${toY(s[dim] as number)}`;
      })
      .join(" ");
  }

  const yLines = [0, 25, 50, 75, 100];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const showDates = n <= 8;

  return (
    <View style={styles.wrapper}>
      <Svg width={width} height={H}>
        <Defs>
          <SvgLinearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.surface} stopOpacity="1" />
            <Stop offset="1" stopColor={C.bg} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {yLines.map(y => {
          const cy = toY(y);
          return (
            <React.Fragment key={y}>
              <Line
                x1={padX} y1={cy} x2={padX + chartW} y2={cy}
                stroke="rgba(255,255,255,0.06)" strokeWidth={1}
              />
              <SvgText x={padX - 4} y={cy + 4} fontSize={9} fill={C.text3} textAnchor="end">
                {y}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Dimension lines */}
        {dims.map(dim => {
          const pts = pointsStr(dim);
          if (!pts) return null;
          return (
            <Polyline
              key={String(dim)}
              points={pts}
              fill="none"
              stroke={DIMENSION_COLORS[String(dim)] ?? C.text2}
              strokeWidth={dim === "overall" ? 2.5 : 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={dim === "overall" ? 1 : 0.7}
            />
          );
        })}

        {/* Dots on overall line */}
        {snapshots.map((s, i) => (
          <Circle
            key={i}
            cx={toX(i)}
            cy={toY(s.overall)}
            r={3}
            fill={C.primary}
            stroke={C.surface}
            strokeWidth={1.5}
          />
        ))}

        {/* X axis date labels */}
        {showDates && snapshots.map((s, i) => {
          if (n > 4 && i !== 0 && i !== n - 1 && i !== Math.floor(n / 2)) return null;
          return (
            <SvgText
              key={i}
              x={toX(i)}
              y={H - 2}
              fontSize={8}
              fill={C.text3}
              textAnchor="middle"
            >
              {formatDate(s.date)}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      {isPro && (
        <View style={styles.legend}>
          {dims.map(dim => (
            <View key={String(dim)} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: DIMENSION_COLORS[String(dim)] }]} />
              <Text style={styles.legendLabel}>{DIMENSION_LABELS[String(dim)]}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Free upsell overlay */}
      {!isPro && (
        <View style={styles.proOverlay}>
          <View style={styles.proBox}>
            <Feather name="lock" size={18} color={C.primary} />
            <Text style={styles.proTitle}>Dimension Breakdown — Pro</Text>
            <Text style={styles.proDesc}>See how each life dimension has changed over time. Identify weak spots before they become crises.</Text>
            <Pressable style={styles.proBtn} onPress={() => router.push("/pricing")}>
              <Text style={styles.proBtnText}>Unlock with Pro</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Feather name="bar-chart-2" size={28} color={C.text3} />
      <Text style={styles.emptyTitle}>No score history yet</Text>
      <Text style={styles.emptyDesc}>Complete your first assessment to start tracking your resilience score over time.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "hidden",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: C.text2,
  },
  proOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(13,18,37,0.82)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  proBox: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    gap: 8,
  },
  proTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
  },
  proDesc: {
    fontSize: 12,
    color: C.text2,
    textAlign: "center",
    lineHeight: 18,
  },
  proBtn: {
    marginTop: 4,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  proBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text2,
  },
  emptyDesc: {
    fontSize: 12,
    color: C.text3,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
  },
});
