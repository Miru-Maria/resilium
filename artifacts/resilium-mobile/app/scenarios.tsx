import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Platform, ActivityIndicator, TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

type Scenario = "job_loss" | "health_crisis" | "natural_disaster" | "relocation";

const SCENARIOS: { key: Scenario; label: string; icon: string; desc: string }[] = [
  { key: "job_loss",         label: "Sudden Job Loss",         icon: "briefcase",   desc: "Analyze your runway if your income disappeared tomorrow." },
  { key: "health_crisis",    label: "Major Health Crisis",     icon: "heart",       desc: "Model the financial and logistical impact of a serious illness." },
  { key: "natural_disaster", label: "Natural Disaster",        icon: "cloud-rain",  desc: "Assess your preparedness for an acute environmental emergency." },
  { key: "relocation",       label: "Emergency Relocation",    icon: "map-pin",     desc: "Evaluate your capacity to relocate quickly under pressure." },
];

export default function ScenariosScreen() {
  const insets = useSafeAreaInsets();
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const { getAuthHeaders, isSignedIn } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const topPad = insets.top;
  const bottomPad = insets.bottom;

  const [selected, setSelected] = useState<Scenario>("job_loss");
  const [params, setParams] = useState<Record<string, any>>({
    unemploymentMonths: 6,
    medicalSeverity: "moderate",
    disasterType: "flood",
    destinationRisk: "medium",
    relocationType: "domestic",
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [proError, setProError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runScenario = async () => {
    if (!reportId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setResult(null);
    setProError(false);
    setError(null);

    const body: Record<string, any> = { scenario: selected, parameters: {} };
    if (selected === "job_loss") body.parameters.unemploymentMonths = params.unemploymentMonths;
    if (selected === "health_crisis") body.parameters.medicalSeverity = params.medicalSeverity;
    if (selected === "natural_disaster") body.parameters.disasterType = params.disasterType;
    if (selected === "relocation") {
      body.parameters.destinationRisk = params.destinationRisk;
      body.parameters.relocationType = params.relocationType;
    }

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const res = await fetch(`https://${domain}/api/resilience/scenarios/${reportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...await getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.status === 403) { setProError(true); return; }
      if (!res.ok) throw new Error("Analysis failed — please try again.");
      const data = await res.json();
      setResult(data.analysis ?? data.result ?? JSON.stringify(data));
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const setParam = (key: string, value: any) => {
    Haptics.selectionAsync();
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={20} color={colors.textSecondary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Scenario Stress-Test</Text>
          <Text style={styles.headerSub}>Pro feature</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {!isSignedIn && (
          <View style={styles.gateCard}>
            <Feather name="lock" size={32} color={colors.textMuted} />
            <Text style={styles.gateTitle}>Sign in required</Text>
            <Text style={styles.gateDesc}>Sign in to run scenario stress-tests on your resilience report.</Text>
            <Pressable style={styles.gateBtn} onPress={() => router.push("/sign-in")}>
              <Text style={styles.gateBtnText}>Sign In</Text>
            </Pressable>
          </View>
        )}

        {proError && (
          <View style={styles.gateCard}>
            <Feather name="zap" size={32} color={colors.primary} />
            <Text style={styles.gateTitle}>Pro feature</Text>
            <Text style={styles.gateDesc}>Scenario stress-testing is available on the Pro plan. Upgrade to run unlimited what-if analyses.</Text>
            <Pressable style={styles.gateBtn} onPress={() => router.push("/pricing")}>
              <Text style={styles.gateBtnText}>View Plans</Text>
            </Pressable>
          </View>
        )}

        {!proError && (
          <>
            <Text style={styles.introText}>
              Select a scenario and configure its parameters, then run an AI-powered analysis of how your current resilience profile would hold up.
            </Text>

            <View style={styles.scenarioGrid}>
              {SCENARIOS.map(s => (
                <Pressable
                  key={s.key}
                  style={[styles.scenarioCard, selected === s.key && styles.scenarioCardSelected]}
                  onPress={() => { Haptics.selectionAsync(); setSelected(s.key); setResult(null); setError(null); }}
                >
                  <Feather name={s.icon as any} size={20} color={selected === s.key ? colors.primary : colors.textMuted} />
                  <Text style={[styles.scenarioLabel, selected === s.key && { color: colors.primary }]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.paramsCard}>
              <Text style={styles.paramsTitle}>Parameters</Text>
              <Text style={styles.paramsDesc}>{SCENARIOS.find(s => s.key === selected)?.desc}</Text>

              {selected === "job_loss" && (
                <View style={styles.paramGroup}>
                  <Text style={styles.paramLabel}>Unemployment duration: <Text style={{ color: colors.primary }}>{params.unemploymentMonths} months</Text></Text>
                  <View style={styles.segmentRow}>
                    {[3, 6, 12, 18, 24].map(v => (
                      <Pressable key={v} style={[styles.seg, params.unemploymentMonths === v && styles.segSelected]} onPress={() => setParam("unemploymentMonths", v)}>
                        <Text style={[styles.segText, params.unemploymentMonths === v && styles.segTextSelected]}>{v}m</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {selected === "health_crisis" && (
                <View style={styles.paramGroup}>
                  <Text style={styles.paramLabel}>Medical severity</Text>
                  <View style={styles.segmentRow}>
                    {(["mild", "moderate", "severe"] as const).map(v => (
                      <Pressable key={v} style={[styles.seg, params.medicalSeverity === v && styles.segSelected]} onPress={() => setParam("medicalSeverity", v)}>
                        <Text style={[styles.segText, params.medicalSeverity === v && styles.segTextSelected]}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {selected === "natural_disaster" && (
                <View style={styles.paramGroup}>
                  <Text style={styles.paramLabel}>Disaster type</Text>
                  <View style={styles.segmentRow}>
                    {(["flood", "earthquake", "wildfire", "hurricane"] as const).map(v => (
                      <Pressable key={v} style={[styles.seg, params.disasterType === v && styles.segSelected]} onPress={() => setParam("disasterType", v)}>
                        <Text style={[styles.segText, params.disasterType === v && styles.segTextSelected]}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {selected === "relocation" && (
                <>
                  <View style={styles.paramGroup}>
                    <Text style={styles.paramLabel}>Relocation type</Text>
                    <View style={styles.segmentRow}>
                      {(["domestic", "international"] as const).map(v => (
                        <Pressable key={v} style={[styles.seg, params.relocationType === v && styles.segSelected]} onPress={() => setParam("relocationType", v)}>
                          <Text style={[styles.segText, params.relocationType === v && styles.segTextSelected]}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <View style={styles.paramGroup}>
                    <Text style={styles.paramLabel}>Destination risk level</Text>
                    <View style={styles.segmentRow}>
                      {(["low", "medium", "high"] as const).map(v => (
                        <Pressable key={v} style={[styles.seg, params.destinationRisk === v && styles.segSelected]} onPress={() => setParam("destinationRisk", v)}>
                          <Text style={[styles.segText, params.destinationRisk === v && styles.segTextSelected]}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [styles.runBtn, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}
              onPress={runScenario}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color={colors.background} />
                : <Feather name="play" size={16} color={colors.background} />
              }
              <Text style={styles.runBtnText}>{loading ? "Analyzing…" : "Run Scenario Analysis"}</Text>
            </Pressable>

            {error && (
              <View style={styles.errorCard}>
                <Feather name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {result && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Feather name="file-text" size={15} color={colors.primary} />
                  <Text style={styles.resultTitle}>{SCENARIOS.find(s => s.key === selected)?.label} — Analysis</Text>
                </View>
                <Text style={styles.resultText}>{result}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text, letterSpacing: -0.3, textAlign: "center" },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.primary, textAlign: "center", marginTop: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  introText: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  scenarioGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  scenarioCard: {
    flex: 1, minWidth: "45%", alignItems: "center", gap: 8,
    backgroundColor: colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  scenarioCardSelected: { borderColor: colors.primary + "66", backgroundColor: colors.primary + "0D" },
  scenarioLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.textSecondary, textAlign: "center" },
  paramsCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: colors.border, gap: 14,
  },
  paramsTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: colors.text },
  paramsDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  paramGroup: { gap: 10 },
  paramLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary },
  segmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  seg: {
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 7, paddingHorizontal: 12, backgroundColor: colors.background,
  },
  segSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  segText: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary },
  segTextSelected: { fontFamily: "Inter_600SemiBold", color: colors.background },
  runBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9,
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 15,
  },
  runBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.background },
  errorCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.danger + "15", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.danger + "40",
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.danger, flex: 1 },
  resultCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: colors.primary + "33", gap: 12,
  },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  resultTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.primary },
  resultText: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.text, lineHeight: 22 },
  gateCard: {
    alignItems: "center", gap: 14,
    backgroundColor: colors.surface, borderRadius: 20, padding: 32,
    borderWidth: 1, borderColor: colors.border,
  },
  gateTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: colors.text, letterSpacing: -0.4 },
  gateDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
  gateBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 28,
  },
  gateBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.background },
});
