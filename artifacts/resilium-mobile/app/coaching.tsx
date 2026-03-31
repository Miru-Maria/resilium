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

const COACHING_URL = "https://healing-through-understanding.replit.app/contact";

export default function CoachingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const s = styles(colors);

  const handleBook = () => {
    // Fire-and-forget click tracking
    fetch("https://resilium-ai.replit.app/api/coaching/track", { method: "POST" }).catch(() => {});
    Linking.openURL(COACHING_URL);
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={s.headerTitle}>Coaching</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge */}
        <View style={s.badge}>
          <Feather name="award" size={12} color={colors.primary} />
          <Text style={s.badgeText}>Phoenix Insight Coaching</Text>
        </View>

        {/* Hero */}
        <Text style={s.heroTitle}>
          Resilium maps the gap.{"\n"}A coach helps close it.
        </Text>
        <Text style={s.heroBody}>
          If your psychological resilience score was low, that's not a verdict —
          it's a starting point. Cristiana Paun offers 1:1 coaching sessions
          designed around your Resilium report.
        </Text>

        {/* Why coaching */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>What coaching addresses</Text>
          {[
            { icon: "activity",  text: "Stress tolerance and crisis response patterns" },
            { icon: "refresh-cw", text: "Adaptability and change management" },
            { icon: "users",     text: "Social support structures and isolation" },
            { icon: "zap",       text: "Emotional regulation under pressure" },
            { icon: "trending-up", text: "Building sustainable psychological resilience" },
          ].map(({ icon, text }) => (
            <View key={text} style={s.bulletRow}>
              <View style={s.bulletIcon}>
                <Feather name={icon as any} size={14} color={colors.primary} />
              </View>
              <Text style={s.bulletText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* How it works */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Three steps. No commitment required.</Text>
          {[
            { n: "01", title: "Free discovery call", body: "50–60 minutes. No pressure. Review your Resilium report together and see if there's a fit." },
            { n: "02", title: "Tailored programme",  body: "A coaching plan built around your specific score, circumstances, and goals." },
            { n: "03", title: "Ongoing support",     body: "Bi-weekly or weekly sessions, plus async support between sessions." },
          ].map(({ n, title, body }) => (
            <View key={n} style={s.stepCard}>
              <Text style={s.stepNum}>{n}</Text>
              <Text style={s.stepTitle}>{title}</Text>
              <Text style={s.stepBody}>{body}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.85 }]}
          onPress={handleBook}
        >
          <Text style={[s.ctaBtnText, { color: colors.background }]}>
            Book Your Free Discovery Call
          </Text>
          <Feather name="external-link" size={16} color={colors.background} />
        </Pressable>
        <Text style={s.ctaNote}>
          Sessions available online · Flexible scheduling across time zones
        </Text>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            This coaching service is independent of Resilium. Resilium is a risk
            assessment tool; coaching is provided by Phoenix Insight Coaching separately.
          </Text>
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
    content: { padding: 20, gap: 24 },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: `${C.primary}15`,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignSelf: "flex-start",
    },
    badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.primary },
    heroTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: C.text, lineHeight: 32 },
    heroBody: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 23 },
    section: { gap: 12 },
    sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.text },
    bulletRow: { flexDirection: "row", gap: 12, alignItems: "center" },
    bulletIcon: {
      width: 32, height: 32, borderRadius: 8,
      backgroundColor: `${C.primary}15`,
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    },
    bulletText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 20 },
    stepCard: {
      backgroundColor: C.card ?? C.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
      gap: 6,
    },
    stepNum: { fontSize: 28, fontFamily: "Inter_700Bold", color: `${C.primary}50`, lineHeight: 32 },
    stepTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
    stepBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 19 },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: C.primary,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
    ctaBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
    ctaNote: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: C.textSecondary,
      textAlign: "center",
      marginTop: -10,
    },
    disclaimer: {
      borderTopWidth: 1,
      borderTopColor: C.border,
      paddingTop: 16,
    },
    disclaimerText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: C.textSecondary,
      lineHeight: 18,
    },
  });
