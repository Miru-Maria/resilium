import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useSession } from "@/context/session";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

type ExportedData = {
  sessionId: string;
  exportedAt: string;
  consent: object | null;
  reports: object[];
  dataRequests: object[];
};

export default function MyDataScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId, consentDate, revokeConsent, hasConsented } = useSession();
  const { isSignedIn, user, signOut } = useAuth();
  const [exportData, setExportData] = useState<ExportedData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [deleteDone, setDeleteDone] = useState(false);

  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleExport = async () => {
    if (!sessionId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);
    try {
      const res = await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/gdpr/export/${sessionId}`);
      if (!res.ok) throw new Error("Failed to export data");
      const data = await res.json();
      setExportData(data);
      setExportDone(true);
    } catch (e: any) {
      Alert.alert("Export Failed", e.message || "Could not export your data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    if (!sessionId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Delete My Data",
      "This will submit a deletion request for all your data associated with this session. Your data will be permanently deleted within 30 days.\n\nThis action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Data",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const res = await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/gdpr/data-request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, type: "deletion" }),
              });
              if (!res.ok) throw new Error("Failed to submit deletion request");
              await revokeConsent();
              setDeleteDone(true);
              setTimeout(() => router.replace("/"), 2500);
            } catch (e: any) {
              Alert.alert("Error", e.message || "Could not submit deletion request.");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (deleteDone) {
    return (
      <View style={[styles.center, { paddingTop: topPad }]}>
        <View style={styles.successIcon}>
          <Feather name="check" size={32} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>Deletion Requested</Text>
        <Text style={styles.successMsg}>
          Your data deletion request has been submitted. All data will be permanently deleted within 30 days. The app will now reset.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12} testID="back-btn">
          <Feather name="arrow-left" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Data & Privacy</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {isSignedIn && user && (
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.profileAvatar}>
                <Feather name="user" size={22} color={colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || "Replit User"}
                </Text>
                {user.email ? <Text style={styles.profileEmail}>{user.email}</Text> : null}
              </View>
              <View style={styles.signedInBadge}>
                <Feather name="check-circle" size={12} color={colors.success} />
                <Text style={styles.signedInBadgeText}>Signed In</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.signOutBtn, pressed && styles.btnPressed]}
              onPress={() => {
                Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      await signOut();
                      router.replace("/");
                    },
                  },
                ]);
              }}
              testID="sign-out-btn"
            >
              <Feather name="log-out" size={16} color={colors.danger} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </View>
        )}

        {!hasConsented && !isSignedIn ? (
          <View style={styles.noDataCard}>
            <Feather name="shield-off" size={40} color={colors.textMuted} />
            <Text style={styles.noDataTitle}>No Data Collected</Text>
            <Text style={styles.noDataDesc}>
              You have not given consent to collect data. No personal information has been stored.
            </Text>
            <Pressable style={styles.goHomeBtn} onPress={() => router.replace("/")}>
              <Text style={styles.goHomeBtnText}>Go Home</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Session Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Session ID</Text>
                <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                  {sessionId ?? "—"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Consent given</Text>
                <Text style={styles.infoValue}>{formatDate(consentDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Consent version</Text>
                <Text style={styles.infoValue}>1.0</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Retention period</Text>
                <Text style={styles.infoValue}>12 months</Text>
              </View>
            </View>

            <View style={styles.rightsCard}>
              <Text style={styles.rightsTitle}>Your GDPR Rights</Text>
              {[
                { icon: "download", label: "Right to Access", desc: "Export all data Resilium holds about you" },
                { icon: "trash-2", label: "Right to Erasure", desc: "Request permanent deletion of your data" },
                { icon: "edit-2", label: "Right to Rectification", desc: "Correct inaccurate personal data" },
              ].map((right) => (
                <View key={right.label} style={styles.rightItem}>
                  <View style={styles.rightIcon}>
                    <Feather name={right.icon as any} size={14} color={colors.primary} />
                  </View>
                  <View style={styles.rightText}>
                    <Text style={styles.rightLabel}>{right.label}</Text>
                    <Text style={styles.rightDesc}>{right.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {exportDone && exportData && (
              <View style={styles.exportResult}>
                <View style={styles.exportResultHeader}>
                  <Feather name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.exportResultTitle}>Export Complete</Text>
                </View>
                <Text style={styles.exportResultStats}>
                  {exportData.reports.length} assessment{exportData.reports.length !== 1 ? "s" : ""} found · Exported {new Date(exportData.exportedAt).toLocaleDateString()}
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.exportBtn, pressed && styles.btnPressed, isExporting && styles.btnDisabled]}
                onPress={handleExport}
                disabled={isExporting}
                testID="export-btn"
              >
                <Feather name="download" size={18} color={colors.background} />
                <Text style={styles.exportBtnText}>{isExporting ? "Exporting..." : "Export My Data"}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.deleteBtn, pressed && styles.btnPressed, isDeleting && styles.btnDisabled]}
                onPress={handleDelete}
                disabled={isDeleting}
                testID="delete-btn"
              >
                <Feather name="trash-2" size={18} color={colors.danger} />
                <Text style={styles.deleteBtnText}>{isDeleting ? "Submitting..." : "Delete My Data"}</Text>
              </Pressable>
            </View>

            <View style={styles.legalNote}>
              <Feather name="info" size={14} color={colors.textMuted} />
              <Text style={styles.legalNoteText}>
                Data deletion requests are processed within 30 days per GDPR Article 17. Export requests are processed immediately.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 32,
  },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.successMuted, alignItems: "center", justifyContent: "center",
  },
  successTitle: {
    fontFamily: "Inter_700Bold", fontSize: 24, color: colors.text, letterSpacing: -0.5,
  },
  successMsg: {
    fontFamily: "Inter_400Regular", fontSize: 15, color: colors.textSecondary,
    textAlign: "center", lineHeight: 22,
  },
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
  headerTitle: {
    fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text, letterSpacing: -0.3,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  noDataCard: {
    alignItems: "center", gap: 16,
    backgroundColor: colors.surface, borderRadius: 20, padding: 32,
    borderWidth: 1, borderColor: colors.border,
  },
  noDataTitle: {
    fontFamily: "Inter_700Bold", fontSize: 22, color: colors.text, letterSpacing: -0.5,
  },
  noDataDesc: {
    fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary,
    textAlign: "center", lineHeight: 20,
  },
  goHomeBtn: {
    backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24,
    borderWidth: 1, borderColor: colors.border, marginTop: 8,
  },
  goHomeBtnText: {
    fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    gap: 12, borderWidth: 1, borderColor: colors.border,
  },
  infoCardTitle: {
    fontFamily: "Inter_700Bold", fontSize: 15, color: colors.text, marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  infoLabel: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted,
  },
  infoValue: {
    fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.text,
    flex: 1, textAlign: "right", marginLeft: 16,
  },
  rightsCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    gap: 14, borderWidth: 1, borderColor: colors.border,
  },
  rightsTitle: {
    fontFamily: "Inter_700Bold", fontSize: 15, color: colors.text,
  },
  rightItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
  },
  rightIcon: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: colors.primaryMuted,
    alignItems: "center", justifyContent: "center",
  },
  rightText: { flex: 1, gap: 2 },
  rightLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.text,
  },
  rightDesc: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted,
  },
  exportResult: {
    backgroundColor: colors.successMuted, borderRadius: 12, padding: 14,
    gap: 6, borderWidth: 1, borderColor: "rgba(34,197,94,0.2)",
  },
  exportResultHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  exportResultTitle: {
    fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.success,
  },
  exportResultStats: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary,
  },
  actions: { gap: 12 },
  exportBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16,
  },
  exportBtnText: {
    fontFamily: "Inter_700Bold", fontSize: 16, color: colors.background,
  },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: colors.dangerMuted, borderRadius: 14, paddingVertical: 16,
    borderWidth: 1, borderColor: "rgba(255,69,69,0.2)",
  },
  deleteBtnText: {
    fontFamily: "Inter_700Bold", fontSize: 16, color: colors.danger,
  },
  btnPressed: { opacity: 0.75 },
  btnDisabled: { opacity: 0.5 },
  legalNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  legalNoteText: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted,
    lineHeight: 18, flex: 1,
  },
  profileCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    gap: 14, borderWidth: 1, borderColor: colors.primaryBorder,
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  profileAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.primaryBorder,
  },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: "Inter_700Bold", fontSize: 15, color: colors.text },
  profileEmail: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted, marginTop: 2 },
  signedInBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.successMuted, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: "rgba(34,197,94,0.2)",
  },
  signedInBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: colors.success },
  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.dangerMuted, borderRadius: 12, paddingVertical: 12,
    borderWidth: 1, borderColor: "rgba(255,69,69,0.15)",
  },
  signOutText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.danger },
});
