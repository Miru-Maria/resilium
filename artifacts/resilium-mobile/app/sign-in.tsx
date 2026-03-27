import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator, Alert, Dimensions } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { NeuralNetSVG } from "@/components/NeuralNetSVG";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const result = await signIn();
      if (result.success) {
        router.replace("/");
      } else if (result.error && result.error !== "Cancelled") {
        Alert.alert("Sign-in failed", result.error || "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/");
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad + 24 }]}>
      <NeuralNetSVG width={SCREEN_W} height={SCREEN_H} opacity={0.45} />
      <LinearGradient
        colors={[colors.primaryMuted, "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        pointerEvents="none"
      />

      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
        <Feather name="arrow-left" size={20} color={colors.textSecondary} />
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <Feather name="shield" size={36} color={colors.primary} />
        </View>
        <Text style={styles.title}>Save your progress</Text>
        <Text style={styles.subtitle}>
          Sign in to save your resilience plans, track progress over time, and access your history from any device.
        </Text>
      </View>

      <View style={styles.benefits}>
        {[
          { icon: "save", label: "Plans saved to your account", desc: "Never lose a report again" },
          { icon: "trending-up", label: "Track progress over time", desc: "See your score improve" },
          { icon: "smartphone", label: "Access from any device", desc: "Web & mobile in sync" },
        ].map((b) => (
          <View key={b.label} style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Feather name={b.icon as any} size={16} color={colors.primary} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitLabel}>{b.label}</Text>
              <Text style={styles.benefitDesc}>{b.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottom}>
        <Pressable
          style={({ pressed }) => [styles.signInBtn, pressed && styles.btnPressed, loading && styles.btnDisabled]}
          onPress={handleSignIn}
          disabled={loading}
          testID="sign-in-btn"
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.signInGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <>
                <Feather name="log-in" size={18} color={colors.background} />
                <Text style={styles.signInText}>Sign in with Replit</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        <Pressable onPress={handleContinueAsGuest} style={styles.guestBtn} testID="guest-btn">
          <Text style={styles.guestText}>Continue without an account</Text>
        </Pressable>

        <Text style={styles.note}>
          <Feather name="lock" size={11} color={colors.textMuted} /> No extra account needed — your existing Replit account works.
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
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border, marginTop: 12,
  },
  hero: {
    marginTop: 40, alignItems: "center", gap: 16,
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryMuted,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.primaryBorder,
  },
  title: {
    fontFamily: "Inter_700Bold", fontSize: 32, color: colors.text,
    letterSpacing: -1, textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular", fontSize: 15, color: colors.textSecondary,
    textAlign: "center", lineHeight: 22,
  },
  benefits: {
    marginTop: 36, gap: 12,
  },
  benefitItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  benefitIcon: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primaryMuted,
    alignItems: "center", justifyContent: "center",
  },
  benefitText: { flex: 1 },
  benefitLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.text,
  },
  benefitDesc: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted, marginTop: 2,
  },
  bottom: { marginTop: "auto", gap: 14 },
  signInBtn: { borderRadius: 14, overflow: "hidden" },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  btnDisabled: { opacity: 0.6 },
  signInGradient: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 18,
  },
  signInText: {
    fontFamily: "Inter_700Bold", fontSize: 17, color: colors.background, letterSpacing: -0.3,
  },
  guestBtn: {
    paddingVertical: 14, alignItems: "center",
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  guestText: {
    fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.textSecondary,
  },
  note: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted, textAlign: "center",
  },
});
