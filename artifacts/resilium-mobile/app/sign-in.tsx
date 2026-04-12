import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { useSSO, useSignIn } from "@clerk/expo";
import { NeuralNetSVG } from "@/components/NeuralNetSVG";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { startSSOFlow } = useSSO();
  const { signIn, setActive, isLoaded } = useSignIn();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const topPad = insets.top;
  const bottomPad = insets.bottom;

  const handleEmailSignIn = async () => {
    if (!isLoaded || !email.trim() || !password) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEmailLoading(true);
    try {
      const result = await signIn.create({ identifier: email.trim(), password });
      if (result.status === "complete" && setActive) {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        Alert.alert("Sign-in incomplete", "Please check your credentials and try again.");
      }
    } catch (e: any) {
      const msg = e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || e?.message || "Please check your credentials.";
      Alert.alert("Sign-in failed", msg);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_google" | "oauth_facebook") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (strategy === "oauth_google") setGoogleLoading(true);
    else setFacebookLoading(true);
    try {
      const { createdSessionId, setActive: setActiveSSO } = await startSSOFlow({ strategy });
      if (createdSessionId && setActiveSSO) {
        await setActiveSSO({ session: createdSessionId });
        router.replace("/");
      }
    } catch (e: any) {
      if (e?.message !== "Cancelled") {
        Alert.alert("Sign-in failed", e?.message || "Please try again.");
      }
    } finally {
      setGoogleLoading(false);
      setFacebookLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Linking.openURL("https://resilium-platform.com/sign-in");
  };

  const handleContinueAsGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/");
  };

  const anyLoading = emailLoading || googleLoading || facebookLoading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <NeuralNetSVG width={SCREEN_W} height={SCREEN_H} opacity={0.3} />
      <LinearGradient
        colors={[colors.primaryMuted, "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: bottomPad + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={20} color={colors.textSecondary} />
        </Pressable>

        {/* Header */}
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Feather name="shield" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Sign in to Resilium</Text>
          <Text style={styles.subtitle}>
            Access your plans, progress, and resilience profile from any device.
          </Text>
        </View>

        {/* Email/password form */}
        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Feather name="mail" size={16} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!anyLoading}
            />
          </View>

          <View style={styles.inputWrap}>
            <Feather name="lock" size={16} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
              editable={!anyLoading}
            />
            <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8} style={{ paddingHorizontal: 14 }}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.textMuted} />
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.emailBtn, (!email.trim() || !password || anyLoading) && styles.btnDisabled, pressed && styles.btnPressed]}
            onPress={handleEmailSignIn}
            disabled={!email.trim() || !password || anyLoading}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.emailBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {emailLoading ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <>
                  <Feather name="log-in" size={17} color={colors.background} />
                  <Text style={styles.emailBtnText}>Sign In</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleForgotPassword} style={{ alignItems: "center" }}>
            <Text style={styles.forgotText}>Forgot password? Reset on the web →</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          {/* Google */}
          <Pressable
            style={({ pressed }) => [styles.socialBtn, anyLoading && styles.btnDisabled, pressed && styles.btnPressed]}
            onPress={() => handleOAuth("oauth_google")}
            disabled={anyLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.socialBtnText}>Google</Text>
              </>
            )}
          </Pressable>

          {/* Facebook */}
          <Pressable
            style={({ pressed }) => [styles.socialBtn, anyLoading && styles.btnDisabled, pressed && styles.btnPressed]}
            onPress={() => handleOAuth("oauth_facebook")}
            disabled={anyLoading}
          >
            {facebookLoading ? (
              <ActivityIndicator size="small" color="#1877F2" />
            ) : (
              <>
                <FontAwesome name="facebook" size={18} color="#1877F2" />
                <Text style={styles.socialBtnText}>Facebook</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Guest */}
        <Pressable onPress={handleContinueAsGuest} style={styles.guestBtn} disabled={anyLoading} testID="guest-btn">
          <Text style={styles.guestText}>Continue without an account</Text>
        </Pressable>

        <Text style={styles.note}>
          <Feather name="lock" size={11} color={colors.textMuted} /> Your account is secured and private.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border,
  },
  hero: {
    marginTop: 28, alignItems: "center", gap: 12, marginBottom: 28,
  },
  iconWrap: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: colors.primaryMuted,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.primaryBorder,
  },
  title: {
    fontFamily: "Inter_700Bold", fontSize: 26, color: colors.text,
    letterSpacing: -0.8, textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary,
    textAlign: "center", lineHeight: 20,
  },

  form: { gap: 12 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  inputIcon: { paddingLeft: 14 },
  input: {
    flex: 1, paddingVertical: 15, paddingHorizontal: 10,
    fontFamily: "Inter_400Regular", fontSize: 15,
    color: colors.text,
  },
  emailBtn: { borderRadius: 14, overflow: "hidden" },
  emailBtnGradient: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16,
  },
  emailBtnText: {
    fontFamily: "Inter_700Bold", fontSize: 16, color: colors.background, letterSpacing: -0.3,
  },
  forgotText: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.primary,
  },

  divider: {
    flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 22,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted,
  },

  socialRow: { flexDirection: "row", gap: 12 },
  socialBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14,
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  googleG: {
    fontFamily: "Inter_700Bold", fontSize: 17,
    color: "#4285F4",
  },
  socialBtnText: {
    fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.text,
  },

  btnPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  btnDisabled: { opacity: 0.5 },

  guestBtn: {
    marginTop: 16, paddingVertical: 14, alignItems: "center",
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  guestText: {
    fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.textSecondary,
  },
  note: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted,
    textAlign: "center", marginTop: 16,
  },
});
