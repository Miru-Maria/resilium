import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { router, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

const CHECKIN_KEY = "resilium_checkin_history_v1";

const DIMENSIONS = [
  { key: "financial",    label: "Financial",     icon: "dollar-sign", desc: "How secure do you feel financially today?" },
  { key: "health",       label: "Health",         icon: "heart",       desc: "How is your physical and mental health today?" },
  { key: "skills",       label: "Skills",         icon: "zap",         desc: "How confident are you in your practical skills?" },
  { key: "social",       label: "Social Capital", icon: "users",       desc: "How supported do you feel by your network?" },
  { key: "resources",    label: "Resources",      icon: "shield",      desc: "How prepared are your emergency supplies?" },
] as const;

type DimKey = typeof DIMENSIONS[number]["key"];

const SCORE_LABELS: Record<number, string> = {
  1: "Very low",
  2: "Low",
  3: "Moderate",
  4: "Good",
  5: "Strong",
};

function RatingRow({
  dim,
  value,
  onChange,
  colors,
}: {
  dim: typeof DIMENSIONS[number];
  value: number;
  onChange: (v: number) => void;
  colors: ColorsType;
}) {
  const dotColor = value >= 4 ? colors.success : value >= 3 ? "#F59E0B" : colors.danger;
  return (
    <View style={{ gap: 12, paddingVertical: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
          <Feather name={dim.icon as any} size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.text }}>{dim.label}</Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{dim.desc}</Text>
        </View>
        <View style={{ alignItems: "center", minWidth: 48 }}>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color: dotColor }}>{value}</Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 10, color: colors.textMuted }}>{SCORE_LABELS[value]}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[1, 2, 3, 4, 5].map(n => {
          const selected = n === value;
          const btnColor = n >= 4 ? colors.success : n >= 3 ? "#F59E0B" : colors.danger;
          return (
            <Pressable
              key={n}
              onPress={() => { Haptics.selectionAsync(); onChange(n); }}
              style={({ pressed }) => [{
                flex: 1,
                height: 44,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: selected ? btnColor : colors.surface,
                borderWidth: 1.5,
                borderColor: selected ? btnColor : colors.border,
                opacity: pressed ? 0.75 : 1,
              }]}
            >
              <Text style={{ fontFamily: selected ? "Inter_700Bold" : "Inter_500Medium", fontSize: 15, color: selected ? "#fff" : colors.textMuted }}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function CheckinScreen() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const isTabRoot = segments[0] === "(tabs)";
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [values, setValues] = useState<Record<DimKey, number>>({
    financial: 3,
    health: 3,
    skills: 3,
    social: 3,
    resources: 3,
  });

  const [submitted, setSubmitted] = useState(false);
  const [alreadyDoneToday, setAlreadyDoneToday] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    AsyncStorage.getItem(CHECKIN_KEY).then(raw => {
      const history: Array<{ date: string; scores: Record<string, number> }> = raw ? JSON.parse(raw) : [];
      const todayEntry = history.find(h => h.date === today);
      if (todayEntry) {
        setValues(todayEntry.scores as any);
        setAlreadyDoneToday(true);
        setSubmitted(true);
      }
    });
  }, []);

  const overallAvg = Math.round(
    Object.values(values).reduce((s, v) => s + v, 0) / DIMENSIONS.length
  );

  const avgColor = overallAvg >= 4 ? colors.success : overallAvg >= 3 ? "#F59E0B" : colors.danger;
  const avgLabel = overallAvg >= 4 ? "Looking strong" : overallAvg >= 3 ? "Holding steady" : "Some gaps to address";

  const handleSubmit = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const today = new Date().toISOString().split("T")[0];
    const raw = await AsyncStorage.getItem(CHECKIN_KEY);
    const history: Array<{ date: string; scores: Record<string, number> }> = raw ? JSON.parse(raw) : [];
    const filtered = history.filter(h => h.date !== today);
    filtered.unshift({ date: today, scores: values });
    await AsyncStorage.setItem(CHECKIN_KEY, JSON.stringify(filtered.slice(0, 30)));
    setSubmitted(true);
    setAlreadyDoneToday(true);
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Daily Check-In</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: bottomPad + 40, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        {!submitted && (
          <View style={{ paddingTop: 20, gap: 6 }}>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 22, color: colors.text, letterSpacing: -0.5 }}>How are you today?</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textMuted, lineHeight: 21 }}>
              Rate each dimension from 1 (very low) to 5 (strong). Takes about 60 seconds.
            </Text>
          </View>
        )}

        {/* Submitted state */}
        {submitted && (
          <View style={{ paddingTop: 20, gap: 16 }}>
            <View style={{ alignItems: "center", gap: 8, paddingVertical: 24, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 40 }}>{overallAvg >= 4 ? "💪" : overallAvg >= 3 ? "👍" : "⚠️"}</Text>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 28, color: avgColor }}>{overallAvg}/5</Text>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text }}>{avgLabel}</Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted }}>
                {alreadyDoneToday ? "Today's check-in recorded" : "Great — keep building!"}
              </Text>
            </View>

            {/* Dimension breakdown */}
            <View style={{ gap: 10 }}>
              {DIMENSIONS.map(dim => {
                const v = values[dim.key];
                const c = v >= 4 ? colors.success : v >= 3 ? "#F59E0B" : colors.danger;
                return (
                  <View key={dim.key} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
                      <Feather name={dim.icon as any} size={16} color={colors.primary} />
                    </View>
                    <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.text, flex: 1 }}>{dim.label}</Text>
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: c }}>{v}/5</Text>
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textMuted, minWidth: 56, textAlign: "right" }}>{SCORE_LABELS[v]}</Text>
                  </View>
                );
              })}
            </View>

            <Pressable
              onPress={() => router.push("/")}
              style={({ pressed }) => [{ backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: "center", opacity: pressed ? 0.88 : 1 }]}
            >
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: colors.background }}>Back to Dashboard</Text>
            </Pressable>
          </View>
        )}

        {/* Sliders */}
        {!submitted && (
          <View style={{ gap: 20 }}>
            {DIMENSIONS.map(dim => (
              <View key={dim.key} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <RatingRow
                  dim={dim}
                  value={values[dim.key]}
                  onChange={v => setValues(prev => ({ ...prev, [dim.key]: v }))}
                  colors={colors}
                />
              </View>
            ))}

            {/* Overall preview */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.primaryMuted, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.primaryBorder }}>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 24, color: avgColor }}>{overallAvg}/5</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.text }}>Overall today</Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted }}>{avgLabel}</Text>
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [{ borderRadius: 14, overflow: "hidden", opacity: pressed ? 0.88 : 1 }]}
            >
              <View style={{ backgroundColor: colors.primary, padding: 18, alignItems: "center" }}>
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.background }}>Save Today's Check-In ✓</Text>
              </View>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: colors.text,
      letterSpacing: -0.3,
    },
  });
