import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NeuralNetSVG } from "@/components/NeuralNetSVG";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const MESSAGES = [
  "Analyzing your risk profile...",
  "Calculating resilience scores...",
  "Simulating stress scenarios...",
  "Building your action plan...",
  "Finalizing your report...",
];

export default function LoadingScreen() {
  const insets = useSafeAreaInsets();
  const { assessmentData } = useLocalSearchParams<{ assessmentData: string }>();
  const [messageIdx, setMessageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { getAuthHeaders } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    const msgInterval = setInterval(() => {
      setMessageIdx((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 3000);

    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    if (!assessmentData) {
      router.replace("/");
      return;
    }

    const submit = async () => {
      try {
        const parsed = JSON.parse(assessmentData);
        const res = await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/resilience/assess`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(parsed),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to generate report");
        }

        const report = await res.json();
        router.replace({
          pathname: "/results",
          params: { reportId: report.reportId },
        });
      } catch (e: any) {
        setError(e.message || "Something went wrong. Please try again.");
      }
    };

    submit();
  }, [assessmentData]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const topPadValue = topPad;

  return (
    <View style={[styles.container, { paddingTop: topPadValue }]}>
      <NeuralNetSVG width={SCREEN_W} height={SCREEN_H} opacity={0.5} />
      {error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <View style={{ height: 24 }} />
          <View style={styles.retryRow}>
            <Feather name="arrow-left" size={16} color={colors.primary} />
            <Text style={styles.retryText} onPress={() => router.back()}>Go back and try again</Text>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Animated.View style={[styles.orb, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.orbInner}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Feather name="shield" size={40} color={colors.primary} />
              </Animated.View>
            </View>
          </Animated.View>

          <Text style={styles.title}>Building Your Plan</Text>
          <Text style={styles.message}>{MESSAGES[messageIdx]}</Text>

          <View style={styles.dots}>
            {MESSAGES.map((_, i) => (
              <View key={i} style={[styles.dot, i <= messageIdx && styles.dotActive]} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  content: {
    alignItems: "center",
    gap: 24,
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  orbInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.8,
  },
  message: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  errorContainer: {
    alignItems: "center",
    gap: 16,
  },
  errorTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  errorMsg: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  retryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.primary,
  },
});
