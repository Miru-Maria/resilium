import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

const FREE_FEATURES = [
  "Full resilience assessment (all 10 dimensions)",
  "Overall score & category breakdown",
  "Mental Resilience Profile with pathway",
  "Personalised action plan (short, mid & long term)",
  "Stress test scenarios",
  "Daily habit recommendations",
  "Up to 2 saved plans",
  "GDPR data export & deletion",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited saved plans",
  "AI-powered plan comparison",
  "Interactive action checklists with progress tracking",
  "Percentile benchmarking against all users",
  "Pro scenario stress-test runner",
  "Score trend history across all assessments",
];

export default function PricingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    Linking.openURL(`https://${domain}/pricing`);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Plans & Pricing</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.tagline}>
          Build your resilience plan and prepare for what matters most.
        </Text>

        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Free</Text>
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>$0</Text>
            </View>
          </View>
          <Text style={styles.planDesc}>Everything you need to assess and start improving your resilience.</Text>
          <View style={styles.featureList}>
            {FREE_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Feather name="check" size={14} color={colors.success} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={styles.currentBadge}>
            <Feather name="check-circle" size={13} color={colors.primary} />
            <Text style={styles.currentBadgeText}>Your current plan</Text>
          </View>
        </View>

        <View style={[styles.planCard, styles.planCardPro]}>
          <View style={styles.proGlow} />
          <View style={styles.planHeader}>
            <View style={{ gap: 4 }}>
              <Text style={[styles.planName, { color: colors.primary }]}>Pro</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>MOST POPULAR</Text>
              </View>
            </View>
            <View style={[styles.pricePill, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
              <Text style={[styles.priceText, { color: colors.primary }]}>$9</Text>
              <Text style={styles.priceInterval}>/mo</Text>
            </View>
          </View>
          <Text style={styles.planDesc}>For serious preparedness. Unlimited plans, AI insights, and full tracking.</Text>
          <View style={styles.featureList}>
            {PRO_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Feather name="check" size={14} color={colors.primary} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [styles.upgradeBtn, pressed && { opacity: 0.85 }]}
            onPress={handleUpgrade}
          >
            <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
            <Feather name="external-link" size={15} color={colors.background} />
          </Pressable>
          <Text style={styles.upgradeNote}>Completes securely in your browser. Cancel anytime.</Text>
        </View>

        <View style={styles.faqCard}>
          <Text style={styles.faqTitle}>Questions?</Text>
          <Text style={styles.faqText}>
            Pro plans are managed via our secure web checkout. After upgrading, your Pro access will be active across all devices automatically — just sign in with the same account.
          </Text>
        </View>
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
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text, letterSpacing: -0.3 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  tagline: {
    fontFamily: "Inter_400Regular", fontSize: 15, color: colors.textSecondary,
    textAlign: "center", lineHeight: 22, paddingHorizontal: 8, marginBottom: 4,
  },
  planCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: colors.border, gap: 14,
  },
  planCardPro: {
    borderColor: colors.primary + "55", overflow: "hidden",
  },
  proGlow: {
    position: "absolute", top: -40, right: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.primary + "18",
  },
  planHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
  },
  planName: {
    fontFamily: "Inter_700Bold", fontSize: 22, color: colors.text, letterSpacing: -0.5,
  },
  pricePill: {
    flexDirection: "row", alignItems: "baseline", gap: 2,
    backgroundColor: colors.background, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  priceText: {
    fontFamily: "Inter_700Bold", fontSize: 22, color: colors.text,
  },
  priceInterval: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted,
  },
  proBadge: {
    backgroundColor: colors.primary + "22", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start",
  },
  proBadgeText: {
    fontFamily: "Inter_700Bold", fontSize: 9, color: colors.primary, letterSpacing: 0.8,
  },
  planDesc: {
    fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, lineHeight: 20,
  },
  featureList: { gap: 10 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featureText: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.text,
    flex: 1, lineHeight: 19,
  },
  currentBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.primary + "15", borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 12, alignSelf: "flex-start",
  },
  currentBadgeText: {
    fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.primary,
  },
  upgradeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 20,
  },
  upgradeBtnText: {
    fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.background,
  },
  upgradeNote: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted,
    textAlign: "center",
  },
  faqCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: colors.border, gap: 8,
  },
  faqTitle: {
    fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text,
  },
  faqText: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary,
    lineHeight: 19,
  },
});
