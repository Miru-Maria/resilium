import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "@/context/auth";
import { useProStatus } from "@/context/proStatus";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";
import { ProGate } from "@/components/ProGate";
import { ScoreHistoryChart, type ScoreSnapshot } from "@/components/ScoreHistoryChart";

const CHECKIN_KEY = "resilium_checkin_history_v1";
const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = SCREEN_W - 80;

type CheckinEntry = { date: string; scores: Record<string, number> };

function buildCalendarDays(
  history: CheckinEntry[]
): Array<{ date: string; hasEntry: boolean; avg: number | null }> {
  const historyMap = new Map(history.map((h) => [h.date, h]));
  const days = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const dateStr = d.toISOString().split("T")[0];
    const entry = historyMap.get(dateStr);
    const vals = entry ? Object.values(entry.scores) : [];
    const avg =
      vals.length > 0
        ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
        : null;
    days.push({ date: dateStr, hasEntry: !!entry, avg });
  }
  return days;
}

function calDotColor(avg: number | null, colors: ColorsType): string {
  if (avg === null) return colors.surface;
  if (avg >= 4) return colors.success;
  if (avg >= 3) return "#F59E0B";
  return colors.danger;
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { getAuthHeaders } = useAuth();
  const { isPro } = useProStatus();

  const [history, setHistory] = useState<CheckinEntry[]>([]);
  const [snapshots, setSnapshots] = useState<ScoreSnapshot[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(CHECKIN_KEY).then((raw) => {
      if (raw) setHistory(JSON.parse(raw));
    });
    AsyncStorage.getItem("resilium_streak_v1").then((raw) => {
      if (!raw) return;
      const data: { lastDate: string; count: number } = JSON.parse(raw);
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86_400_000)
        .toISOString()
        .split("T")[0];
      if (data.lastDate === today || data.lastDate === yesterday) {
        setStreak(data.count);
      }
    });
  }, []);

  useEffect(() => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(
          `https://${domain}/api/users/me/score-history`,
          { headers }
        );
        if (!res.ok) return;
        const data = await res.json();
        const mapped: ScoreSnapshot[] = (data.snapshots ?? []).map(
          (s: any) => ({
            date: s.snapshotAt?.split("T")[0] ?? "",
            overall: s.scoreOverall,
            financial: s.scoreFinancial,
            health: s.scoreHealth,
            skills: s.scoreSkills,
            mobility: s.scoreMobility,
            psychological: s.scorePsychological,
            resources: s.scoreResources,
          })
        );
        setSnapshots(mapped);
      } catch {}
    })();
  }, []);

  const calendarDays = useMemo(() => buildCalendarDays(history), [history]);
  const totalCheckins = history.length;

  return (
    <ProGate>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress</Text>
          {streak >= 2 && (
            <View style={styles.streakBadge}>
              <Text style={{ fontSize: 13 }}>🔥</Text>
              <Text style={styles.streakText}>{streak}-day streak</Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 48 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 30-Day Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.eyebrow}>30-DAY ACTIVITY</Text>
              <Text style={styles.sectionStat}>
                {totalCheckins} check-in{totalCheckins !== 1 ? "s" : ""} total
              </Text>
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day) => (
                <View
                  key={day.date}
                  style={[
                    styles.calDot,
                    {
                      backgroundColor: calDotColor(day.avg, colors),
                      borderColor: day.hasEntry
                        ? calDotColor(day.avg, colors) + "50"
                        : colors.border,
                      opacity: day.hasEntry ? 1 : 0.35,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.calLegend}>
              {([
                { color: colors.success, label: "Strong (4–5)" },
                { color: "#F59E0B", label: "Moderate (3)" },
                { color: colors.danger, label: "Low (1–2)" },
              ] as const).map((item) => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Score Trend */}
          <View style={styles.section}>
            <Text style={styles.eyebrow}>SCORE TREND</Text>
            <View style={styles.chartCard}>
              <ScoreHistoryChart
                snapshots={snapshots}
                isPro={isPro}
                width={CHART_W}
              />
            </View>
          </View>

        </ScrollView>
      </View>
    </ProGate>
  );
}

const DOT_SIZE = Math.floor((SCREEN_W - 48 - 6 * 6) / 7);

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 4,
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: colors.text,
      letterSpacing: -0.8,
    },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(224,128,64,0.12)",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: "rgba(224,128,64,0.25)",
    },
    streakText: {
      fontFamily: "Inter_700Bold",
      fontSize: 12,
      color: colors.primary,
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    section: {
      marginTop: 28,
      gap: 12,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    eyebrow: {
      fontFamily: "Inter_700Bold",
      fontSize: 10,
      color: colors.primary,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    sectionStat: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.textMuted,
    },
    calendarGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    calDot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      borderWidth: 1,
    },
    calLegend: {
      flexDirection: "row",
      gap: 16,
      marginTop: 4,
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
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.textMuted,
    },
    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
