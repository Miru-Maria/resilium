import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth";
import { useProStatus } from "@/context/proStatus";
import { useColors } from "@/context/theme";

interface Props {
  children: React.ReactNode;
}

export function ProGate({ children }: Props) {
  const { isSignedIn } = useAuth();
  const { isPro, isLoading } = useProStatus();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isSignedIn || !isPro) {
    const handleSignIn = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push("/sign-in");
    };

    const handleUpgrade = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL("https://resilium-platform.com/pricing");
    };

    return (
      <View
        style={[
          styles.gate,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Feather name="lock" size={28} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Pro Members Only</Text>

        <Text style={[styles.body, { color: colors.textSecondary }]}>
          The Resilium mobile app is available exclusively to active Pro subscribers.
        </Text>

        {!isSignedIn ? (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleSignIn}
            >
              <Text style={[styles.primaryBtnText, { color: colors.background }]}>Sign In</Text>
            </Pressable>

            <Text style={[styles.orText, { color: colors.textMuted }]}>— or —</Text>

            <Pressable onPress={handleUpgrade} style={styles.linkBtn}>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Upgrade at resilium-platform.com
              </Text>
              <Feather name="external-link" size={13} color={colors.primary} />
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[styles.signedInNote, { color: colors.textMuted }]}>
              You're signed in but not on a Pro plan.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleUpgrade}
            >
              <Text style={[styles.primaryBtnText, { color: colors.background }]}>
                Upgrade to Pro
              </Text>
            </Pressable>
            <Pressable onPress={handleSignIn} style={[styles.linkBtn, { marginTop: 4 }]}>
              <Text style={[styles.linkText, { color: colors.textMuted }]}>Switch account</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gate: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 14,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 6,
  },
  signedInNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
  primaryBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: -0.3,
  },
  orText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  linkText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
