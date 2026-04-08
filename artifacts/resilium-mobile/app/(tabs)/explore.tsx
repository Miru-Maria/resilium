import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

const { width: SCREEN_W } = Dimensions.get("window");

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/consent");
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section A: Profile Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Your Destination</Text>
          <Text style={styles.sectionTitle}>The Resilience Profile</Text>
          <Text style={styles.sectionSubtitle}>A clear, honest picture of your true preparedness level across every critical dimension.</Text>
          
          <View style={styles.profilePreview}>
            <View style={styles.profileScoreHeader}>
              <View>
                <Text style={styles.profileScoreLabel}>COMPOSITE SCORE</Text>
                <Text style={styles.profileScoreValue}>61 / 100</Text>
              </View>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>Moderately Prepared</Text>
              </View>
            </View>
            
            <View style={styles.dimensionsList}>
              {[
                { label: "Financial", pct: 0.62, color: "#E08040" },
                { label: "Health", pct: 0.78, color: "#E08040" },
                { label: "Skills", pct: 0.45, color: "#E08040" },
                { label: "Mobility", pct: 0.55, color: "#E08040" },
                { label: "Psychological", pct: 0.70, color: "#E08040" },
                { label: "Resources", pct: 0.38, color: "#E08040" },
              ].map(({ label, pct }) => (
                <View key={label} style={styles.dimRow}>
                  <Text style={styles.dimLabel}>{label}</Text>
                  <View style={styles.dimBarBg}>
                    <View style={[styles.dimBarFill, { width: `${pct * 100}%` }]} />
                  </View>
                  <Text style={styles.dimValue}>{Math.round(pct * 100)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.lockedOverlay}>
              <LinearGradient
                colors={["transparent", colors.surface]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.lockedContent}>
                <View style={styles.lockedIconWrap}>
                  <Feather name="lock" size={24} color={colors.primary} />
                </View>
                <Text style={styles.lockedTitle}>Your Profile is Locked</Text>
                <Text style={styles.lockedDesc}>Take the 15-minute assessment to reveal your scores and get your custom action plan.</Text>
                <Pressable
                  style={({ pressed }) => [styles.lockedBtn, pressed && styles.pressed]}
                  onPress={handleStart}
                >
                  <Text style={styles.lockedBtnText}>Unlock My Profile</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Section B: How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>The Process</Text>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.stepsContainer}>
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
            ].map((s, i, arr) => (
              <View key={s.step} style={styles.stepRow}>
                <View style={styles.stepConnector}>
                  <View style={styles.stepNumWrap}>
                    <Text style={styles.stepNum}>{s.step}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepIconWrap}>
                    <Feather name={s.icon as any} size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Section C: Who It's For */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.sectionEyebrow}>Who Uses Resilium</Text>
          <Text style={styles.sectionTitle}>Built for people who prepare, not people who panic</Text>
          <View style={styles.audienceGrid}>
            {[
              {
                icon: "package",
                title: "Preppers & Self-Reliance",
                desc: "You already stockpile and plan. Get an honest, scored picture of where your gaps still are.",
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
                title: "Life Transitions",
                desc: "Navigating a major change? Get a structured, honest starting point — no judgment.",
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

        {/* Section D: What You'll Get */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Your Deliverables</Text>
          <Text style={styles.sectionTitle}>What you'll walk away with</Text>
          <View style={styles.deliverablesGrid}>
            {[
              { title: "Resilience Score", desc: "0–100 across 7 dimensions" },
              { title: "Living Action Plan", desc: "30-day, 6-month, long-term" },
              { title: "Mental Resilience", desc: "Deep-dive psychological profile" },
              { title: "Scenario Stress Tests", desc: "Job loss, disaster, income disruption" },
              { title: "Location Risk Analysis", desc: "Geographic vulnerability assessment" },
              { title: "Daily Habits", desc: "Personalized recurring recommendations" },
            ].map((r) => (
              <View key={r.title} style={styles.deliverableCard}>
                <Feather name="check" size={16} color={colors.primary} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.deliverableTitle}>{r.title}</Text>
                  <Text style={styles.deliverableDesc}>{r.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
          onPress={handleStart}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaText}>Start My Assessment — Free</Text>
            <Feather name="arrow-right" size={18} color={colors.background} />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 24,
      color: colors.text,
      letterSpacing: -0.5,
    },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 24, gap: 48 },
    
    section: { gap: 16 },
    sectionAlt: {
      marginHorizontal: -24,
      paddingHorizontal: 24,
      paddingVertical: 40,
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
    },
    sectionTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: colors.text,
      letterSpacing: -0.8,
      lineHeight: 34,
    },
    sectionSubtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },

    /* Profile Preview */
    profilePreview: {
      marginTop: 8,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    profileScoreHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    profileScoreLabel: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.5,
    },
    profileScoreValue: {
      fontFamily: "Inter_700Bold",
      fontSize: 32,
      color: colors.text,
      marginTop: 4,
    },
    profileBadge: {
      backgroundColor: colors.primaryMuted,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    profileBadgeText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
      color: colors.primary,
    },
    dimensionsList: {
      padding: 24,
      gap: 16,
    },
    dimRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    dimLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: colors.textSecondary,
      width: 90,
    },
    dimBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: colors.borderLight,
      borderRadius: 4,
      overflow: "hidden",
    },
    dimBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    dimValue: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.text,
      width: 24,
      textAlign: "right",
    },
    lockedOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "80%",
      justifyContent: "flex-end",
    },
    lockedContent: {
      padding: 32,
      alignItems: "center",
      gap: 12,
    },
    lockedIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 4,
    },
    lockedTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.text,
    },
    lockedDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 8,
    },
    lockedBtn: {
      backgroundColor: colors.text,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    lockedBtnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.background,
    },

    /* Steps */
    stepsContainer: {
      marginTop: 8,
    },
    stepRow: {
      flexDirection: "row",
      gap: 16,
    },
    stepConnector: {
      alignItems: "center",
    },
    stepNumWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    stepNum: {
      fontFamily: "Inter_700Bold",
      fontSize: 10,
      color: colors.primary,
    },
    stepLine: {
      width: 2,
      flex: 1,
      backgroundColor: colors.primaryBorder,
      marginVertical: 4,
    },
    stepContent: {
      flex: 1,
      paddingBottom: 32,
    },
    stepIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    stepTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: colors.text,
      marginBottom: 6,
    },
    stepDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 21,
    },

    /* Audience */
    audienceGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 8,
    },
    audienceCard: {
      width: (SCREEN_W - 48 - 12) / 2,
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    audienceIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    audienceTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      color: colors.text,
      lineHeight: 18,
    },
    audienceDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
    },

    /* Deliverables */
    deliverablesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginTop: 8,
    },
    deliverableCard: {
      width: (SCREEN_W - 48 - 16) / 2,
      flexDirection: "row",
      gap: 8,
    },
    deliverableTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.text,
      marginBottom: 2,
    },
    deliverableDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
    },

    /* CTA */
    ctaButton: { borderRadius: 14, overflow: "hidden", marginTop: 8 },
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
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
  });
