import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const s = styles(colors);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={s.headerTitle}>About Resilium</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={s.heroSection}>
          <Text style={s.eyebrow}>Personal Resilience Planning</Text>
          <Text style={s.heroTitle}>Know how ready you really are.</Text>
          <Text style={s.heroBody}>
            Resilium is a personal resilience assessment platform that helps you
            understand your readiness across six critical dimensions — and build
            a concrete plan to improve it.
          </Text>
        </View>

        {/* Dimensions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Six dimensions of resilience</Text>
          {[
            { icon: "dollar-sign", label: "Financial", desc: "Emergency runway, income stability, and financial flexibility." },
            { icon: "heart",       label: "Health",    desc: "Physical health, medical access, and mobility capacity." },
            { icon: "cpu",         label: "Skills",    desc: "Practical skills that matter when systems fail." },
            { icon: "map-pin",     label: "Mobility",  desc: "Your ability to relocate quickly when needed." },
            { icon: "activity",    label: "Psychological", desc: "Stress tolerance, adaptability, and emotional regulation." },
            { icon: "package",     label: "Resources", desc: "Emergency supplies, housing stability, and social network." },
          ].map(({ icon, label, desc }) => (
            <View key={label} style={s.dimRow}>
              <View style={s.dimIcon}>
                <Feather name={icon as any} size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.dimLabel}>{label}</Text>
                <Text style={s.dimDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* How it works */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>How it works</Text>
          {[
            { n: "1", title: "Take the assessment", body: "Answer honest questions about your finances, health, skills, and circumstances. Takes 10–15 minutes." },
            { n: "2", title: "Get your score",      body: "Receive a 0–100 resilience score across all six dimensions, powered by your real inputs." },
            { n: "3", title: "Follow the plan",     body: "AI generates a personalized 90-day action plan with prioritized steps and checklists." },
            { n: "4", title: "Track progress",      body: "Retake periodically to measure growth and see exactly where you've improved." },
          ].map(({ n, title, body }) => (
            <View key={n} style={s.stepRow}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{n}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepTitle}>{title}</Text>
                <Text style={s.stepBody}>{body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Free vs Pro */}
        <View style={[s.section, s.proCard]}>
          <Text style={[s.sectionTitle, { color: colors.primary }]}>Free vs Pro</Text>
          <Text style={s.proBody}>
            The core assessment, score, and action plan are free — always.{"\n\n"}
            Resilium Pro unlocks unlimited saved plans, AI plan comparison, interactive checklists with progress tracking, and percentile benchmarking against all users.
          </Text>
          <Pressable style={s.proBtn} onPress={() => router.push("/pricing")}>
            <Text style={[s.proBtnText, { color: colors.background }]}>See Pricing</Text>
            <Feather name="arrow-right" size={15} color={colors.background} />
          </Pressable>
        </View>

        {/* Legal links */}
        <View style={s.legalRow}>
          {[
            { label: "Privacy Policy", url: "https://resilium-ai.replit.app/privacy" },
            { label: "Terms of Service", url: "https://resilium-ai.replit.app/terms" },
          ].map(({ label, url }) => (
            <Pressable key={label} onPress={() => Linking.openURL(url)}>
              <Text style={s.legalLink}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = (C: ColorsType) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
    content: { padding: 20, gap: 28 },
    heroSection: { gap: 10 },
    eyebrow: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: C.primary,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    heroTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: C.text, lineHeight: 34 },
    heroBody: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 23 },
    section: { gap: 16 },
    sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: C.text },
    dimRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
    dimIcon: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: C.primarySubtle ?? `${C.primary}18`,
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    },
    dimLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text, marginBottom: 2 },
    dimDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 19 },
    stepRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
    stepNum: {
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: C.primary,
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    },
    stepNumText: { fontSize: 13, fontFamily: "Inter_700Bold", color: C.background },
    stepTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text, marginBottom: 3 },
    stepBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 19 },
    proCard: {
      backgroundColor: C.card ?? C.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: `${C.primary}30`,
    },
    proBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 21 },
    proBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: C.primary,
      borderRadius: 10,
      paddingVertical: 11,
      paddingHorizontal: 18,
      alignSelf: "flex-start",
      marginTop: 4,
    },
    proBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
    legalRow: { flexDirection: "row", gap: 20, flexWrap: "wrap", paddingTop: 4 },
    legalLink: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, textDecorationLine: "underline" },
  });
