import React, { useEffect } from "react";
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

import { Colors } from "@/constants/colors";
import { useSession } from "@/context/session";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { hasConsented, isLoaded } = useSession();

  useEffect(() => {
    if (isLoaded && hasConsented) {
    }
  }, [isLoaded, hasConsented]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hasConsented) {
      router.push("/assessment");
    } else {
      router.push("/consent");
    }
  };

  const handleMyData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/my-data");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad + 24 }]}>
      <LinearGradient
        colors={["rgba(0,212,170,0.08)", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <View style={styles.logo}>
          <Feather name="shield" size={20} color={Colors.primary} />
          <Text style={styles.logoText}>Resilium</Text>
        </View>
        {hasConsented && (
          <Pressable onPress={handleMyData} style={styles.dataBtn} hitSlop={12} testID="my-data-btn">
            <Feather name="user" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <View style={styles.hero}>
        <View style={styles.scoreBadge}>
          <Feather name="activity" size={14} color={Colors.primary} />
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
              <Feather name={f.icon as any} size={16} color={Colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottom}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
          onPress={handleStart}
          testID="start-btn"
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaText}>
              {hasConsented ? "Start Assessment" : "Get Started"}
            </Text>
            <Feather name="arrow-right" size={18} color={Colors.background} />
          </LinearGradient>
        </Pressable>
        <Text style={styles.privacyNote}>
          <Feather name="lock" size={11} color={Colors.textMuted} /> GDPR compliant · No account required
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.text,
    letterSpacing: -0.5,
  },
  dataBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.primaryMuted,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(0,212,170,0.3)",
  },
  scoreBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.primary,
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
    color: Colors.text,
    letterSpacing: -1.5,
    lineHeight: 46,
  },
  heroSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryMuted,
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
    color: Colors.text,
  },
  featureDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
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
    color: Colors.background,
    letterSpacing: -0.3,
  },
  privacyNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
