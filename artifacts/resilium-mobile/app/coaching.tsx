import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const COACHING_URL = "https://healing-through-understanding.replit.app/contact";

const WARM = {
  bg: "#F5EDE0",
  bgDeep: "#EAD9BE",
  ember: "#E08040",
  emberDark: "#C05F20",
  dark: "#1C1008",
  text: "#2C1A0A",
  muted: "#7A5C3A",
  border: "#D4B896",
  surface: "#FDF6EE",
  cardBg: "#FBF0E4",
};

const { width: SCREEN_W } = Dimensions.get("window");

export default function CoachingScreen() {
  const insets = useSafeAreaInsets();

  const handleBook = () => {
    fetch("https://resilium-ai.replit.app/api/coaching/track", { method: "POST" }).catch(() => {});
    Linking.openURL(COACHING_URL);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* ── Nav bar — sits on top of the hero gradient ── */}
      <View style={s.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={WARM.text} />
        </Pressable>
        <Text style={s.navTitle}>Get Coaching</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
      >
        {/* ── Hero — warm gradient block ── */}
        <LinearGradient
          colors={[WARM.bgDeep, WARM.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={s.hero}
        >
          {/* Decorative orbs */}
          <View style={[s.orb, { top: -40, right: -40, width: 160, height: 160, opacity: 0.18 }]} />
          <View style={[s.orb, { bottom: 20, left: -30, width: 100, height: 100, opacity: 0.12 }]} />

          {/* Provider pill */}
          <View style={s.pill}>
            <Feather name="award" size={11} color={WARM.ember} />
            <Text style={s.pillText}>Phoenix Insight Coaching</Text>
          </View>

          {/* Headline */}
          <Text style={s.headline}>
            Build the resilience{"\n"}
            <Text style={s.headlineAccent}>numbers can't measure.</Text>
          </Text>

          <Text style={s.sub}>
            Your Resilium score tracks preparation. Coaching with Cristiana Paun
            works on what sits underneath — how you process uncertainty, make
            decisions under pressure, and find ground again after disruption.
          </Text>

          {/* Primary CTA — above the fold */}
          <Pressable
            style={({ pressed }) => [s.cta, pressed && { opacity: 0.82 }]}
            onPress={handleBook}
          >
            <Text style={s.ctaText}>Book Your Free Discovery Call</Text>
            <Feather name="external-link" size={15} color="#fff" />
          </Pressable>

          <Text style={s.ctaSub}>50–60 min · No pressure · No commitment</Text>
        </LinearGradient>

        {/* ── Body — white/warm surface ── */}
        <View style={s.body}>

          {/* What it addresses */}
          <View style={s.section}>
            <Text style={s.eyebrow}>WHAT COACHING ADDRESSES</Text>
            <Text style={s.sectionTitle}>The gap scores can't close</Text>
            <View style={s.bulletList}>
              {[
                { icon: "activity",    text: "Stress tolerance and crisis response patterns" },
                { icon: "refresh-cw",  text: "Adaptability and change management" },
                { icon: "users",       text: "Social support and preventing isolation" },
                { icon: "zap",         text: "Emotional regulation under pressure" },
                { icon: "trending-up", text: "Building sustainable psychological resilience" },
              ].map(({ icon, text }) => (
                <View key={text} style={s.bullet}>
                  <View style={s.bulletIconWrap}>
                    <Feather name={icon as any} size={14} color={WARM.ember} />
                  </View>
                  <Text style={s.bulletText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* How it works */}
          <View style={s.section}>
            <Text style={s.eyebrow}>HOW IT WORKS</Text>
            <Text style={s.sectionTitle}>Three steps. No commitment.</Text>
            <View style={s.steps}>
              {[
                {
                  n: "01",
                  title: "Free discovery call",
                  body: "50–60 minutes. Review your Resilium report together and see if there's a fit.",
                },
                {
                  n: "02",
                  title: "Tailored program",
                  body: "A coaching plan built around your specific score, circumstances, and goals.",
                },
                {
                  n: "03",
                  title: "Ongoing support",
                  body: "Bi-weekly or weekly sessions, plus async support between sessions.",
                },
              ].map(({ n, title, body }) => (
                <View key={n} style={s.stepCard}>
                  <Text style={s.stepNum}>{n}</Text>
                  <View style={s.stepRight}>
                    <Text style={s.stepTitle}>{title}</Text>
                    <Text style={s.stepBody}>{body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Secondary CTA */}
          <View style={s.secondaryCtaBlock}>
            <Text style={s.secondaryCtaTitle}>Ready to start?</Text>
            <Text style={s.secondaryCtaSub}>
              Sessions available online · Flexible across time zones
            </Text>
            <Pressable
              style={({ pressed }) => [s.cta, { marginTop: 16 }, pressed && { opacity: 0.82 }]}
              onPress={handleBook}
            >
              <Text style={s.ctaText}>Book Your Free Discovery Call</Text>
              <Feather name="external-link" size={15} color="#fff" />
            </Pressable>
          </View>

          {/* Disclaimer */}
          <View style={s.disclaimer}>
            <Text style={s.disclaimerText}>
              Coaching is provided independently by Phoenix Insight Coaching.
              Resilium is a risk assessment tool only.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: WARM.bg },

  /* Nav */
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: WARM.text },

  /* Hero */
  hero: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 36,
    overflow: "hidden",
    gap: 16,
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: WARM.ember,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: `${WARM.ember}1A`,
    borderWidth: 1,
    borderColor: `${WARM.ember}40`,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  pillText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: WARM.ember },
  headline: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: WARM.text,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  headlineAccent: { color: WARM.ember },
  sub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: WARM.muted,
    lineHeight: 23,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: WARM.ember,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  ctaText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  ctaSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: WARM.muted,
    textAlign: "center",
    marginTop: -4,
  },

  /* Body */
  body: {
    backgroundColor: WARM.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 0,
  },
  section: { gap: 12, marginBottom: 28 },
  eyebrow: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: WARM.ember,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: WARM.text,
    letterSpacing: -0.4,
  },
  divider: { height: 1, backgroundColor: WARM.border, marginBottom: 28 },

  /* Bullets */
  bulletList: { gap: 10, marginTop: 4 },
  bullet: { flexDirection: "row", alignItems: "center", gap: 12 },
  bulletIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: `${WARM.ember}15`,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: WARM.muted,
    lineHeight: 20,
  },

  /* Steps */
  steps: { gap: 10, marginTop: 4 },
  stepCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: WARM.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: WARM.border,
    alignItems: "flex-start",
  },
  stepNum: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: `${WARM.ember}60`,
    lineHeight: 28,
    minWidth: 32,
  },
  stepRight: { flex: 1, gap: 4 },
  stepTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: WARM.text },
  stepBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: WARM.muted, lineHeight: 19 },

  /* Secondary CTA block */
  secondaryCtaBlock: {
    alignItems: "center",
    marginBottom: 28,
  },
  secondaryCtaTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: WARM.text,
    letterSpacing: -0.4,
  },
  secondaryCtaSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: WARM.muted,
    marginTop: 4,
    textAlign: "center",
  },

  /* Disclaimer */
  disclaimer: {
    borderTopWidth: 1,
    borderTopColor: WARM.border,
    paddingTop: 16,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: WARM.muted,
    lineHeight: 18,
    textAlign: "center",
  },
});
