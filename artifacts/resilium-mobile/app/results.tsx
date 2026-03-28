import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
  Animated,
  Dimensions,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useQuery } from "@tanstack/react-query";

import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ScoreObj = {
  overall: number;
  financial: number;
  health: number;
  skills: number;
  mobility: number;
  psychological: number;
  resources: number;
};

type ActionItem = {
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
};

type Scenario = {
  scenario: string;
  impact: "severe" | "high" | "moderate" | "low";
  description: string;
  immediateSteps: string[];
  timeToRecover: string;
};

type Habit = {
  habit: string;
  frequency: string;
  category: string;
};

type Resource = {
  title: string;
  category: string;
  description: string;
  url: string;
  badge: string;
  priority: "critical" | "high" | "medium" | "low";
};

type Report = {
  reportId: string;
  createdAt: string;
  score: ScoreObj;
  riskProfileSummary: string;
  topVulnerabilities: string[];
  actionPlan: {
    shortTerm: ActionItem[];
    midTerm: ActionItem[];
    longTerm: ActionItem[];
  };
  scenarioSimulations: Scenario[];
  dailyHabits: Habit[];
  recommendedResources?: Resource[];
  input?: { location?: string };
};

function RadarChart({ score, colors, styles }: { score: ScoreObj, colors: ColorsType, styles: any }) {
  const dims = [
    { key: "financial", label: "Financial" },
    { key: "health", label: "Health" },
    { key: "skills", label: "Skills" },
    { key: "mobility", label: "Mobility" },
    { key: "psychological", label: "Psychology" },
    { key: "resources", label: "Resources" },
  ];

  return (
    <View style={styles.radarContainer}>
      {dims.map((dim) => {
        const val = score[dim.key as keyof ScoreObj] as number;
        const color = val >= 70 ? colors.success : val >= 40 ? colors.warning : colors.danger;
        return (
          <View key={dim.key} style={styles.radarRow}>
            <Text style={styles.radarLabel}>{dim.label}</Text>
            <View style={styles.radarBarTrack}>
              <View style={[styles.radarBarFill, { width: `${val}%` as any, backgroundColor: color }]} />
            </View>
            <Text style={[styles.radarScore, { color }]}>{Math.round(val)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const PLAN_TABS = [
  { key: "shortTerm" as const, label: "0–30 Days" },
  { key: "midTerm" as const, label: "3–6 Months" },
  { key: "longTerm" as const, label: "Long Term" },
];

function PriorityBadge({ priority, colors, styles }: { priority: string, colors: ColorsType, styles: any }) {
  const config = {
    critical: { bg: colors.dangerMuted, text: colors.danger },
    high: { bg: colors.warningMuted, text: colors.warning },
    medium: { bg: colors.primaryMuted, text: colors.primary },
    low: { bg: colors.surface, text: colors.textMuted },
  };
  const c = config[priority as keyof typeof config] ?? config.low;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{priority.toUpperCase()}</Text>
    </View>
  );
}

function ImpactBadge({ impact, colors, styles }: { impact: string, colors: ColorsType, styles: any }) {
  const config = {
    severe: { bg: colors.dangerMuted, text: colors.danger },
    high: { bg: colors.warningMuted, text: colors.warning },
    moderate: { bg: colors.primaryMuted, text: colors.primary },
    low: { bg: colors.successMuted, text: colors.success },
  };
  const c = config[impact as keyof typeof config] ?? config.moderate;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{impact.toUpperCase()}</Text>
    </View>
  );
}

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const [activeTab, setActiveTab] = useState<"shortTerm" | "midTerm" | "longTerm">("shortTerm");
  const [expandedScenario, setExpandedScenario] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: report, isLoading, error } = useQuery<Report>({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const res = await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/resilience/reports/${reportId}`);
      if (!res.ok) throw new Error("Report not found");
      return res.json();
    },
    enabled: !!reportId,
    retry: 2,
  });

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = `https://${process.env.EXPO_PUBLIC_DOMAIN}/results/${reportId}`;
    const msg = `My Resilium Score is ${Math.round(report?.score.overall ?? 0)}/100. Check your readiness: ${url}`;
    try {
      await Clipboard.setStringAsync(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
    try {
      await Share.share({ message: msg, url });
    } catch {}
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: topPad }]}>
        <Feather name="loader" size={32} color={colors.primary} />
        <Text style={styles.loadingText}>Loading your report...</Text>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={[styles.center, { paddingTop: topPad }]}>
        <Feather name="alert-circle" size={48} color={colors.danger} />
        <Text style={styles.errorTitle}>Report Not Found</Text>
        <Text style={styles.errorMsg}>This report could not be found. It may have expired.</Text>
        <Pressable style={styles.retryBtn} onPress={() => router.replace("/")}>
          <Text style={styles.retryBtnText}>Go Home</Text>
        </Pressable>
      </View>
    );
  }

  const scoreColor = report.score.overall >= 70 ? colors.success : report.score.overall >= 40 ? colors.warning : colors.danger;
  const scoreLabel = report.score.overall >= 70 ? "Highly Resilient" : report.score.overall >= 40 ? "Moderately Prepared" : "Critically Vulnerable";

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push("/")} style={styles.homeBtn} hitSlop={12}>
          <Feather name="home" size={18} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Feather name="shield" size={16} color={colors.primary} />
          <Text style={styles.topBarTitle}>Your Report</Text>
        </View>
        <Pressable onPress={handleShare} style={styles.shareBtn} hitSlop={12} testID="share-btn">
          <Feather name={copied ? "check" : "share-2"} size={18} color={copied ? colors.success : colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={[styles.heroScore, { color: scoreColor }]}>{Math.round(report.score.overall)}</Text>
            <Text style={styles.heroScoreMax}>/100</Text>
            <View style={[styles.heroLabel, { backgroundColor: scoreColor + "22", borderColor: scoreColor + "44" }]}>
              <Text style={[styles.heroLabelText, { color: scoreColor }]}>{scoreLabel}</Text>
            </View>
          </View>
          <View style={styles.heroRight}>
            <Text style={styles.heroSummary} numberOfLines={6}>{report.riskProfileSummary}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Category Scores</Text>
          <RadarChart score={report.score} colors={colors} styles={styles} />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="alert-triangle" size={16} color={colors.danger} />
            <Text style={styles.sectionTitle}>Critical Vulnerabilities</Text>
          </View>
          {report.topVulnerabilities.map((v, i) => (
            <View key={i} style={styles.vulnItem}>
              <View style={styles.vulnNum}>
                <Text style={styles.vulnNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.vulnText}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="check-circle" size={16} color={colors.success} />
            <Text style={styles.sectionTitle}>Action Plan</Text>
          </View>
          <View style={styles.tabRow}>
            {PLAN_TABS.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => { Haptics.selectionAsync(); setActiveTab(tab.key); }}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.actionList}>
            {report.actionPlan[activeTab].map((item, i) => (
              <View key={i} style={styles.actionItem}>
                <View style={styles.actionHeader}>
                  <PriorityBadge priority={item.priority} colors={colors} styles={styles} />
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.actionTitle}>{item.title}</Text>
                <Text style={styles.actionDesc}>{item.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="zap" size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Stress Test Scenarios</Text>
          </View>
          {report.scenarioSimulations.map((s, i) => (
            <View key={i} style={styles.scenarioItem}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setExpandedScenario(expandedScenario === i ? null : i);
                }}
                style={styles.scenarioHeader}
              >
                <View style={styles.scenarioHeaderLeft}>
                  <Text style={styles.scenarioTitle}>{s.scenario}</Text>
                  <ImpactBadge impact={s.impact} colors={colors} styles={styles} />
                </View>
                <Feather
                  name={expandedScenario === i ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
              {expandedScenario === i && (
                <View style={styles.scenarioExpanded}>
                  <Text style={styles.scenarioDesc}>{s.description}</Text>
                  <Text style={styles.scenarioStepsTitle}>Immediate steps:</Text>
                  {s.immediateSteps.map((step, j) => (
                    <View key={j} style={styles.scenarioStep}>
                      <View style={styles.scenarioStepDot} />
                      <Text style={styles.scenarioStepText}>{step}</Text>
                    </View>
                  ))}
                  <View style={styles.recoveryRow}>
                    <Feather name="clock" size={13} color={colors.textMuted} />
                    <Text style={styles.recoveryText}>Est. recovery: {s.timeToRecover}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder }]}>
          <View style={styles.sectionHeader}>
            <Feather name="sun" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Daily Habits</Text>
          </View>
          {report.dailyHabits.map((h, i) => (
            <View key={i} style={[styles.habitItem, i < report.dailyHabits.length - 1 && styles.habitItemBorder]}>
              <Feather name="check" size={14} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.habitText}>{h.habit}</Text>
                <Text style={styles.habitFreq}>{h.frequency} · {h.category}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recommended Resources */}
        {report.recommendedResources && report.recommendedResources.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Feather name="book-open" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Recommended Resources</Text>
            </View>
            {report.input?.location && (
              <View style={styles.resourceLocationRow}>
                <Feather name="map-pin" size={12} color={colors.primary} />
                <Text style={styles.resourceLocationText}>
                  Personalized for {report.input.location}
                </Text>
              </View>
            )}
            <View style={styles.resourceList}>
              {report.recommendedResources.map((r, i) => {
                const priorityStyle = {
                  critical: { bg: colors.dangerMuted, text: colors.danger },
                  high: { bg: colors.warningMuted, text: colors.warning },
                  medium: { bg: colors.primaryMuted, text: colors.primary },
                  low: { bg: colors.surface, text: colors.textMuted },
                }[r.priority] ?? { bg: colors.surface, text: colors.textMuted };
                return (
                  <Pressable
                    key={i}
                    style={({ pressed }) => [styles.resourceCard, pressed && { opacity: 0.8 }]}
                    onPress={() => Linking.openURL(r.url)}
                  >
                    <View style={styles.resourceCardTop}>
                      <View style={styles.resourceIconWrap}>
                        <Feather name="external-link" size={14} color={colors.primary} />
                      </View>
                      <View style={styles.resourceBadges}>
                        <View style={[styles.resourcePriorityBadge, { backgroundColor: priorityStyle.bg }]}>
                          <Text style={[styles.resourcePriorityText, { color: priorityStyle.text }]}>
                            {r.priority.toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.resourceTypeBadge}>
                          <Text style={styles.resourceTypeText}>{r.badge}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.resourceCategory}>{r.category}</Text>
                    <Text style={styles.resourceTitle}>{r.title}</Text>
                    <Text style={styles.resourceDesc}>{r.description}</Text>
                    <View style={styles.resourceLink}>
                      <Text style={styles.resourceLinkText}>Visit resource</Text>
                      <Feather name="arrow-right" size={12} color={colors.primary} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.bottomActions}>
          <Pressable style={styles.shareFullBtn} onPress={handleShare}>
            <Feather name="share-2" size={16} color={colors.background} />
            <Text style={styles.shareFullBtnText}>{copied ? "Link Copied!" : "Share Report"}</Text>
          </Pressable>

          <Pressable style={styles.retakeBtn} onPress={() => router.push("/assessment")}>
            <Feather name="refresh-cw" size={16} color={colors.textSecondary} />
            <Text style={styles.retakeBtnText}>Retake Assessment</Text>
          </Pressable>

          <Pressable style={styles.dataBtn} onPress={() => router.push("/my-data")}>
            <Feather name="user" size={16} color={colors.textMuted} />
            <Text style={styles.dataBtnText}>My Data & Privacy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  errorMsg: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  retryBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  homeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border,
  },
  topBarCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  topBarTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.text },
  shareBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroLeft: { alignItems: "center", gap: 6, minWidth: 80 },
  heroScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 56,
    letterSpacing: -2,
    lineHeight: 60,
  },
  heroScoreMax: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.textMuted,
    marginTop: -4,
  },
  heroLabel: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  heroLabelText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroRight: { flex: 1 },
  heroSummary: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.3,
  },
  radarContainer: { gap: 10 },
  radarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radarLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: colors.textSecondary,
    width: 80,
  },
  radarBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  radarBarFill: {
    height: 6,
    borderRadius: 3,
  },
  radarScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    width: 28,
    textAlign: "right",
  },
  vulnItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.dangerMuted,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,69,69,0.2)",
  },
  vulnNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  vulnNumText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: colors.white,
  },
  vulnText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
    flex: 1,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: colors.textMuted,
  },
  tabTextActive: { color: colors.primary },
  actionList: { gap: 10 },
  actionItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionHeader: { flexDirection: "row", gap: 8 },
  actionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.text,
  },
  actionDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.surfaceElevated,
  },
  categoryBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: colors.textMuted,
  },
  scenarioItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  scenarioHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  scenarioHeaderLeft: { flex: 1, gap: 6 },
  scenarioTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.text,
  },
  scenarioExpanded: {
    padding: 14,
    paddingTop: 0,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scenarioDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  scenarioStepsTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scenarioStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  scenarioStepDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 5,
    flexShrink: 0,
  },
  scenarioStepText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  recoveryRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  recoveryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
  },
  habitItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBorder,
  },
  habitText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  habitFreq: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 2,
  },
  bottomActions: {
    gap: 12,
    marginTop: 8,
  },
  shareFullBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  shareFullBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.background,
  },
  retakeBtn: {
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retakeBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.textSecondary,
  },
  dataBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  dataBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: colors.textMuted,
  },
  resourceLocationRow: {
    flexDirection: "row", alignItems: "center", gap: 5,
    marginBottom: 12,
  },
  resourceLocationText: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: colors.primary,
  },
  resourceList: { gap: 12 },
  resourceCard: {
    backgroundColor: colors.background,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border,
    gap: 6,
  },
  resourceCardTop: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 2,
  },
  resourceIconWrap: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.primaryMuted,
    alignItems: "center", justifyContent: "center",
  },
  resourceBadges: { flexDirection: "row", gap: 5, alignItems: "center" },
  resourcePriorityBadge: {
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3,
  },
  resourcePriorityText: {
    fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 0.8,
  },
  resourceTypeBadge: {
    backgroundColor: colors.surface, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.border,
  },
  resourceTypeText: {
    fontFamily: "Inter_600SemiBold", fontSize: 8,
    color: colors.textMuted, letterSpacing: 0.5,
  },
  resourceCategory: {
    fontFamily: "Inter_600SemiBold", fontSize: 10,
    color: colors.primary, letterSpacing: 0.8, textTransform: "uppercase",
  },
  resourceTitle: {
    fontFamily: "Inter_700Bold", fontSize: 14, color: colors.text,
    letterSpacing: -0.2,
  },
  resourceDesc: {
    fontFamily: "Inter_400Regular", fontSize: 12,
    color: colors.textSecondary, lineHeight: 18,
  },
  resourceLink: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginTop: 4,
  },
  resourceLinkText: {
    fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.primary,
  },
});
