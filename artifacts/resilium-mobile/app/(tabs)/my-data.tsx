import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getExpoPushToken, registerPushTokenWithBackend, requestNotificationPermission } from "@/utils/notifications";
import { computeBadgeCriteria } from "@/utils/badge-criteria";
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

const NOTIF_PREFS_KEY = "resilium_notif_prefs_v1";
const CHECKIN_KEY = "resilium_checkin_history_v1";
const STREAK_KEY = "resilium_streak_v1";
const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;

type CheckinEntry = { date: string; scores: Record<string, number> };

type NotifPrefs = {
  dailyHabit: boolean;
  weeklyCheckin: boolean;
  reassessmentNudge: boolean;
};

const DEFAULT_PREFS: NotifPrefs = {
  dailyHabit: false,
  weeklyCheckin: false,
  reassessmentNudge: false,
};


export default function MyDataScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId, consentDate, revokeConsent, hasConsented } = useSession();
  const { isSignedIn, user, signOut, getAuthHeaders } = useAuth();
  const [exportData, setExportData] = useState<ExportedData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [deleteDone, setDeleteDone] = useState(false);
  const [subscription, setSubscription] = useState<{ status: string; isActive: boolean; planName?: string; currentPeriodEnd?: string } | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [notifPermission, setNotifPermission] = useState<boolean | null>(null);
  const [checkinHistory, setCheckinHistory] = useState<CheckinEntry[]>([]);
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [planCount, setPlanCount] = useState(0);
  const [allDimsAssessed, setAllDimsAssessed] = useState(false);
  const [completedDaysCount, setCompletedDaysCount] = useState(0);
  const [streak, setStreak] = useState(0);

  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = insets.top;
  const bottomPad = insets.bottom;

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const r = await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}/api/users/me/subscription`, { headers });
        if (r.ok) setSubscription(await r.json());
      } catch {}
    })();
  }, [isSignedIn]);

  useEffect(() => {
    AsyncStorage.getItem(CHECKIN_KEY).then(raw => {
      if (raw) { try { setCheckinHistory(JSON.parse(raw)); } catch {} }
    });
    AsyncStorage.getItem(STREAK_KEY).then(raw => {
      if (!raw) return;
      try {
        const data: { lastDate: string; count: number } = JSON.parse(raw);
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
        if (data.lastDate === today || data.lastDate === yesterday) {
          setCheckinStreak(data.count);
          setStreak(data.count);
        }
      } catch {}
    });
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const [plansRes, challengeRes] = await Promise.allSettled([
          fetch(`https://${DOMAIN}/api/users/me/plans`, { headers }),
          fetch(`https://${DOMAIN}/api/challenge`, { headers }),
        ]);
        if (plansRes.status === "fulfilled" && plansRes.value.ok) {
          const data = await plansRes.value.json();
          const plans: any[] = data.plans ?? [];
          setPlanCount(plans.length);
          if (plans.length > 0) {
            const latest = plans[plans.length - 1];
            const dims = [
              "scoreFinancial", "scoreHealth", "scoreSkills",
              "scoreMobility", "scorePsychological", "scoreResources",
            ];
            setAllDimsAssessed(dims.every(k => latest[k] !== null && latest[k] !== undefined));
          }
        }
        if (challengeRes.status === "fulfilled" && challengeRes.value.ok) {
          const cd = await challengeRes.value.json();
          if (cd?.completedDays) setCompletedDaysCount(cd.completedDays.length);
        }
      } catch {}
    })();
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`https://${DOMAIN}/api/checkins`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        const serverEntries: Array<{ date: string; scores: Record<string, number> }> = data.checkins ?? [];
        if (serverEntries.length === 0) return;
        const raw = await AsyncStorage.getItem(CHECKIN_KEY);
        const local: Array<{ date: string; scores: Record<string, number> }> = raw ? JSON.parse(raw) : [];
        const byDate = new Map(local.map(e => [e.date, e]));
        for (const entry of serverEntries) byDate.set(entry.date, entry);
        const merged = Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
        await AsyncStorage.setItem(CHECKIN_KEY, JSON.stringify(merged));
        setCheckinHistory(merged);
      } catch {}
    })();
  }, [isSignedIn]);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_PREFS_KEY).then(val => {
      if (val) {
        try { setNotifPrefs({ ...DEFAULT_PREFS, ...JSON.parse(val) }); } catch {}
      }
    });
    if (Platform.OS !== "web") {
      import("expo-notifications")
        .then(mod => mod.getPermissionsAsync())
        .then(({ status }) => setNotifPermission(status === "granted"))
        .catch(() => setNotifPermission(false));
    } else {
      setNotifPermission(false);
    }
  }, []);

  const toggleNotif = useCallback(async (key: keyof NotifPrefs, value: boolean) => {
    Haptics.selectionAsync();
    if (value && !notifPermission) {
      const granted = await requestNotificationPermission();
      setNotifPermission(granted);
      if (!granted) {
        Alert.alert("Notifications Blocked", "Please enable notifications in your device settings to use this feature.");
        return;
      }
    }
    const next = { ...notifPrefs, [key]: value };
    setNotifPrefs(next);
    await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(next));
    // Register push token with server when user enables any notification
    if (value && isSignedIn) {
      getExpoPushToken().then(async token => {
        if (!token) return;
        const headers = await getAuthHeaders();
        await registerPushTokenWithBackend(token, process.env.EXPO_PUBLIC_DOMAIN ?? "", headers);
      }).catch(() => {});
    }
  }, [notifPrefs, notifPermission, isSignedIn, getAuthHeaders]);

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
        <View style={{ width: 38 }} />
        <Text style={styles.headerTitle}>My Data & Privacy</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Resilience Profile card ── */}
        <View style={styles.profileResilCard}>
          <View style={styles.profileResilHeader}>
            <View style={styles.profileResilIconWrap}>
              <Feather name="activity" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileResilTitle}>Your Resilience Profile</Text>
              <Text style={styles.profileResilSub}>
                {hasConsented
                  ? "View your saved plans and scores in the Plans tab."
                  : "Complete the assessment to unlock your profile."}
              </Text>
            </View>
          </View>

          {hasConsented ? (
            <Pressable
              style={({ pressed }) => [styles.plansRedirectBtn, pressed && styles.btnPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace("/(tabs)/my-plans");
              }}
            >
              <Text style={styles.plansRedirectBtnText}>View My Plans</Text>
              <Feather name="arrow-right" size={15} color={colors.background} />
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.plansRedirectBtn, styles.plansRedirectBtnAlt, pressed && styles.btnPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/consent");
              }}
            >
              <Text style={[styles.plansRedirectBtnText, { color: colors.primary }]}>
                Start My Assessment
              </Text>
              <Feather name="arrow-right" size={15} color={colors.primary} />
            </Pressable>
          )}
        </View>

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

        {isSignedIn && subscription && (
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionRow}>
              <View style={[styles.planBadge, subscription.isActive ? styles.planBadgePro : styles.planBadgeFree]}>
                <Feather name={subscription.isActive ? "zap" : "user"} size={12} color={subscription.isActive ? colors.primary : colors.textMuted} />
                <Text style={[styles.planBadgeText, { color: subscription.isActive ? colors.primary : colors.textMuted }]}>
                  {subscription.isActive ? "Pro" : "Free"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subscriptionTitle}>
                  {subscription.isActive ? (subscription.planName ?? "Resilium Pro") : "Resilium Free"}
                </Text>
                {subscription.isActive && subscription.currentPeriodEnd && (
                  <Text style={styles.subscriptionExpiry}>
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                )}
                {!subscription.isActive && (
                  <Text style={styles.subscriptionExpiry}>2 saved plans · core features</Text>
                )}
              </View>
            </View>
            {!subscription.isActive && (
              <Pressable
                style={({ pressed }) => [styles.upgradeSubBtn, pressed && { opacity: 0.85 }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/pricing"); }}
              >
                <Feather name="zap" size={14} color={colors.background} />
                <Text style={styles.upgradeSubBtnText}>Upgrade to Pro</Text>
              </Pressable>
            )}
          </View>
        )}

        {isSignedIn && planCount > 0 && (() => {
          const isPro = subscription?.isActive ?? false;
          const badges = computeBadgeCriteria({ planCount, allDimsAssessed, streak, completedDaysCount, isPro });
          const earned = badges.filter(b => b.earned);
          const locked = badges.filter(b => !b.earned);
          const BADGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
            amber: { bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.25)", text: "#92400E" },
            blue: { bg: "rgba(37,99,235,0.1)", border: "rgba(37,99,235,0.25)", text: "#1E40AF" },
            violet: { bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.25)", text: "#5B21B6" },
            orange: { bg: "rgba(234,88,12,0.1)", border: "rgba(234,88,12,0.25)", text: "#9A3412" },
            emerald: { bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.25)", text: "#065F46" },
            rose: { bg: "rgba(225,29,72,0.1)", border: "rgba(225,29,72,0.25)", text: "#9F1239" },
            "emerald-dark": { bg: "rgba(4,120,87,0.1)", border: "rgba(4,120,87,0.3)", text: "#064E3B" },
            primary: { bg: "rgba(42,59,50,0.1)", border: "rgba(42,59,50,0.25)", text: colors.primary },
          };
          return (
            <View style={[styles.subscriptionCard, { gap: 12 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="award" size={16} color={colors.primary} />
                  <Text style={styles.subscriptionTitle}>Achievements</Text>
                </View>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted }}>
                  {earned.length}/{badges.length} earned
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {earned.map(badge => {
                  const c = BADGE_COLORS[badge.colorKey] ?? BADGE_COLORS.amber;
                  return (
                    <View
                      key={badge.id}
                      style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, backgroundColor: c.bg, borderColor: c.border }}
                    >
                      <Feather name={badge.iconName} size={12} color={c.text} />
                      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: c.text }}>{badge.label}</Text>
                    </View>
                  );
                })}
                {locked.map(badge => (
                  <View
                    key={badge.id}
                    style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.45 }}
                  >
                    <Feather name={badge.iconName} size={12} color={colors.textMuted} />
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textMuted }}>{badge.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}

        {checkinHistory.length > 0 && (
          <View style={styles.checkinSection}>
            <View style={styles.checkinSectionHeader}>
              <Text style={styles.checkinEyebrow}>RECENT CHECK-INS</Text>
              {checkinStreak >= 2 && (
                <View style={[styles.streakBadge, { backgroundColor: "rgba(224,128,64,0.12)", borderColor: "rgba(224,128,64,0.25)" }]}>
                  <Text style={{ fontSize: 11 }}>🔥</Text>
                  <Text style={[styles.streakText, { color: colors.primary }]}>{checkinStreak}-day streak</Text>
                </View>
              )}
            </View>
            <View style={[styles.checkinList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              {checkinHistory.slice(0, 7).map((entry, idx) => {
                const vals = Object.values(entry.scores);
                const avg = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
                const dc = avg >= 4 ? colors.success : avg >= 3 ? "#F59E0B" : colors.danger;
                const label = avg >= 4 ? "Strong" : avg >= 3 ? "Moderate" : "Low";
                const date = new Date(entry.date + "T12:00:00");
                const formatted = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                const isLast = idx === Math.min(checkinHistory.length, 7) - 1;
                return (
                  <View key={entry.date} style={[styles.checkinRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.checkinDate, { color: colors.text }]}>{formatted}</Text>
                      <View style={styles.dimDots}>
                        {Object.entries(entry.scores).map(([k, v]) => (
                          <View key={k} style={[styles.dimDot, { backgroundColor: v >= 4 ? colors.success : v >= 3 ? "#F59E0B" : colors.danger }]} />
                        ))}
                      </View>
                    </View>
                    <View style={[styles.avgBadge, { backgroundColor: dc + "18", borderColor: dc + "44" }]}>
                      <Text style={[styles.avgScore, { color: dc }]}>{avg}/5</Text>
                      <Text style={[styles.avgLabel, { color: dc }]}>{label}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {isSignedIn && Platform.OS !== "web" && (
          <View style={styles.notifCard}>
            <View style={styles.notifHeader}>
              <Feather name="bell" size={16} color={colors.primary} />
              <Text style={styles.notifTitle}>Notification Preferences</Text>
            </View>
            <Text style={styles.notifSubtitle}>Choose which reminders you'd like to receive</Text>

            {[
              {
                key: "dailyHabit" as keyof NotifPrefs,
                label: "Daily Habit Reminder",
                desc: "A gentle nudge each morning to work on a resilience task",
                icon: "sunrise",
              },
              {
                key: "weeklyCheckin" as keyof NotifPrefs,
                label: "Weekly Progress Check-In",
                desc: "A Sunday recap of your plan progress this week",
                icon: "calendar",
              },
              {
                key: "reassessmentNudge" as keyof NotifPrefs,
                label: "Reassessment Nudge",
                desc: "Reminder to retake the assessment every 90 days",
                icon: "refresh-cw",
              },
            ].map(item => (
              <View key={item.key} style={styles.notifRow}>
                <View style={styles.notifRowIcon}>
                  <Feather name={item.icon as any} size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifRowLabel}>{item.label}</Text>
                  <Text style={styles.notifRowDesc}>{item.desc}</Text>
                </View>
                <Switch
                  value={notifPrefs[item.key]}
                  onValueChange={(v) => toggleNotif(item.key, v)}
                  trackColor={{ false: colors.border, true: colors.primary + "80" }}
                  thumbColor={notifPrefs[item.key] ? colors.primary : colors.textMuted}
                />
              </View>
            ))}

            {!notifPermission && (
              <View style={styles.notifWarning}>
                <Feather name="alert-triangle" size={13} color="#F59E0B" />
                <Text style={styles.notifWarningText}>
                  Notifications are currently disabled. Enable them in your device settings.
                </Text>
              </View>
            )}
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
  profileResilCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    gap: 14, borderWidth: 1, borderColor: colors.primaryBorder,
  },
  profileResilHeader: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
  },
  profileResilIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  profileResilTitle: {
    fontFamily: "Inter_700Bold", fontSize: 15, color: colors.text, marginBottom: 3,
  },
  profileResilSub: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted, lineHeight: 18,
  },
  plansRedirectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 13,
  },
  plansRedirectBtnAlt: {
    backgroundColor: colors.primaryMuted, borderWidth: 1, borderColor: colors.primaryBorder,
  },
  plansRedirectBtnText: {
    fontFamily: "Inter_700Bold", fontSize: 14, color: colors.background,
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
  subscriptionCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  subscriptionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  planBadge: {
    flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  planBadgePro: {
    backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder,
  },
  planBadgeFree: {
    backgroundColor: colors.surface, borderColor: colors.border,
  },
  planBadgeText: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 0.4 },
  subscriptionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text },
  subscriptionExpiry: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted, marginTop: 2 },
  upgradeSubBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 11,
  },
  upgradeSubBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.background },
  notifCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: colors.border, gap: 14,
  },
  notifHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  notifTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: colors.text },
  notifSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted, marginTop: -6 },
  notifRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border,
  },
  notifRowIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  notifRowLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.text },
  notifRowDesc: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 16 },
  notifWarning: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "rgba(245,158,11,0.1)", borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: "rgba(245,158,11,0.2)",
  },
  notifWarningText: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: "#B45309", flex: 1, lineHeight: 17,
  },
  checkinSection: { gap: 10 },
  checkinSectionHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  checkinEyebrow: {
    fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2,
    color: colors.textMuted, textTransform: "uppercase",
  },
  streakBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1,
  },
  streakText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  checkinList: {
    borderRadius: 16, borderWidth: 1, overflow: "hidden",
  },
  checkinRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  checkinDate: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 5 },
  dimDots: { flexDirection: "row", gap: 5 },
  dimDot: { width: 8, height: 8, borderRadius: 4 },
  avgBadge: {
    alignItems: "center", borderRadius: 10, paddingVertical: 6,
    paddingHorizontal: 10, borderWidth: 1, minWidth: 60,
  },
  avgScore: { fontFamily: "Inter_700Bold", fontSize: 14 },
  avgLabel: { fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 1 },
});
