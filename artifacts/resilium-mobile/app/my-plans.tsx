import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

type PlanSummary = {
  reportId: string;
  createdAt: string;
  location: string;
  riskProfileSummary: string;
  score: {
    overall: number;
    financial: number;
    health: number;
    skills: number;
    mobility: number;
    psychological: number;
    resources: number;
  };
};

function scoreColor(score: number, colors: ColorsType) {
  if (score >= 70) return colors.success;
  if (score >= 40) return "#F59E0B";
  return colors.danger;
}

function scoreLabel(score: number) {
  if (score >= 70) return "Highly Resilient";
  if (score >= 40) return "Moderately Prepared";
  return "Critically Vulnerable";
}

export default function MyPlansScreen() {
  const insets = useSafeAreaInsets();
  const { getAuthHeaders, isSignedIn, user } = useAuth();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    fetch(`https://${domain}/api/resilience/my-reports`, {
      headers: getAuthHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load plans");
        const data = await res.json();
        setPlans(data.reports);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  const handleComparePlans = async () => {
    if (plans.length < 2) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setComparing(true);
    setShowCompare(true);
    try {
      const sorted = [...plans].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const ids = [sorted[sorted.length - 2].reportId, sorted[sorted.length - 1].reportId];
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const res = await fetch(`https://${domain}/api/users/me/plans/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ reportIdA: ids[0], reportIdB: ids[1] }),
      });
      if (!res.ok) throw new Error("Comparison failed");
      const data = await res.json();
      setCompareResult(data.comparison ?? data.analysis ?? JSON.stringify(data));
    } catch (e: any) {
      setCompareResult("Could not generate comparison: " + (e.message || "unknown error"));
    } finally {
      setComparing(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={20} color={colors.textSecondary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>My Plans</Text>
          {user?.firstName ? (
            <Text style={styles.headerSub}>{user.firstName}{user.lastName ? ` ${user.lastName}` : ""}</Text>
          ) : null}
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading your plans…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Feather name="alert-circle" size={40} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="clipboard" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No plans yet</Text>
            <Text style={styles.emptyDesc}>
              Complete an assessment and your plan will be saved here automatically.
            </Text>
            <Pressable
              style={styles.startBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.replace("/assessment");
              }}
            >
              <Text style={styles.startBtnText}>Start Assessment</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.countLabel}>
              {plans.length} saved plan{plans.length !== 1 ? "s" : ""}
            </Text>

            {plans.length >= 2 && (() => {
              const sorted = [...plans].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
              return (
                <View style={styles.trendCard}>
                  <View style={styles.trendHeader}>
                    <Feather name="trending-up" size={14} color={colors.primary} />
                    <Text style={styles.trendTitle}>Score Trend</Text>
                  </View>
                  <View style={styles.trendRow}>
                    {sorted.map((plan, i) => {
                      const next = sorted[i + 1];
                      const color = scoreColor(plan.score.overall, colors);
                      const diff = next ? next.score.overall - plan.score.overall : null;
                      return (
                        <React.Fragment key={plan.reportId}>
                          <View style={styles.trendDotWrap}>
                            <Text style={[styles.trendScoreVal, { color }]}>{plan.score.overall}</Text>
                            <View style={[styles.trendDot, { backgroundColor: color }]} />
                            <Text style={styles.trendDateLabel}>
                              {new Date(plan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </Text>
                          </View>
                          {diff != null && (
                            <View style={styles.trendConnector}>
                              <Feather
                                name={diff > 0 ? "trending-up" : diff < 0 ? "trending-down" : "minus"}
                                size={12}
                                color={diff > 0 ? colors.success : diff < 0 ? colors.danger : colors.textMuted}
                              />
                              <Text style={[styles.trendDiff, { color: diff > 0 ? colors.success : diff < 0 ? colors.danger : colors.textMuted }]}>
                                {diff > 0 ? "+" : ""}{diff}
                              </Text>
                            </View>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.compareBtn, pressed && { opacity: 0.75 }]}
                    onPress={handleComparePlans}
                    disabled={comparing}
                  >
                    {comparing
                      ? <ActivityIndicator size="small" color={colors.background} />
                      : <Feather name="git-compare" size={14} color={colors.background} />
                    }
                    <Text style={styles.compareBtnText}>
                      {comparing ? "Comparing…" : "Compare Last Two Plans (AI)"}
                    </Text>
                  </Pressable>
                </View>
              );
            })()}

            <Modal
              visible={showCompare}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={() => setShowCompare(false)}
            >
              <View style={[styles.modalContainer, { paddingTop: topPad + 8, paddingBottom: bottomPad + 20 }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Plan Comparison</Text>
                  <Pressable onPress={() => setShowCompare(false)} hitSlop={16}>
                    <Feather name="x" size={22} color={colors.textSecondary} />
                  </Pressable>
                </View>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                  {comparing
                    ? (
                      <View style={{ alignItems: "center", gap: 16, paddingTop: 60 }}>
                        <ActivityIndicator color={colors.primary} size="large" />
                        <Text style={styles.loadingText}>Analysing your progress…</Text>
                      </View>
                    )
                    : (
                      <Text style={styles.compareResultText}>{compareResult}</Text>
                    )
                  }
                </ScrollView>
              </View>
            </Modal>

            {[...plans].reverse().map((plan, i) => (
              <Pressable
                key={plan.reportId}
                style={({ pressed }) => [styles.planCard, pressed && styles.planCardPressed]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: "/results", params: { reportId: plan.reportId } });
                }}
                testID={`plan-card-${i}`}
              >
                <View style={styles.planCardTop}>
                  <View>
                    <Text style={styles.planDate}>{formatDate(plan.createdAt)}</Text>
                    {plan.location ? (
                      <View style={styles.locationRow}>
                        <Feather name="map-pin" size={11} color={colors.textMuted} />
                        <Text style={styles.planLocation}>{plan.location}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={[styles.scoreBadge, { borderColor: scoreColor(plan.score.overall, colors) + "40" }]}>
                    <Text style={[styles.scoreNum, { color: scoreColor(plan.score.overall, colors) }]}>
                      {plan.score.overall}
                    </Text>
                    <Text style={styles.scoreMax}>/100</Text>
                  </View>
                </View>

                <Text style={[styles.scoreLabel, { color: scoreColor(plan.score.overall, colors) }]}>
                  {scoreLabel(plan.score.overall)}
                </Text>

                <View style={styles.subScores}>
                  {[
                    { key: "financial", label: "Financial", val: plan.score.financial },
                    { key: "health", label: "Health", val: plan.score.health },
                    { key: "skills", label: "Skills", val: plan.score.skills },
                    { key: "mobility", label: "Mobility", val: plan.score.mobility },
                    { key: "psych", label: "Psych", val: plan.score.psychological },
                    { key: "resources", label: "Resources", val: plan.score.resources },
                  ].map((s) => (
                    <View key={s.key} style={styles.subScore}>
                      <View style={styles.subScoreBar}>
                        <View style={[styles.subScoreFill, { width: `${s.val}%` as any, backgroundColor: scoreColor(s.val, colors) }]} />
                      </View>
                      <Text style={styles.subScoreLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.planFooter}>
                  <Text style={styles.viewText}>View full plan</Text>
                  <Feather name="arrow-right" size={14} color={colors.primary} />
                </View>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text, letterSpacing: -0.3, textAlign: "center" },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 14 },
  center: { alignItems: "center", gap: 16, paddingTop: 60 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 15, color: colors.textSecondary },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 15, color: colors.danger, textAlign: "center" },
  emptyCard: {
    alignItems: "center", gap: 16,
    backgroundColor: colors.surface, borderRadius: 20, padding: 32,
    borderWidth: 1, borderColor: colors.border,
  },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: colors.text, letterSpacing: -0.5 },
  emptyDesc: {
    fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary,
    textAlign: "center", lineHeight: 20,
  },
  startBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24, marginTop: 8,
  },
  startBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.background },
  countLabel: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted,
    marginBottom: 2,
  },
  planCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: colors.border, gap: 10,
  },
  planCardPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  planCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  planDate: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  planLocation: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted },
  scoreBadge: {
    flexDirection: "row", alignItems: "baseline",
    backgroundColor: colors.background, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1,
  },
  scoreNum: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -1 },
  scoreMax: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted, marginLeft: 1 },
  scoreLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  subScores: { gap: 5 },
  subScore: { flexDirection: "row", alignItems: "center", gap: 8 },
  subScoreBar: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: colors.border, overflow: "hidden",
  },
  subScoreFill: { height: "100%", borderRadius: 2 },
  subScoreLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: colors.textMuted, width: 56 },
  planFooter: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 2 },
  viewText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.primary },
  trendCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  trendHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  trendTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.text },
  trendRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  trendDotWrap: { alignItems: "center", gap: 4 },
  trendScoreVal: { fontFamily: "Inter_700Bold", fontSize: 13 },
  trendDot: { width: 10, height: 10, borderRadius: 5 },
  trendDateLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: colors.textMuted },
  trendConnector: { alignItems: "center", gap: 2, paddingBottom: 10 },
  trendDiff: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  compareBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.primary, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, justifyContent: "center",
  },
  compareBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.background },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text, letterSpacing: -0.3 },
  compareResultText: {
    fontFamily: "Inter_400Regular", fontSize: 14, color: colors.text,
    lineHeight: 22,
  },
});
