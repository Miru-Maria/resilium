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
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { NeuralNetSVG } from "@/components/NeuralNetSVG";

import { useSession } from "@/context/session";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { hasConsented, isLoaded } = useSession();
  const { isSignedIn, user } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [heroSize, setHeroSize] = useState({ width: SCREEN_W, height: 340 });

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
            source={require("../assets/logo.png")}
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
        {/* ── Hero ── */}
        <View
          style={styles.hero}
          onLayout={(e) => setHeroSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        >
          <NeuralNetSVG width={heroSize.width} height={heroSize.height} opacity={0.55} />
          <View style={styles.heroBadge}>
            <Feather name="cpu" size={12} color={colors.primary} />
            <Text style={styles.heroBadgeText}>AI-POWERED RISK ASSESSMENT</Text>
          </View>

          <Text style={styles.heroTitle}>
            {"You're one disruption\naway from "}
            <Text style={styles.heroTitleChaos}>chaos</Text>
            {".\nCheck your "}
            <Text style={styles.heroTitleReadiness}>readiness.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Resilium analyzes your financial stability, skills, health, and
            location to build a personalized action plan for life's
            unpredictable moments.
          </Text>

          {isSignedIn && user && (
            <Pressable onPress={handleMyPlans} style={styles.myPlansBanner}>
              <Feather name="bookmark" size={14} color={colors.primary} />
              <Text style={styles.myPlansBannerText}>
                Signed in as {user.firstName || user.email || "you"} — view saved plans
              </Text>
              <Feather name="arrow-right" size={14} color={colors.primary} />
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
            onPress={handleStart}
            testID="start-btn"
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaText}>
                {hasConsented || isSignedIn ? "Start Assessment" : "Get My Resilience Plan"}
              </Text>
              <Feather name="arrow-right" size={18} color={colors.background} />
            </LinearGradient>
          </Pressable>

          {/* Trust indicators */}
          <View style={styles.trustRow}>
            {[
              { icon: "trending-up", label: "Sign in to save & track progress" },
              { icon: "shield",      label: "Your data is never sold" },
              { icon: "zap",        label: "Results in under 15 minutes" },
            ].map((t) => (
              <View key={t.label} style={styles.trustItem}>
                <Feather name={t.icon as any} size={12} color={colors.primary} />
                <Text style={styles.trustLabel}>{t.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── How it works ── */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>The Process</Text>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.stepsCol}>
            {[
              {
                step: "01",
                icon: "cpu",
                title: "Answer the assessment",
                desc: "10–15 minutes of honest questions covering finances, location, health, practical skills, housing, and psychological resilience.",
              },
              {
                step: "02",
                icon: "zap",
                title: "AI builds your profile",
                desc: "Your answers are scored across six risk dimensions and fed to an AI that reasons about your specific vulnerabilities — not generic advice.",
              },
              {
                step: "03",
                icon: "check-circle",
                title: "Get your action plan",
                desc: "Your score, your gaps, and a prioritized plan broken into 30-day, 6-month, and long-term phases.",
              },
            ].map((s) => (
              <View key={s.step} style={styles.stepCard}>
                <Text style={styles.stepNum}>{s.step}</Text>
                <View style={styles.stepIconWrap}>
                  <Feather name={s.icon as any} size={18} color={colors.primary} />
                </View>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Who it's for ── */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.sectionEyebrow}>Who Uses Resilium</Text>
          <Text style={styles.sectionTitle}>Built for people who prepare, not people who panic</Text>
          <View style={styles.audienceGrid}>
            {[
              {
                icon: "package",
                title: "Preppers & Self-Reliance",
                desc: "You already stockpile and plan. Resilium gives you an honest, scored picture of where your gaps still are — and what to fix first.",
              },
              {
                icon: "dollar-sign",
                title: "The Financially Anxious",
                desc: "Find out how many months of runway you have and what would happen if you lost your income tomorrow.",
              },
              {
                icon: "globe",
                title: "Expats & Digital Nomads",
                desc: "Assess how your country, mobility, and support network hold up when things go sideways.",
              },
              {
                icon: "alert-triangle",
                title: "The Quietly Cautious",
                desc: "You don't call yourself a prepper. Resilium gives you a structured, honest starting point — no judgment.",
              },
            ].map((a) => (
              <View key={a.title} style={styles.audienceCard}>
                <View style={styles.audienceIconWrap}>
                  <Feather name={a.icon as any} size={18} color={colors.primary} />
                </View>
                <Text style={styles.audienceTitle}>{a.title}</Text>
                <Text style={styles.audienceDesc}>{a.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── What you'll get ── */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Your Report</Text>
          <Text style={styles.sectionTitle}>What you'll walk away with</Text>
          <View style={styles.reportGrid}>
            {[
              { icon: "trending-up",   title: "Resilience Score",       desc: "0–100 composite across six dimensions: Financial, Health, Skills, Mobility, Psychological, Resources." },
              { icon: "check-square",  title: "Action Plan",            desc: "30-day, 6-month, and long-term tasks ordered by criticality for your specific situation." },
              { icon: "cpu",           title: "Mental Resilience",      desc: "Deep psychological assessment identifying your Growth or Compensation pathway." },
              { icon: "alert-triangle",title: "Scenario Stress Tests",  desc: "AI simulations of job loss, supply chain failure, natural disaster — with your personal recovery timeline." },
              { icon: "map-pin",       title: "Location Risk Analysis", desc: "How your geography affects vulnerability — climate, political stability, infrastructure." },
              { icon: "shield",        title: "Daily Habits",           desc: "Recurring actions tailored to your profile that move you from vulnerable to prepared." },
            ].map((r) => (
              <View key={r.title} style={styles.reportCard}>
                <View style={styles.reportIconRow}>
                  <View style={styles.reportIconWrap}>
                    <Feather name={r.icon as any} size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.reportTitle}>{r.title}</Text>
                </View>
                <Text style={styles.reportDesc}>{r.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Final CTA ── */}
        <View style={styles.finalCta}>
          <Text style={styles.finalCtaTitle}>Ready to find out where you stand?</Text>
          <Text style={styles.finalCtaSub}>Takes 10–15 minutes to complete.</Text>
          <Pressable
            style={({ pressed }) => [styles.ctaButton, { alignSelf: "stretch" }, pressed && styles.ctaButtonPressed]}
            onPress={handleStart}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaText}>Start the Assessment</Text>
              <Feather name="chevron-right" size={18} color={colors.background} />
            </LinearGradient>
          </Pressable>
          <Text style={styles.privacyNote}>
            <Feather name="lock" size={11} color={colors.textMuted} />{" "}
            {isSignedIn ? "Plans saved to your account" : "GDPR compliant"}
          </Text>
        </View>
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
      color: colors.danger,
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
  });
