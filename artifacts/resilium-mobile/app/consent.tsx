import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { setupNotifications } from "@/utils/notifications";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { NeuralNetSVG } from "@/components/NeuralNetSVG";
import { useSession } from "@/context/session";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const CONSENT_VERSION = "1.0";

const DATA_POINTS = [
  { icon: "map-pin", label: "Geographic location (country/region)" },
  { icon: "dollar-sign", label: "Financial situation (income, savings)" },
  { icon: "activity", label: "Health & mobility level" },
  { icon: "tool", label: "Skills & capabilities" },
  { icon: "home", label: "Housing situation" },
  { icon: "alert-triangle", label: "Risk concerns & priorities" },
];

export default function ConsentScreen() {
  const insets = useSafeAreaInsets();
  const { giveConsent } = useSession();
  const [isAccepting, setIsAccepting] = useState(false);
  
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleAccept = async () => {
    setIsAccepting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const newSessionId = await giveConsent();

      try {
        await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/gdpr/consent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: newSessionId,
            platform: Platform.OS,
            consentVersion: CONSENT_VERSION,
          }),
        });
      } catch {
      }

      // Request notification permission and schedule monthly check-in (non-blocking)
      setupNotifications(process.env.EXPO_PUBLIC_DOMAIN ?? "").catch(() => {});

      router.replace("/assessment");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "No Data Collected",
      "If you decline, no personalized resilience report can be generated. No data will be stored.\n\nYou can return anytime to accept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline & Exit",
          style: "destructive",
          onPress: () => router.replace("/"),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <NeuralNetSVG width={SCREEN_W} height={SCREEN_H} opacity={0.4} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="x" size={20} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.headerBadge}>
          <Feather name="shield" size={12} color={colors.primary} />
          <Text style={styles.headerBadgeText}>GDPR Compliant</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Feather name="lock" size={32} color={colors.primary} />
        </View>

        <Text style={styles.title}>Your Privacy Matters</Text>
        <Text style={styles.subtitle}>
          Before analyzing your resilience, your informed consent is needed to collect and process the following personal data.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is collected</Text>
          {DATA_POINTS.map((item) => (
            <View key={item.label} style={styles.dataItem}>
              <View style={styles.dataIcon}>
                <Feather name={item.icon as any} size={14} color={colors.primary} />
              </View>
              <Text style={styles.dataLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Feather name="clock" size={16} color={colors.warning} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>Data Retention</Text>
              <Text style={styles.infoCardDesc}>Your assessment data is retained for 12 months, then automatically deleted.</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Feather name="eye-off" size={16} color={colors.primary} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>No Selling of Data</Text>
              <Text style={styles.infoCardDesc}>Your personal data is never sold or shared with third parties for marketing.</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Feather name="download" size={16} color={colors.success} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>Your Rights</Text>
              <Text style={styles.infoCardDesc}>You can export or delete your data at any time from the My Data screen.</Text>
            </View>
          </View>
        </View>

        <View style={styles.legalNote}>
          <Text style={styles.legalNoteText}>
            By accepting, you consent to the processing of your data as described above, in accordance with GDPR Article 6(1)(a). A unique session ID will be generated and stored locally on your device to link your data to any future requests.
          </Text>
        </View>

        <Text style={styles.versionText}>Consent version {CONSENT_VERSION} · {new Date().toLocaleDateString()}</Text>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: bottomPad + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.acceptBtn, pressed && styles.pressed]}
          onPress={handleAccept}
          disabled={isAccepting}
          testID="accept-consent-btn"
        >
          <Feather name="check-circle" size={18} color={colors.background} />
          <Text style={styles.acceptText}>{isAccepting ? "Saving..." : "Accept & Continue"}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.declineBtn, pressed && styles.pressed]}
          onPress={handleDecline}
          testID="decline-consent-btn"
        >
          <Text style={styles.declineText}>Decline</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primaryMuted,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: colors.primary,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignSelf: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: colors.text,
    textAlign: "center",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dataIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  dataLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  infoCards: {
    gap: 10,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCardText: { flex: 1, gap: 4 },
  infoCardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.text,
  },
  infoCardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  legalNote: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legalNoteText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  versionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  acceptText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.background,
  },
  declineBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  declineText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.75,
  },
});
