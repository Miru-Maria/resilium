import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle } from "react-native-svg";

import { NeuralNetSVG } from "@/components/NeuralNetSVG";
import { OnboardingCarousel, shouldShowOnboarding } from "@/components/OnboardingCarousel";
import { ProGate } from "@/components/ProGate";

import { useSession } from "@/context/session";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";
import { computeBadgeCount, allDimsAssessedFromPlan } from "@/utils/badge-criteria";
import { getDailyTip, getLowestDim, DIM_LABELS, type DimKey } from "@/utils/tips-bank";
import { useProStatus } from "@/context/proStatus";

const { width: SCREEN_W } = Dimensions.get("window");

function AnimatedOrb({
  style,
  color,
  delay = 0,
  duration = 8000,
}: {
  style: any;
  color: string;
  delay?: number;
  duration?: number;
}) {
  const pulse = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(pulse, { toValue: 1, duration, useNativeDriver: false, easing: (t) => Math.sin(t * Math.PI) }),
        Animated.timing(pulse, { toValue: 0.7, duration, useNativeDriver: false, easing: (t) => Math.sin(t * Math.PI) }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { opacity: pulse, backgroundColor: color, borderRadius: 9999 }]}
    />
  );
}

function CompanionScrollContent({
  user,
  colors,
  getAuthHeaders,
  bottomPad,
}: {
  user: any;
  colors: ColorsType;
  getAuthHeaders: () => Promise<Record<string, string>>;
  bottomPad: number;
}) {
  const { isPro } = useProStatus();
  const [score, setScore] = useState<number | null>(null);
  const [latestReportId, setLatestReportId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [greeting, setGreeting] = useState("Good morning");
  const [scoreFetchError, setScoreFetchError] = useState(false);
  const [challengeProgress, setChallengeProgress] = useState<{
    completedCount: number;
    pct: number;
    currentDay: number;
  } | null>(null);
  const [badgeCount, setBadgeCount] = useState(0);
  const [engagementLoaded, setEngagementLoaded] = useState(false);
  const [lowestDim, setLowestDim] = useState<DimKey>("psychological");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    AsyncStorage.getItem("resilium_streak_v1").then(raw => {
      const data: { lastDate: string; count: number } = raw ? JSON.parse(raw) : { lastDate: "", count: 0 };
      if (data.lastDate === today) {
        setStreak(data.count);
      } else {
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
        const newCount = data.lastDate === yesterday ? data.count + 1 : 1;
        AsyncStorage.setItem("resilium_streak_v1", JSON.stringify({ lastDate: today, count: newCount }));
        setStreak(newCount);
      }
    });
  }, []);

  useEffect(() => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`https://${domain}/api/resilience/my-reports`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        const reports: any[] = data.reports ?? [];
        if (reports.length > 0) {
          const latest = reports[reports.length - 1];
          setScore(Math.round(latest.score?.overall ?? 0));
          setLatestReportId(latest.reportId);
          if (latest.score) {
            setLowestDim(getLowestDim({
              financial: latest.score.financial,
              health: latest.score.health,
              skills: latest.score.skills,
              mobility: latest.score.mobility,
              psychological: latest.score.psychological,
              resources: latest.score.resources,
            }));
          }
        }
      } catch { setScoreFetchError(true); }
    })();
  }, []);

  useEffect(() => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const [plansRes, challengeRes] = await Promise.allSettled([
          fetch(`https://${domain}/api/users/me/plans`, { headers }),
          fetch(`https://${domain}/api/challenge`, { headers }),
        ]);

        let completedDaysCount = 0;

        if (challengeRes.status === "fulfilled" && challengeRes.value.ok) {
          const cd = await challengeRes.value.json();
          if (cd?.completedDays) {
            completedDaysCount = cd.completedDays.length;
            const pct = Math.round((completedDaysCount / 30) * 100);
            const startDate = new Date(cd.startedAt);
            const currentDay = Math.min(
              Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
              30
            );
            setChallengeProgress({ completedCount: completedDaysCount, pct, currentDay });
          }
        }

        if (plansRes.status === "fulfilled" && plansRes.value.ok) {
          const data = await plansRes.value.json();
          const plans: any[] = data.plans ?? [];
          if (plans.length > 0) {
            const latest = plans[plans.length - 1];
            const streakRaw: number = await AsyncStorage.getItem("resilium_streak_v1").then(v => {
              try { return v ? (JSON.parse(v)?.count ?? 0) : 0; } catch { return 0; }
            });
            setBadgeCount(computeBadgeCount({
              planCount: plans.length,
              allDimsAssessed: allDimsAssessedFromPlan(latest),
              streak: streakRaw,
              completedDaysCount,
              isPro,
            }));
          }
        }
      } catch {
        // non-critical — proceed without challenge/badge data
      } finally {
        setEngagementLoaded(true);
      }
    })();
  }, []);

  const dotColor = score === null ? colors.textMuted : score >= 70 ? colors.success : score >= 40 ? "#F59E0B" : colors.danger;
  const dotLabel = score === null ? "—" : String(score);
  const ratingLabel = score === null
    ? (scoreFetchError ? "Couldn't load score" : "Loading...")
    : score >= 70 ? "Highly Resilient" : score >= 40 ? "Moderately Prepared" : "Critically Vulnerable";

  return (
    <View style={{ paddingBottom: bottomPad + 40, gap: 18, paddingTop: 28 }}>

      {/* Greeting */}
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textMuted }}>{greeting},</Text>
        <Text style={{ fontFamily: "Inter_700Bold", fontSize: 28, color: colors.text, letterSpacing: -0.8 }}>
          {user?.firstName ?? "there"} 👋
        </Text>
        {streak >= 1 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, backgroundColor: "rgba(224,128,64,0.12)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start", borderWidth: 1, borderColor: "rgba(224,128,64,0.25)" }}>
            <Text style={{ fontSize: 14 }}>🔥</Text>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 12, color: colors.primary }}>
              {streak === 1 ? "Day 1 — you're building a habit!" : `${streak}-day streak — keep going!`}
            </Text>
          </View>
        )}
      </View>

      {/* Score card */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 16 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: dotColor, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: score !== null ? 22 : 16, color: dotColor }}>{dotLabel}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 10, color: colors.primary, letterSpacing: 2, textTransform: "uppercase" }}>Resilience Score</Text>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: colors.text }}>{ratingLabel}</Text>
          {latestReportId ? (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/my-plans"); }}
              style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.primary }}>Open my plan</Text>
              <Feather name="arrow-right" size={12} color={colors.primary} />
            </Pressable>
          ) : (
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted }}>No plan yet — take your first assessment</Text>
          )}
        </View>
      </View>

      {/* Challenge + Badge strip */}
      {engagementLoaded && (
        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* 30-Day Challenge */}
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/profile" as any); }}
            style={({ pressed }) => [{
              flex: 1, flexDirection: "row", alignItems: "center", gap: 10,
              backgroundColor: colors.surface, borderRadius: 16, padding: 14,
              borderWidth: 1, borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            }]}
          >
            {challengeProgress ? (
              <>
                <View style={{ width: 34, height: 34 }}>
                  <Svg width={34} height={34} style={{ transform: [{ rotate: "-90deg" }] }}>
                    <Circle cx={17} cy={17} r={13} stroke={colors.border} strokeWidth={3} fill="none" />
                    <Circle
                      cx={17} cy={17} r={13}
                      stroke={colors.primary} strokeWidth={3} fill="none"
                      strokeDasharray={`${2 * Math.PI * 13}`}
                      strokeDashoffset={`${2 * Math.PI * 13 * (1 - challengeProgress.pct / 100)}`}
                      strokeLinecap="round"
                    />
                  </Svg>
                  <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 7, color: colors.text }}>
                      {challengeProgress.pct}%
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.text }}>30-Day Challenge</Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textMuted }}>
                    Day {challengeProgress.currentDay} · {challengeProgress.completedCount}/30 done
                  </Text>
                </View>
                <Feather name="zap" size={13} color="#F97316" />
              </>
            ) : (
              <>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
                  <Feather name="award" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.text }}>30-Day Challenge</Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textMuted }}>Start micro-actions</Text>
                </View>
                <Feather name="chevron-right" size={13} color={colors.textMuted} />
              </>
            )}
          </Pressable>

          {/* Badge count */}
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/profile" as any); }}
            style={({ pressed }) => [{
              flex: 1, flexDirection: "row", alignItems: "center", gap: 10,
              backgroundColor: colors.surface, borderRadius: 16, padding: 14,
              borderWidth: 1, borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            }]}
          >
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(245,158,11,0.12)", alignItems: "center", justifyContent: "center" }}>
              <Feather name="star" size={16} color="#F59E0B" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.text }}>Achievements</Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textMuted }}>
                {badgeCount > 0 ? `${badgeCount} badge${badgeCount !== 1 ? "s" : ""} earned` : "Earn your first badge"}
              </Text>
            </View>
            <Feather name="chevron-right" size={13} color={colors.textMuted} />
          </Pressable>
        </View>
      )}

      {/* Daily Check-In — primary CTA */}
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/checkin"); }}
        style={({ pressed }) => [{ borderRadius: 18, overflow: "hidden", opacity: pressed ? 0.88 : 1 }]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={{ padding: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 17, color: colors.background, letterSpacing: -0.3 }}>Daily Check-In</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(13,18,37,0.65)", marginTop: 4 }}>60-second resilience pulse</Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(13,18,37,0.15)", alignItems: "center", justifyContent: "center" }}>
            <Feather name="activity" size={22} color={colors.background} />
          </View>
        </LinearGradient>
      </Pressable>

      {/* Quick action grid */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        {[
          { icon: "bookmark", label: "My Plans", onPress: () => router.push("/my-plans") },
          {
            icon: "refresh-cw",
            label: "Reassess",
            onPress: () => user
              ? Linking.openURL("https://resilium-platform.com")
              : router.push("/assessment" as any),
          },
          { icon: "tag", label: "Go Pro", onPress: () => router.push("/pricing" as any) },
        ].map(({ icon, label, onPress }) => (
          <Pressable
            key={label}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
            style={({ pressed }) => [{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 8, opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
              <Feather name={icon as any} size={17} color={colors.primary} />
            </View>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.text }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Daily tip */}
      {(() => {
        const tip = getDailyTip(lowestDim);
        const dimLabel = DIM_LABELS[lowestDim];
        return (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 10, color: colors.textMuted, letterSpacing: 1, textTransform: "uppercase" }}>Today's Tip</Text>
              <View style={{ backgroundColor: colors.primaryMuted, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.primaryBorder }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: colors.primary }}>{dimLabel}</Text>
              </View>
            </View>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.text, lineHeight: 20 }}>{tip.text}</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 12, color: colors.primary, marginTop: 1 }}>→</Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted, lineHeight: 18, flex: 1 }}>{tip.action}</Text>
            </View>
          </View>
        );
      })()}

      {/* Footer links */}
      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 8 }}>
        {[
          { label: "About", route: "/about" },
          { label: "Coaching", route: "/coaching" },
          { label: "Account", route: "/my-data" },
        ].map(({ label, route }, i, arr) => (
          <React.Fragment key={label}>
            <Pressable onPress={() => router.push(route as any)} style={{ padding: 8 }}>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.primary }}>{label}</Text>
            </Pressable>
            {i < arr.length - 1 && <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted }}>·</Text>}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { hasConsented, isLoaded } = useSession();
  const { isSignedIn, user, getAuthHeaders } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = insets.top;
  const bottomPad = insets.bottom;
  const [heroSize, setHeroSize] = useState({ width: SCREEN_W, height: 340 });

  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    shouldShowOnboarding().then(show => {
      if (show) setShowOnboarding(true);
    });
  }, []);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hasConsented || isSignedIn) router.push("/assessment");
    else router.push("/consent");
  };

  const handleMyData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/my-data");
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/sign-in");
  };

  const handleMyPlans = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/my-plans");
  };

  const handlePricing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/pricing");
  };

  return (
    <ProGate>
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Animated background orbs */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <AnimatedOrb
          style={{ position: "absolute", width: 340, height: 340, top: -80, left: -80 }}
          color="rgba(224,128,64,0.10)"
          delay={0}
          duration={9000}
        />
        <AnimatedOrb
          style={{ position: "absolute", width: 280, height: 280, top: -40, right: -60 }}
          color="rgba(30,50,130,0.22)"
          delay={2000}
          duration={11000}
        />
        <AnimatedOrb
          style={{ position: "absolute", width: 220, height: 220, top: 300, left: 60 }}
          color="rgba(160,90,20,0.08)"
          delay={4000}
          duration={13000}
        />
        {/* Fade to background */}
        <LinearGradient
          colors={["transparent", colors.background]}
          style={[StyleSheet.absoluteFill, { top: "35%" }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logoIcon}
            tintColor={colors.primary}
          />
          <Text style={styles.logoText}>Resilium</Text>
        </View>
        <View style={styles.headerActions}>
          {isSignedIn ? (
            <>
              <Pressable onPress={handleMyPlans} style={styles.iconBtn} hitSlop={12} testID="my-plans-btn">
                <Feather name="bookmark" size={18} color={colors.primary} />
              </Pressable>
              <Pressable onPress={handlePricing} style={styles.iconBtn} hitSlop={12} testID="pricing-btn">
                <Feather name="tag" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable onPress={handleMyData} style={styles.iconBtn} hitSlop={12} testID="my-data-btn">
                <Feather name="user" size={18} color={colors.textSecondary} />
              </Pressable>
            </>
          ) : (
            <>
              {hasConsented && (
                <Pressable onPress={handleMyData} style={styles.iconBtn} hitSlop={12} testID="my-data-btn">
                  <Feather name="user" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
              <Pressable onPress={handlePricing} style={styles.iconBtn} hitSlop={8} testID="pricing-btn">
                <Feather name="tag" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable onPress={handleSignIn} style={styles.signInHeaderBtn} hitSlop={8} testID="sign-in-header-btn">
                <Text style={styles.signInHeaderText}>Sign In</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <CompanionScrollContent
          user={user}
          colors={colors}
          getAuthHeaders={getAuthHeaders}
          bottomPad={bottomPad}
        />
      </ScrollView>

      {/* Onboarding carousel — shown on first launch */}
      {showOnboarding && (
        <OnboardingCarousel onDismiss={() => setShowOnboarding(false)} />
      )}
    </View>
    </ProGate>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },

    /* ── Header ── */
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 4,
      zIndex: 10,
    },
    logo: { flexDirection: "row", alignItems: "center", gap: 8 },
    logoIcon: { width: 26, height: 26 },
    logoText: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      color: colors.primary,
      letterSpacing: -0.5,
    },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    signInHeaderBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    signInHeaderText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.text,
    },

    /* ── Scroll ── */
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24 },

    /* ── Hero ── */
    hero: { paddingTop: 28, gap: 18 },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      backgroundColor: colors.primaryMuted,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    heroBadgeText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 10,
      color: colors.primary,
      letterSpacing: 1,
    },
    heroTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 36,
      color: colors.text,
      letterSpacing: -1.2,
      lineHeight: 44,
    },
    heroTitleChaos: {
      fontStyle: "italic",
      color: "#D74242",
    },
    heroTitleReadiness: {
      color: colors.primary,
      fontFamily: "Inter_700Bold",
    },
    heroSubtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 23,
    },
    myPlansBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primaryMuted,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    myPlansBannerText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.primary,
      flex: 1,
    },
    ctaButton: { borderRadius: 14, overflow: "hidden" },
    ctaButtonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
    ctaGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 18,
      paddingHorizontal: 24,
    },
    ctaText: {
      fontFamily: "Inter_700Bold",
      fontSize: 17,
      color: colors.background,
      letterSpacing: -0.3,
    },
    trustRow: { gap: 8 },
    trustItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    trustLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.textMuted,
    },
    privacyNote: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
    },

    /* ── Sections ── */
    section: { marginTop: 48, gap: 16 },
    sectionAlt: {
      marginHorizontal: -24,
      paddingHorizontal: 24,
      paddingVertical: 36,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    sectionEyebrow: {
      fontFamily: "Inter_700Bold",
      fontSize: 10,
      color: colors.primary,
      letterSpacing: 2,
      textTransform: "uppercase",
      textAlign: "center",
    },
    sectionTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 24,
      color: colors.text,
      letterSpacing: -0.8,
      textAlign: "center",
      lineHeight: 30,
    },

    /* How it works */
    stepsCol: { gap: 12, marginTop: 4 },
    stepCard: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 18,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepNum: {
      fontFamily: "Inter_700Bold",
      fontSize: 10,
      color: colors.primaryBorder,
      letterSpacing: 2,
    },
    stepIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    stepTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.text,
      letterSpacing: -0.3,
    },
    stepDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 20,
    },

    /* Who it's for */
    audienceGrid: { gap: 12, marginTop: 4 },
    audienceCard: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    audienceIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    audienceTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: colors.text,
      letterSpacing: -0.2,
    },
    audienceDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 19,
    },

    /* What you'll get */
    reportGrid: { gap: 10, marginTop: 4 },
    reportCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reportIconRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    reportIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    reportTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.text,
      flex: 1,
    },
    reportDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
    },

    /* Final CTA */
    finalCta: {
      marginTop: 48,
      gap: 14,
      alignItems: "center",
      backgroundColor: colors.primaryMuted,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    finalCtaTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      color: colors.text,
      textAlign: "center",
      letterSpacing: -0.5,
      lineHeight: 26,
    },
    finalCtaSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
    },

    /* Footer links */
    footerLinks: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginTop: 32,
      marginBottom: 8,
    },
    footerLink: { padding: 8 },
    footerLinkText: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.primary,
    },
    footerDot: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.textMuted,
    },
  });
