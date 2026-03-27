import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { useSession } from "@/context/session";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { hasConsented, isLoaded } = useSession();
  const { isSignedIn, user } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (isLoaded && hasConsented) {
    }
  }, [isLoaded, hasConsented]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hasConsented || isSignedIn) {
      router.push("/assessment");
    } else {
      router.push("/consent");
    }
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

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad + 24 }]}>
      <LinearGradient
        colors={[colors.primaryMuted, "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <View style={styles.logo}>
          <Image source={require("../assets/logo.png")} style={{ width: 24, height: 24 }} />
          <Text style={styles.logoText}>Resilium</Text>
        </View>
        <View style={styles.headerActions}>
          {isSignedIn ? (
            <>
              <Pressable onPress={handleMyPlans} style={styles.iconBtn} hitSlop={12} testID="my-plans-btn">
                <Feather name="bookmark" size={18} color={colors.primary} />
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
              <Pressable onPress={handleSignIn} style={styles.signInHeaderBtn} hitSlop={8} testID="sign-in-header-btn">
                <Text style={styles.signInHeaderText}>Sign In</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.scoreBadge}>
          <Feather name="activity" size={14} color={colors.primary} />
          <Text style={styles.scoreBadgeText}>AI-Powered Assessment</Text>
        </View>

        <Text style={styles.heroTitle}>Know Your{"\n"}Resilience Score</Text>
        <Text style={styles.heroSubtitle}>
          A 10-step assessment that analyzes your readiness across financial,
          health, skills, and risk dimensions — then builds your personal
          action plan.
        </Text>

        <View style={styles.statsRow}>
          {[
            { label: "Categories", value: "6" },
            { label: "Questions", value: "10" },
            { label: "Minutes", value: "3" },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.features}>
        {[
          { icon: "bar-chart-2", label: "Resilience Score", desc: "Overall + 6 sub-scores" },
          { icon: "map", label: "Action Plan", desc: "Short, mid & long-term steps" },
          { icon: "zap", label: "Stress Tests", desc: "Scenario simulations" },
        ].map((f) => (
          <View key={f.label} style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Feather name={f.icon as any} size={16} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottom}>
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
              {hasConsented || isSignedIn ? "Start Assessment" : "Get Started"}
            </Text>
            <Feather name="arrow-right" size={18} color={colors.background} />
          </LinearGradient>
        </Pressable>
        <Text style={styles.privacyNote}>
          <Feather name="lock" size={11} color={colors.textMuted} />{" "}
          {isSignedIn ? "Plans saved to your account" : "GDPR compliant · No account required"}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
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
  hero: {
    marginTop: 40,
    gap: 16,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.primaryMuted,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  scoreBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
    color: colors.text,
    letterSpacing: -1.5,
    lineHeight: 46,
  },
  heroSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    gap: 0,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  features: {
    marginTop: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.text,
  },
  featureDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },
  bottom: {
    marginTop: "auto",
    gap: 12,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  ctaButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  ctaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: colors.background,
    letterSpacing: -0.3,
  },
  privacyNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
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
});
