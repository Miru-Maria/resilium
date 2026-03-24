import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useSession } from "@/context/session";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type AssessmentData = {
  location: string;
  incomeStability: "fixed" | "freelance" | "unstable";
  savingsMonths: number;
  hasDependents: boolean;
  skills: string[];
  healthStatus: "excellent" | "good" | "fair" | "poor";
  mobilityLevel: "high" | "medium" | "low";
  housingType: "own" | "rent" | "family" | "nomadic" | "other";
  hasEmergencySupplies: boolean;
  psychologicalResilience: number;
  riskConcerns: string[];
};

const TOTAL_STEPS = 10;

const STEPS = [
  { title: "Where are you based?", subtitle: "Your location affects climate, political, and economic risk factors." },
  { title: "Income stability?", subtitle: "How consistent and secure is your main income source?" },
  { title: "Financial runway?", subtitle: "Months of expenses covered by savings if income stopped today." },
  { title: "Do you have dependents?", subtitle: "Children, elderly parents, or others financially reliant on you." },
  { title: "Practical skills?", subtitle: "Select all skills you actively possess." },
  { title: "Health & mobility?", subtitle: "Your physical readiness to handle crisis situations." },
  { title: "Housing situation?", subtitle: "Where you currently live and your flexibility to move." },
  { title: "Emergency preparedness?", subtitle: "Do you have 14+ days of food, water, and essential medicines?" },
  { title: "Psychological resilience?", subtitle: "How well do you handle severe stress and rapid change?" },
  { title: "Primary risk concerns?", subtitle: "Select the risks you feel least prepared for." },
];

