import React, { useState, useRef, useMemo, useEffect } from "react";
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
  TextInput,
  Modal,
  type DimensionValue,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useQuery } from "@tanstack/react-query";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { requestNotificationPermission, getExpoPushToken, registerPushTokenWithBackend } from "@/utils/notifications";

const PUSH_PROMPTED_KEY = "resilium_push_prompted_v1";

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

type MentalResilienceProfile = {
  stressTolerance: number;
  adaptability: number;
  learningAgility: number;
  changeManagement: number;
  emotionalRegulation: number;
  socialSupport: number;
  composite: number;
  pathway: "growth" | "compensation";
};

type ChecklistItem = {
  id: string;
  title: string;
  description?: string;
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
  mentalResilienceProfile?: MentalResilienceProfile;
  checklistsByArea?: Record<string, ChecklistItem[]>;
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
  const [percentileData, setPercentileData] = useState<{ percentile: number; total: number } | null>(null);
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({});
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [sharingScorecard, setSharingScorecard] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const scorecardRef = useRef<ViewShot | null>(null);

  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { getAuthHeaders, isSignedIn } = useAuth();

  const topPad = insets.top;
  const bottomPad = insets.bottom;

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

  React.useEffect(() => {
    if (!report?.score?.overall) return;
    fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/resilience/percentile?score=${report.score.overall}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.percentile != null && setPercentileData(d))
      .catch(() => {});
  }, [report?.score?.overall]);

  React.useEffect(() => {
    if (!reportId) return;
    fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/resilience/reports/${reportId}/checklists`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.progress) return;
        const map: Record<string, boolean> = {};
        d.progress.forEach((p: { area: string; itemId: string; completed: boolean }) => {
          map[`${p.area}::${p.itemId}`] = p.completed;
        });
        setChecklistProgress(map);
      })
      .catch(() => {});
  }, [reportId]);

  useEffect(() => {
    if (!report?.score?.overall) return;
    const timer = setTimeout(async () => {
      try {
        const val = await AsyncStorage.getItem(PUSH_PROMPTED_KEY);
        if (val === null) setShowPushPrompt(true);
      } catch {}
    }, 2500);
    return () => clearTimeout(timer);
  }, [report?.score?.overall]);

  const handleAllowPush = async () => {
    setShowPushPrompt(false);
    await AsyncStorage.setItem(PUSH_PROMPTED_KEY, "1");
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        const token = await getExpoPushToken();
        if (token && isSignedIn) {
          const headers = await getAuthHeaders();
          await registerPushTokenWithBackend(token, process.env.EXPO_PUBLIC_DOMAIN ?? "", headers);
        }
      }
    } catch {}
  };

  const handleDismissPush = async () => {
    setShowPushPrompt(false);
    await AsyncStorage.setItem(PUSH_PROMPTED_KEY, "1");
  };

  const handleChecklistToggle = async (area: string, itemId: string) => {
    Haptics.selectionAsync();
    const key = `${area}::${itemId}`;
    const current = checklistProgress[key] ?? false;
    setChecklistProgress(prev => ({ ...prev, [key]: !current }));
    try {
      await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/resilience/reports/${reportId}/checklists/${area}/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      });
    } catch {
      setChecklistProgress(prev => ({ ...prev, [key]: current }));
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackRating || !reportId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFeedbackSubmitting(true);
    try {
      await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, rating: feedbackRating, comment: feedbackComment.trim() || undefined }),
      });
      setFeedbackSubmitted(true);
    } catch {
      // fail silently — don't block user for feedback errors
    } finally {
      setFeedbackSubmitting(false);
    }
  };

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

  const handleShareScorecard = async () => {
    if (!scorecardRef.current?.capture || !report) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSharingScorecard(true);
    try {
      const tmpUri = await scorecardRef.current.capture();
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(tmpUri, {
          mimeType: "image/png",
          dialogTitle: "Share your Resilium Scorecard",
          UTI: "public.png",
        });
      } else {
        const url = `https://${process.env.EXPO_PUBLIC_DOMAIN}/results/${reportId}`;
        await Share.share({
          message: `My Resilium Score is ${Math.round(report.score.overall)}/100. Check yours at ${url}`,
          title: "My Resilium Scorecard",
        });
      }
    } catch {
    } finally {
      setSharingScorecard(false);
    }
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

        {percentileData != null && (
          <View style={styles.percentileCard}>
            <Feather name="users" size={13} color={colors.primary} />
            <Text style={styles.percentileText}>
              You scored higher than{" "}
              <Text style={[styles.percentileBold, { color: colors.primary }]}>{percentileData.percentile}%</Text>
              {" "}of {percentileData.total.toLocaleString()} users
            </Text>
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Category Scores</Text>
          <RadarChart score={report.score} colors={colors} styles={styles} />
        </View>

        {report.mentalResilienceProfile && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Feather name="activity" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Mental Resilience Profile</Text>
            </View>
            <View style={[styles.pathwayBadge, report.mentalResilienceProfile.pathway === "growth" ? styles.pathwayGrowth : styles.pathwayComp]}>
              <Feather
                name={report.mentalResilienceProfile.pathway === "growth" ? "trending-up" : "shield"}
                size={14}
                color={report.mentalResilienceProfile.pathway === "growth" ? colors.success : colors.primary}
              />
              <Text style={[styles.pathwayText, { color: report.mentalResilienceProfile.pathway === "growth" ? colors.success : colors.primary }]}>
                {report.mentalResilienceProfile.pathway === "growth" ? "Growth Pathway" : "Compensation Pathway"}
                {"  "}
                <Text style={styles.pathwayScore}>{report.mentalResilienceProfile.composite}/100 composite</Text>
              </Text>
            </View>
            {([
              { key: "stressTolerance", label: "Stress Tolerance" },
              { key: "adaptability", label: "Adaptability" },
              { key: "learningAgility", label: "Learning Agility" },
              { key: "changeManagement", label: "Change Management" },
              { key: "emotionalRegulation", label: "Emotional Regulation" },
              { key: "socialSupport", label: "Social Support" },
            ] as { key: keyof MentalResilienceProfile; label: string }[]).map(({ key, label }) => {
              const val = report.mentalResilienceProfile![key] as number;
              const barColor = val >= 70 ? colors.success : val >= 40 ? "#F59E0B" : colors.danger;
              return (
                <View key={key} style={styles.mrDimRow}>
                  <Text style={styles.mrDimLabel}>{label}</Text>
                  <View style={styles.mrBarTrack}>
                    <View style={[styles.mrBarFill, { width: `${val}%` as any, backgroundColor: barColor }]} />
                  </View>
                  <Text style={[styles.mrDimVal, { color: barColor }]}>{val}</Text>
                </View>
              );
            })}
          </View>
        )}

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

        {report.checklistsByArea && Object.keys(report.checklistsByArea).length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Feather name="check-square" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Action Checklist</Text>
            </View>
            <Text style={styles.checklistSubtitle}>Track your progress across each area</Text>
            {Object.entries(report.checklistsByArea).map(([area, items]) => {
              const areaKey = area as string;
              const completedCount = items.filter(item => checklistProgress[`${areaKey}::${item.id}`]).length;
              return (
                <View key={area} style={styles.checklistArea}>
                  <View style={styles.checklistAreaHeader}>
                    <Text style={styles.checklistAreaTitle}>{area}</Text>
                    <Text style={styles.checklistAreaProgress}>{completedCount}/{items.length}</Text>
                  </View>
                  {items.map(item => {
                    const done = checklistProgress[`${areaKey}::${item.id}`] ?? false;
                    return (
                      <Pressable
                        key={item.id}
                        style={styles.checklistItem}
                        onPress={() => handleChecklistToggle(areaKey, item.id)}
                      >
                        <View style={[styles.checklistBox, done && styles.checklistBoxDone]}>
                          {done && <Feather name="check" size={11} color={colors.background} />}
                        </View>
                        <Text style={[styles.checklistItemText, done && styles.checklistItemTextDone]}>
                          {item.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.feedbackCard}>
          {feedbackSubmitted ? (
            <View style={styles.feedbackThanks}>
              <Feather name="check-circle" size={22} color={colors.success} />
              <Text style={styles.feedbackThanksText}>Thank you for your feedback!</Text>
            </View>
          ) : (
            <>
              <Text style={styles.feedbackTitle}>How was your report?</Text>
              <Text style={styles.feedbackSub}>Your rating helps us improve.</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Pressable key={star} onPress={() => { Haptics.selectionAsync(); setFeedbackRating(star); }} hitSlop={8}>
                    <Feather
                      name="star"
                      size={30}
                      color={feedbackRating != null && star <= feedbackRating ? "#F59E0B" : colors.border}
                    />
                  </Pressable>
                ))}
              </View>
              {feedbackRating != null && (
                <>
                  <TextInput
                    style={styles.feedbackInput}
                    placeholder="Add a comment (optional)…"
                    placeholderTextColor={colors.textMuted}
                    value={feedbackComment}
                    onChangeText={setFeedbackComment}
                    multiline
                    maxLength={500}
                  />
                  <Pressable
                    style={({ pressed }) => [styles.feedbackSubmitBtn, pressed && { opacity: 0.8 }, feedbackSubmitting && { opacity: 0.6 }]}
                    onPress={handleFeedbackSubmit}
                    disabled={feedbackSubmitting}
                  >
                    <Text style={styles.feedbackSubmitText}>{feedbackSubmitting ? "Submitting…" : "Submit Feedback"}</Text>
                  </Pressable>
                </>
              )}
            </>
          )}
        </View>

        <View style={styles.bottomActions}>
          <Pressable style={styles.shareFullBtn} onPress={handleShare}>
            <Feather name="share-2" size={16} color={colors.background} />
            <Text style={styles.shareFullBtnText}>{copied ? "Link Copied!" : "Share Report"}</Text>
          </Pressable>

          <Pressable
            style={[styles.scorecardShareBtn, sharingScorecard && { opacity: 0.6 }]}
            onPress={handleShareScorecard}
            disabled={sharingScorecard}
          >
            <Feather name="image" size={16} color={colors.primary} />
            <Text style={styles.scorecardShareBtnText}>
              {sharingScorecard ? "Generating…" : "Share Scorecard Image"}
            </Text>
          </Pressable>

          <Pressable style={styles.scenarioBtn} onPress={() => router.push({ pathname: "/scenarios", params: { reportId } })}>
            <Feather name="zap" size={16} color={colors.primary} />
            <Text style={styles.scenarioBtnText}>Run Scenario Stress-Test (Pro)</Text>
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

      {/* Hidden scorecard for image capture — off-screen only, no opacity:0 for reliable capture */}
      <ViewShot
        ref={scorecardRef}
        options={{ format: "png", quality: 1.0 }}
        style={styles.hiddenScorecard}
        collapsable={false}
      >
        <MobileScorecardImage score={report.score} scoreLabel={scoreLabel} scoreColor={scoreColor} mentalResilienceProfile={report.mentalResilienceProfile} />
      </ViewShot>

      {/* Push notification permission bottom sheet */}
      <Modal
        visible={showPushPrompt}
        transparent
        animationType="slide"
        onRequestClose={handleDismissPush}
      >
        <View style={styles.pushOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismissPush} />
          <View style={styles.pushSheet}>
            <View style={styles.pushHandle} />
            <View style={styles.pushIconRow}>
              <View style={styles.pushIconOrb}>
                <Feather name="bell" size={26} color={colors.primary} />
              </View>
            </View>
            <Text style={styles.pushTitle}>Stay ahead of your blind spots</Text>
            <Text style={styles.pushBody}>
              Get notified when it's time to reassess your resilience, when new scenarios match your profile, or when real-world events could affect your score.
            </Text>
            <View style={styles.pushBullets}>
              {[
                { icon: "clock" as const, text: "Timely reassessment reminders" },
                { icon: "alert-triangle" as const, text: "Scenario alerts relevant to you" },
                { icon: "trending-up" as const, text: "Progress milestone celebrations" },
              ].map(b => (
                <View key={b.text} style={styles.pushBulletRow}>
                  <View style={styles.pushBulletIcon}>
                    <Feather name={b.icon} size={12} color={colors.primary} />
                  </View>
                  <Text style={styles.pushBulletText}>{b.text}</Text>
                </View>
              ))}
            </View>
            <Pressable
              style={({ pressed }) => [styles.pushAllowBtn, pressed && { opacity: 0.85 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleAllowPush(); }}
            >
              <Feather name="bell" size={16} color="#fff" />
              <Text style={styles.pushAllowText}>Allow Notifications</Text>
            </Pressable>
            <Pressable
              style={styles.pushDismissBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleDismissPush(); }}
            >
              <Text style={styles.pushDismissText}>Not Now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MobileScorecardImage({
  score,
  scoreLabel,
  scoreColor,
  mentalResilienceProfile,
}: {
  score: ScoreObj;
  scoreLabel: string;
  scoreColor: string;
  mentalResilienceProfile?: MentalResilienceProfile;
}) {
  const CATEGORIES = [
    { key: "financial" as const, label: "Financial" },
    { key: "health" as const, label: "Health" },
    { key: "skills" as const, label: "Skills" },
    { key: "mobility" as const, label: "Mobility" },
    { key: "psychological" as const, label: "Psychological" },
    { key: "resources" as const, label: "Resources" },
  ];

  const getBarColor = (val: number) =>
    val >= 70 ? "#10b981" : val >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <View style={scorecardStyles.card}>
      {/* Header */}
      <View style={scorecardStyles.header}>
        <View style={scorecardStyles.logoRow}>
          <Text style={scorecardStyles.logoIcon}>🛡️</Text>
          <Text style={scorecardStyles.logoText}>Resilium</Text>
        </View>
        <Text style={scorecardStyles.url}>resilium.app</Text>
      </View>

      {/* Score circle */}
      <View style={scorecardStyles.scoreSection}>
        <Text style={scorecardStyles.scoreLabel}>MY RESILIENCE SCORE</Text>
        <View style={[scorecardStyles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[scorecardStyles.scoreNumber, { color: scoreColor }]}>
            {Math.round(score.overall)}
          </Text>
          <Text style={scorecardStyles.scoreMax}>/100</Text>
        </View>
        <View style={[scorecardStyles.labelBadge, { backgroundColor: scoreColor + "20", borderColor: scoreColor + "40" }]}>
          <Text style={[scorecardStyles.labelBadgeText, { color: scoreColor }]}>{scoreLabel}</Text>
        </View>
        {mentalResilienceProfile && (
          <View style={scorecardStyles.pathwayRow}>
            <Text style={[scorecardStyles.pathwayText, { color: mentalResilienceProfile.pathway === "growth" ? "#10b981" : "#e08240" }]}>
              {mentalResilienceProfile.pathway === "growth" ? "↑ Growth Pathway" : "◆ Compensation Pathway"}
            </Text>
          </View>
        )}
      </View>

      {/* Category bars */}
      <View style={scorecardStyles.categories}>
        <Text style={scorecardStyles.categoriesTitle}>CATEGORY BREAKDOWN</Text>
        {CATEGORIES.map(({ key, label }) => {
          const val = Math.round(score[key]);
          const color = getBarColor(val);
          return (
            <View key={key} style={scorecardStyles.catRow}>
              <Text style={scorecardStyles.catLabel}>{label}</Text>
              <View style={scorecardStyles.catBarTrack}>
                <View style={[scorecardStyles.catBarFill, { width: `${val}%` as DimensionValue, backgroundColor: color }]} />
              </View>
              <Text style={[scorecardStyles.catVal, { color }]}>{val}</Text>
            </View>
          );
        })}
      </View>

      {/* Footer */}
      <Text style={scorecardStyles.footer}>
        Discover your score at{" "}
        <Text style={{ color: "#e08240" }}>resilium.app</Text>
      </Text>
    </View>
  );
}

const scorecardStyles = StyleSheet.create({
  card: {
    width: 1080,
    height: 1080,
    backgroundColor: "#0f1c14",
    padding: 64,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    fontSize: 32,
  },
  logoText: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#e08240",
    letterSpacing: -0.5,
  },
  url: {
    fontSize: 20,
    color: "#6b7280",
    fontFamily: "Inter_400Regular",
  },
  scoreSection: {
    alignItems: "center",
    gap: 20,
  },
  scoreLabel: {
    fontSize: 18,
    color: "#9ca3af",
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
  scoreCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: 80,
    fontFamily: "Inter_700Bold",
    letterSpacing: -3,
    lineHeight: 84,
  },
  scoreMax: {
    fontSize: 18,
    color: "#6b7280",
    fontFamily: "Inter_400Regular",
  },
  labelBadge: {
    borderWidth: 1.5,
    borderRadius: 40,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  labelBadgeText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  pathwayRow: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  pathwayText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  categories: {
    gap: 16,
  },
  categoriesTitle: {
    fontSize: 14,
    color: "#6b7280",
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 4,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  catLabel: {
    fontSize: 16,
    color: "#9ca3af",
    fontFamily: "Inter_400Regular",
    width: 150,
  },
  catBarTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  catBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  catVal: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    width: 40,
    textAlign: "right",
  },
  footer: {
    fontSize: 16,
    color: "#4b5563",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});

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
  percentileCard: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 10,
    paddingHorizontal: 14, borderWidth: 1, borderColor: colors.primary + "33",
  },
  percentileText: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary,
    flex: 1,
  },
  percentileBold: {
    fontFamily: "Inter_700Bold", fontSize: 13,
  },
  pathwayBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12,
    marginBottom: 14, borderWidth: 1,
  },
  pathwayGrowth: {
    backgroundColor: colors.success + "15", borderColor: colors.success + "40",
  },
  pathwayComp: {
    backgroundColor: colors.primary + "15", borderColor: colors.primary + "40",
  },
  pathwayText: {
    fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1,
  },
  pathwayScore: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted,
  },
  mrDimRow: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8,
  },
  mrDimLabel: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary, width: 120,
  },
  mrBarTrack: {
    flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: "hidden",
  },
  mrBarFill: {
    height: "100%", borderRadius: 3,
  },
  mrDimVal: {
    fontFamily: "Inter_700Bold", fontSize: 12, width: 28, textAlign: "right",
  },
  checklistSubtitle: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted, marginBottom: 12,
  },
  checklistArea: {
    marginBottom: 16,
  },
  checklistAreaHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 8,
  },
  checklistAreaTitle: {
    fontFamily: "Inter_600SemiBold", fontSize: 13,
    color: colors.text, textTransform: "capitalize",
  },
  checklistAreaProgress: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted,
  },
  checklistItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 6,
  },
  checklistBox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.background,
  },
  checklistBoxDone: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  checklistItemText: {
    fontFamily: "Inter_400Regular", fontSize: 13,
    color: colors.text, flex: 1, lineHeight: 18,
  },
  checklistItemTextDone: {
    color: colors.textMuted, textDecorationLine: "line-through",
  },
  feedbackCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 10,
  },
  feedbackTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: colors.text, letterSpacing: -0.3 },
  feedbackSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted },
  starsRow: { flexDirection: "row", gap: 10, paddingVertical: 4 },
  feedbackInput: {
    width: "100%", borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background, padding: 12,
    fontFamily: "Inter_400Regular", fontSize: 14, color: colors.text,
    minHeight: 72, textAlignVertical: "top",
  },
  feedbackSubmitBtn: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 24, alignSelf: "stretch", alignItems: "center",
  },
  feedbackSubmitText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.background },
  feedbackThanks: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  feedbackThanksText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.success },
  scenarioBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 12, borderWidth: 1, borderColor: colors.primary + "55",
    paddingVertical: 12, backgroundColor: colors.primary + "10",
  },
  scenarioBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.primary },
  scorecardShareBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary + "66",
    paddingVertical: 13, backgroundColor: colors.primary + "15",
  },
  scorecardShareBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: colors.primary },
  hiddenScorecard: {
    position: "absolute",
    left: -9999,
    top: -9999,
    width: 1080,
    height: 1080,
    pointerEvents: "none",
  },
  pushOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  pushSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  pushHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 4,
  },
  pushIconRow: {
    alignItems: "center",
  },
  pushIconOrb: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(224,128,64,0.15)",
    borderWidth: 1, borderColor: "rgba(224,128,64,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  pushTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  pushBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  pushBullets: { gap: 8 },
  pushBulletRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9,
    borderWidth: 1, borderColor: colors.border,
  },
  pushBulletIcon: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(224,128,64,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  pushBulletText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13, color: colors.text,
  },
  pushAllowBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 15,
    marginTop: 4,
  },
  pushAllowText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16, color: "#fff",
  },
  pushDismissBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  pushDismissText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14, color: colors.textMuted,
  },
});