function OptionCard({
  selected,
  onPress,
  children,
  danger = false,
  styles,
}: {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
  danger?: boolean;
  styles: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        selected && (danger ? styles.optionCardSelectedDanger : styles.optionCardSelected),
        pressed && styles.optionCardPressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

function SliderControl({
  value,
  min,
  max,
  onChange,
  formatValue,
  styles,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
  styles: any;
}) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <View>
      <Text style={styles.sliderValue}>{formatValue ? formatValue(value) : value}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sliderRow}
      >
        {steps.map((v) => (
          <Pressable
            key={v}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(v);
            }}
            style={[styles.sliderTick, value === v && styles.sliderTickSelected]}
          >
            <Text style={[styles.sliderTickText, value === v && styles.sliderTickTextSelected]}>
              {v}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default function AssessmentScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId } = useSession();
  const [step, setStep] = useState(0);
  const progress = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;

  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [data, setData] = useState<AssessmentData>({
    location: "",
    incomeStability: "fixed",
    savingsMonths: 3,
    hasDependents: false,
    skills: [],
    healthStatus: "good",
    mobilityLevel: "medium",
    housingType: "rent",
    hasEmergencySupplies: false,
    psychologicalResilience: 7,
    riskConcerns: [],
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const animateProgress = (nextStep: number) => {
    Animated.spring(progress, {
      toValue: (nextStep + 1) / TOTAL_STEPS,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < TOTAL_STEPS - 1) {
      const next = step + 1;
      setStep(next);
      animateProgress(next);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) {
      const prev = step - 1;
      setStep(prev);
      animateProgress(prev);
    } else {
      router.back();
    }
  };

  const update = <K extends keyof AssessmentData>(key: K, value: AssessmentData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSkill = (skill: string) => {
    Haptics.selectionAsync();
    setData((prev) => {
      const cur = prev.skills;
      if (cur.includes(skill)) return { ...prev, skills: cur.filter((s) => s !== skill) };
      if (skill === "none") return { ...prev, skills: ["none"] };
      return { ...prev, skills: [...cur.filter((s) => s !== "none"), skill] };
    });
  };

  const toggleRisk = (risk: string) => {
    Haptics.selectionAsync();
    setData((prev) => {
      const cur = prev.riskConcerns;
      if (cur.includes(risk)) return { ...prev, riskConcerns: cur.filter((r) => r !== risk) };
      return { ...prev, riskConcerns: [...cur, risk] };
    });
  };

  const isValid = () => {
    if (step === 0) return data.location.trim().length > 1;
    if (step === 4) return data.skills.length > 0;
    if (step === 9) return data.riskConcerns.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    router.replace({
      pathname: "/loading",
      params: {
        assessmentData: JSON.stringify({ ...data, sessionId }),
      },
    });
  };

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const currentStep = STEPS[step];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12} testID="back-btn">
          <Feather name={step === 0 ? "x" : "arrow-left"} size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.stepCounter}>{step + 1} / {TOTAL_STEPS}</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: barWidth }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>

        {step === 0 && (
          <TextInput
            style={styles.textInput}
            value={data.location}
            onChangeText={(v) => update("location", v)}
            placeholder="e.g. California, USA"
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={isValid() ? handleNext : undefined}
            testID="location-input"
          />
        )}

        {step === 1 && (
          <View style={styles.optionList}>
            {([
              { id: "fixed", label: "Fixed & Secure", desc: "Salaried, guaranteed pension" },
              { id: "freelance", label: "Variable / Freelance", desc: "Fluctuates month to month" },
              { id: "unstable", label: "Unstable / Irregular", desc: "Unemployed or highly volatile" },
            ] as const).map((opt) => (
              <OptionCard key={opt.id} styles={styles} selected={data.incomeStability === opt.id} onPress={() => { Haptics.selectionAsync(); update("incomeStability", opt.id); }}>
                <View style={styles.optionCardInner}>
                  <View style={styles.optionCardText}>
                    <Text style={[styles.optionLabel, data.incomeStability === opt.id && styles.optionLabelSelected]}>{opt.label}</Text>
                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                  </View>
                  {data.incomeStability === opt.id && (
                    <Feather name="check-circle" size={20} color={colors.primary} />
                  )}
                </View>
              </OptionCard>
            ))}
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <SliderControl
              styles={styles}
              value={data.savingsMonths}
              min={0}
              max={24}
              onChange={(v) => update("savingsMonths", v)}
              formatValue={(v) => v === 24 ? "24+ months" : v === 1 ? "1 month" : `${v} months`}
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.yesNoGrid}>
            {(["true", "false"] as const).map((val) => {
              const isYes = val === "true";
              const selected = data.hasDependents === isYes;
              return (
                <OptionCard key={val} styles={styles} selected={selected} onPress={() => { Haptics.selectionAsync(); update("hasDependents", isYes); }}>
                  <View style={styles.yesNoCard}>
                    <Feather
                      name={isYes ? "users" : "user"}
                      size={28}
                      color={selected ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.yesNoLabel, selected && styles.yesNoLabelSelected]}>
                      {isYes ? "Yes" : "No"}
                    </Text>
                    <Text style={styles.yesNoDesc}>
                      {isYes ? "I have dependents" : "No dependents"}
                    </Text>
                  </View>
                </OptionCard>
              );
            })}
          </View>
        )}

        {step === 4 && (
          <View style={styles.chipGrid}>
            {[
              { id: "digital", label: "Digital / Tech" },
              { id: "physical", label: "Trade / Manual" },
              { id: "survival", label: "Outdoors / Survival" },
              { id: "medical", label: "First Aid / Medical" },
              { id: "financial", label: "Trading / Finance" },
              { id: "language", label: "Multiple Languages" },
              { id: "none", label: "None of these" },
            ].map((s) => (
              <Pressable
                key={s.id}
                onPress={() => toggleSkill(s.id)}
                style={[styles.chip, data.skills.includes(s.id) && styles.chipSelected]}
              >
                <Text style={[styles.chipText, data.skills.includes(s.id) && styles.chipTextSelected]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {step === 5 && (
          <View style={styles.section}>
            <Text style={styles.subSectionTitle}>Overall Health</Text>
            <View style={styles.segmentRow}>
              {(["excellent", "good", "fair", "poor"] as const).map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => { Haptics.selectionAsync(); update("healthStatus", opt); }}
                  style={[styles.segment, data.healthStatus === opt && styles.segmentSelected]}
                >
                  <Text style={[styles.segmentText, data.healthStatus === opt && styles.segmentTextSelected]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Mobility Level</Text>
            <Text style={styles.subSectionDesc}>How easily could you relocate internationally?</Text>
            <View style={styles.segmentRow}>
              {(["high", "medium", "low"] as const).map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => { Haptics.selectionAsync(); update("mobilityLevel", opt); }}
                  style={[styles.segment, data.mobilityLevel === opt && styles.segmentSelected]}
                >
                  <Text style={[styles.segmentText, data.mobilityLevel === opt && styles.segmentTextSelected]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 6 && (
          <View style={styles.optionList}>
            {[
              { id: "own", label: "Own a home", desc: "Mortgage or outright ownership" },
              { id: "rent", label: "Renting", desc: "Long-term rental agreement" },
              { id: "family", label: "Living with family", desc: "With parents or relatives" },
              { id: "nomadic", label: "Nomadic", desc: "Frequent traveler, no fixed base" },
              { id: "other", label: "Other", desc: "Temporary or transitional housing" },
            ].map((opt) => (
              <OptionCard key={opt.id} styles={styles} selected={data.housingType === opt.id} onPress={() => { Haptics.selectionAsync(); update("housingType", opt.id as any); }}>
                <View style={styles.optionCardInner}>
                  <View style={styles.optionCardText}>
                    <Text style={[styles.optionLabel, data.housingType === opt.id && styles.optionLabelSelected]}>{opt.label}</Text>
                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                  </View>
                  {data.housingType === opt.id && (
                    <Feather name="check-circle" size={20} color={colors.primary} />
                  )}
                </View>
              </OptionCard>
            ))}
          </View>
        )}

        {step === 7 && (
          <View style={styles.yesNoGrid}>
            {(["true", "false"] as const).map((val) => {
              const isYes = val === "true";
              const selected = data.hasEmergencySupplies === isYes;
              return (
                <OptionCard key={val} styles={styles} selected={selected} onPress={() => { Haptics.selectionAsync(); update("hasEmergencySupplies", isYes); }}>
                  <View style={styles.yesNoCard}>
                    <Feather
                      name={isYes ? "package" : "x-circle"}
                      size={28}
                      color={selected ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.yesNoLabel, selected && styles.yesNoLabelSelected]}>
                      {isYes ? "Yes" : "No"}
                    </Text>
                    <Text style={styles.yesNoDesc}>
                      {isYes ? "14+ days of supplies" : "Not prepared yet"}
                    </Text>
                  </View>
                </OptionCard>
              );
            })}
          </View>
        )}

        {step === 8 && (
          <View style={styles.section}>
            <SliderControl
              styles={styles}
              value={data.psychologicalResilience}
              min={1}
              max={10}
              onChange={(v) => update("psychologicalResilience", v)}
              formatValue={(v) => {
                if (v <= 3) return `${v} — Easily overwhelmed`;
                if (v <= 6) return `${v} — Moderately resilient`;
                if (v <= 8) return `${v} — Highly adaptable`;
                return `${v} — Unshakeable`;
              }}
            />
          </View>
        )}

        {step === 9 && (
          <View style={styles.chipGrid}>
            {[
              { id: "job_loss", label: "Job Loss" },
              { id: "inflation", label: "Hyperinflation" },
              { id: "financial_crisis", label: "Market Crash" },
              { id: "natural_disaster", label: "Natural Disaster" },
              { id: "supply_chain", label: "Supply Chain" },
              { id: "political_instability", label: "Political Unrest" },
              { id: "cyber_attack", label: "Cyber Outage" },
              { id: "war_conflict", label: "War / Conflict" },
              { id: "pandemic", label: "Pandemic" },
              { id: "illness", label: "Personal Illness" },
            ].map((r) => (
              <Pressable
                key={r.id}
                onPress={() => toggleRisk(r.id)}
                style={[styles.chip, styles.riskChip, data.riskConcerns.includes(r.id) && styles.chipSelectedDanger]}
              >
                <Text style={[styles.chipText, data.riskConcerns.includes(r.id) && styles.chipTextDanger]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.nextBtn, !isValid() && styles.nextBtnDisabled, pressed && styles.nextBtnPressed]}
          onPress={handleNext}
          disabled={!isValid()}
          testID="next-btn"
        >
          <Text style={styles.nextBtnText}>
            {step === TOTAL_STEPS - 1 ? "Generate Report" : "Continue"}
          </Text>
          <Feather
            name={step === TOTAL_STEPS - 1 ? "zap" : "arrow-right"}
            size={18}
            color={!isValid() ? colors.textMuted : colors.background}
          />
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
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
  stepCounter: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    marginBottom: 0,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 20,
  },
  stepTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  stepSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: -4,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: colors.text,
  },
  optionList: { gap: 10 },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  optionCardSelectedDanger: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
  optionCardPressed: {
    opacity: 0.8,
  },
  optionCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionCardText: { flex: 1 },
  optionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  yesNoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  yesNoCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 20,
  },
  yesNoLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: colors.textSecondary,
  },
  yesNoLabelSelected: {
    color: colors.primary,
  },
  yesNoDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  section: { gap: 12 },
  subSectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.text,
  },
  subSectionDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -6,
    marginBottom: 4,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  segmentSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  segmentText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: colors.textSecondary,
  },
  segmentTextSelected: {
    color: colors.primary,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  riskChip: {},
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  chipSelectedDanger: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
  },
  chipTextDanger: {
    color: colors.danger,
  },
  sliderValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: 16,
  },
  sliderRow: {
    gap: 8,
    paddingRight: 24,
  },
  sliderTick: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  sliderTickSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sliderTickText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: colors.textSecondary,
  },
  sliderTickTextSelected: {
    color: colors.background,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  nextBtnDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  nextBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  nextBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: colors.background,
  },
});
