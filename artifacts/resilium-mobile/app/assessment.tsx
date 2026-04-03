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
import * as Location from "expo-location";

import { useSession } from "@/context/session";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type MrAnswers = Record<string, number>;

type AssessmentData = {
  location: string;
  currency: string;
  customCurrency: string;
  ageBracket?: string;
  incomeStability: "fixed" | "freelance" | "unstable" | "student";
  savingsMonths: number;
  savingsPreferNotToSay: boolean;
  incomePreferNotToSay: boolean;
  dependentCount: number;
  relocationReadiness?: "immediate" | "within_month" | "within_3months" | "difficult";
  skills: string[];
  healthStatus: "excellent" | "good" | "fair" | "poor";
  chronicCondition?: "yes" | "no" | "prefer_not_to_say";
  mobilityLevel: "high" | "medium" | "low";
  housingType: "own" | "rent" | "family" | "nomadic" | "other" | "temporary" | "transitional";
  emergencySupplyTier?: "none" | "under_3days" | "3_14days" | "2weeks_1month" | "over_1month";
  psychologicalResilience: number;
  riskConcerns: string[];
  trustedLocalContacts?: number;
  communityInvolvement?: "none" | "occasional" | "active";
  mutualAidAccess?: boolean;
  mentalResilienceAnswers: MrAnswers;
};

const MR_QUESTIONS = [
  { key: "stressTolerance1",    dimension: "STRESS TOLERANCE",    question: "When facing an unexpected crisis, I remain calm and think clearly under pressure." },
  { key: "stressTolerance2",    dimension: "STRESS TOLERANCE",    question: "I recover quickly after a stressful event and return to normal functioning." },
  { key: "adaptability1",       dimension: "ADAPTABILITY",        question: "I adjust my plans smoothly when circumstances change unexpectedly." },
  { key: "adaptability2",       dimension: "ADAPTABILITY",        question: "I find it easy to embrace new routines or environments." },
  { key: "learningAgility1",    dimension: "LEARNING NEW THINGS", question: "I actively seek out new skills or knowledge when I notice a gap in my preparedness." },
  { key: "changeManagement1",   dimension: "HANDLING CHANGE",     question: "I plan ahead for major life changes rather than reacting after the fact." },
  { key: "changeManagement2",   dimension: "HANDLING CHANGE",     question: "I feel confident dealing with big uncertain situations like economic shifts or political instability." },
  { key: "emotionalRegulation1",dimension: "MANAGING YOUR EMOTIONS", question: "I manage anxiety and fear productively without being stopped in my tracks by them." },
  { key: "emotionalRegulation2",dimension: "MANAGING YOUR EMOTIONS", question: "I can maintain a positive outlook during extended periods of difficulty." },
  { key: "socialSupport1",      dimension: "SOCIAL SUPPORT",      question: "I have a reliable support network I can call on during a major crisis." },
];

const DEFAULT_MR_ANSWERS: MrAnswers = Object.fromEntries(
  MR_QUESTIONS.map((q) => [q.key, 3])
);

// Steps:
// 0  = Location + Currency
// 1  = Age Bracket
// 2  = Income Stability
// 3  = Mental Resilience (sub-steps)
// 4  = Financial Runway
// 5  = Dependents
// 6  = Skills
// 7  = Health (health status + chronic condition)
// 8  = Mobility & Relocation
// 9  = Housing
// 10 = Emergency Preparedness (tiered)
// 11 = Risk Concerns
// 12 = Social Capital
const TOTAL_STEPS = 13;
const MR_STEP = 3;

const CURRENCIES = [
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
  { code: "AUD", label: "A$ AUD" },
  { code: "CAD", label: "CA$ CAD" },
  { code: "JPY", label: "¥ JPY" },
  { code: "INR", label: "₹ INR" },
  { code: "BRL", label: "R$ BRL" },
  { code: "OTHER", label: "Other" },
];

const STEPS = [
  { title: "Where are you based?",         subtitle: "Your location affects climate, political, and economic risk factors." },
  { title: "What's your age bracket?",     subtitle: "Age affects how we weight your financial and health scores." },
  { title: "Income stability?",            subtitle: "How consistent and secure is your main income source?" },
  { title: "Mental resilience",            subtitle: "Rate how accurately each statement describes you." },
  { title: "How long without income?",      subtitle: "If income stopped today, how long could you sustain yourself and your household without debt? This is one of the strongest predictors of crisis resilience." },
  { title: "How many dependents?",          subtitle: "Children, elderly parents, or others financially or physically reliant on you." },
  { title: "Practical skills?",            subtitle: "Select all skills you actively possess." },
  { title: "Health?",                      subtitle: "Your health status and any conditions that affect daily functioning." },
  { title: "Mobility & relocation?",       subtitle: "Your physical capability and flexibility to relocate are key factors in crisis response." },
  { title: "Housing situation?",           subtitle: "Your housing affects both financial stability and your ability to shelter-in-place." },
  { title: "Emergency preparedness?",      subtitle: "How much food, water, and essential medicines do you have readily available?" },
  { title: "Primary risk concerns?",       subtitle: "Select the risks you feel least prepared for." },
  { title: "Community & social network?",  subtitle: "Strong networks are often the most reliable resource in a crisis. Help me understand yours." },
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
  const [mrSubStep, setMrSubStep] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const progress = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;

  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [data, setData] = useState<AssessmentData>({
    location: "",
    currency: "USD",
    customCurrency: "",
    ageBracket: undefined,
    incomeStability: "fixed",
    savingsMonths: 3,
    savingsPreferNotToSay: false,
    incomePreferNotToSay: false,
    dependentCount: 0,
    relocationReadiness: undefined,
    skills: [],
    healthStatus: "good",
    chronicCondition: undefined,
    mobilityLevel: "medium",
    housingType: "rent",
    emergencySupplyTier: undefined,
    psychologicalResilience: 7,
    riskConcerns: [],
    trustedLocalContacts: undefined,
    communityInvolvement: undefined,
    mutualAidAccess: undefined,
    mentalResilienceAnswers: { ...DEFAULT_MR_ANSWERS },
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const FREE_LIMIT = 3;

  const animateProgress = (nextStep: number, subOffset = 0) => {
    const total = (TOTAL_STEPS - 1) + MR_QUESTIONS.length;
    const current = nextStep < MR_STEP
      ? nextStep
      : nextStep === MR_STEP
        ? (MR_STEP) + subOffset
        : (MR_STEP) + MR_QUESTIONS.length + (nextStep - MR_STEP - 1);
    Animated.spring(progress, {
      toValue: Math.min((current + 1) / total, 1),
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const handleUseMyLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationLoading(false);
        setLocationDenied(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode.length > 0) {
        const g = geocode[0];
        const city = g.city || g.district || g.region || "";
        const country = g.country || "";
        const locationStr = city && country ? `${city}, ${country}` : country || city;
        if (locationStr) update("location", locationStr);
      }
    } catch {
      // silently ignore errors
    } finally {
      setLocationLoading(false);
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (step === MR_STEP) {
      if (mrSubStep < MR_QUESTIONS.length - 1) {
        const next = mrSubStep + 1;
        setMrSubStep(next);
        animateProgress(MR_STEP, next);
      } else {
        const next = MR_STEP + 1;
        setStep(next);
        animateProgress(next);
      }
      return;
    }

    if (step === TOTAL_STEPS - 1) {
      handleSubmit();
      return;
    }

    const next = step + 1;
    setStep(next);
    animateProgress(next);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (step === MR_STEP && mrSubStep > 0) {
      const prev = mrSubStep - 1;
      setMrSubStep(prev);
      animateProgress(MR_STEP, prev);
      return;
    }

    if (step > 0) {
      const prev = step - 1;
      setStep(prev);
      if (prev === MR_STEP) setMrSubStep(MR_QUESTIONS.length - 1);
      animateProgress(prev);
    } else {
      router.back();
    }
  };

  const update = <K extends keyof AssessmentData>(key: K, value: AssessmentData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const setMrAnswer = (key: string, value: number) => {
    Haptics.selectionAsync();
    setData((prev) => ({
      ...prev,
      mentalResilienceAnswers: { ...prev.mentalResilienceAnswers, [key]: value },
    }));
  };

  const toggleSkill = (skill: string) => {
    Haptics.selectionAsync();
    setData((prev) => {
      const cur = prev.skills;
      if (skill === "none") {
        return { ...prev, skills: cur.includes("none") ? [] : ["none"] };
      }
      if (cur.includes(skill)) return { ...prev, skills: cur.filter((s) => s !== skill) };
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
    if (step === 1) return !!data.ageBracket;
    if (step === 2) return true;
    if (step === MR_STEP) return true;
    if (step === 6) return data.skills.length > 0;
    if (step === 10) return !!data.emergencySupplyTier;
    if (step === 11) return data.riskConcerns.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    const finalCurrency = data.currency === "OTHER" ? (data.customCurrency || "USD") : data.currency;
    router.replace({
      pathname: "/loading",
      params: {
        assessmentData: JSON.stringify({
          ...data,
          currency: finalCurrency,
          sessionId,
          savingsMonths: data.savingsPreferNotToSay ? 3 : data.savingsMonths,
          incomeStability: data.incomePreferNotToSay ? "freelance" : data.incomeStability,
        }),
      },
    });
  };

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const currentStep = STEPS[step];
  const currentMrQ = MR_QUESTIONS[mrSubStep];
  const currentMrAnswer = data.mentalResilienceAnswers[currentMrQ?.key];

  const stepLabel = `${step + 1} / ${TOTAL_STEPS}`;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12} testID="back-btn">
          <Feather name={step === 0 && mrSubStep === 0 ? "x" : "arrow-left"} size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.stepCounter}>{stepLabel}</Text>
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

        {/* ── STEP 3: MENTAL RESILIENCE DEEP ASSESSMENT ── */}
        {step === MR_STEP ? (
          <View style={styles.mrContainer}>
            <Text style={styles.mrDimension}>{currentMrQ.dimension}</Text>
            <Text style={styles.mrSubCounter}>Question {mrSubStep + 1} of {MR_QUESTIONS.length}</Text>
            <Text style={styles.mrQuestion}>{currentMrQ.question}</Text>

            <View style={styles.mrRating}>
              {[1, 2, 3, 4, 5].map((val) => (
                <Pressable
                  key={val}
                  onPress={() => setMrAnswer(currentMrQ.key, val)}
                  style={[styles.mrBtn, currentMrAnswer === val && styles.mrBtnSelected]}
                >
                  <Text style={[styles.mrBtnNum, currentMrAnswer === val && styles.mrBtnNumSelected]}>
                    {val}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.mrScale}>
              <Text style={styles.mrScaleLabel}>Rarely</Text>
              <Text style={styles.mrScaleLabel}>Neutral</Text>
              <Text style={styles.mrScaleLabel}>Almost always</Text>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>

            {/* ── STEP 0: LOCATION + CURRENCY ── */}
            {step === 0 && (
              <>
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
                <Pressable
                  onPress={handleUseMyLocation}
                  disabled={locationLoading}
                  style={({ pressed }) => [styles.geoBtn, pressed && { opacity: 0.7 }]}
                >
                  <Feather name="map-pin" size={16} color={colors.primary} />
                  <Text style={styles.geoBtnText}>
                    {locationLoading ? "Detecting…" : "Use my location"}
                  </Text>
                </Pressable>
                {locationDenied && (
                  <Text style={[styles.preferNotDesc, { color: colors.warning ?? colors.textMuted }]}>
                    Location access was denied — please type your city or region above.
                  </Text>
                )}

                <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Preferred currency</Text>
                <View style={styles.currencyGrid}>
                  {CURRENCIES.map((c) => (
                    <Pressable
                      key={c.code}
                      onPress={() => { Haptics.selectionAsync(); update("currency", c.code); }}
                      style={[styles.currencyBtn, data.currency === c.code && styles.currencyBtnSelected]}
                    >
                      <Text style={[styles.currencyBtnText, data.currency === c.code && styles.currencyBtnTextSelected]}>
                        {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {data.currency === "OTHER" && (
                  <TextInput
                    style={[styles.textInput, { marginTop: 8, height: 44 }]}
                    value={data.customCurrency}
                    onChangeText={(v) => update("customCurrency", v.toUpperCase())}
                    placeholder="Currency code (e.g. CHF, SEK)"
                    placeholderTextColor={colors.textMuted}
                    maxLength={5}
                    autoCapitalize="characters"
                  />
                )}
              </>
            )}

            {/* ── STEP 1: AGE BRACKET ── */}
            {step === 1 && (
              <View style={styles.chipGrid}>
                {([
                  { id: "18-24", label: "18–24", desc: "Early career" },
                  { id: "25-34", label: "25–34", desc: "Building phase" },
                  { id: "35-44", label: "35–44", desc: "Established" },
                  { id: "45-54", label: "45–54", desc: "Peak earning" },
                  { id: "55-64", label: "55–64", desc: "Pre-retirement" },
                  { id: "65+",   label: "65+",   desc: "Retirement age" },
                ]).map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => { Haptics.selectionAsync(); update("ageBracket", opt.id); }}
                    style={[styles.ageChip, data.ageBracket === opt.id && styles.ageChipSelected]}
                  >
                    <Text style={[styles.ageChipLabel, data.ageBracket === opt.id && styles.ageChipLabelSelected]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.ageChipDesc}>{opt.desc}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* ── STEP 2: INCOME STABILITY ── */}
            {step === 2 && (
              <View style={styles.optionList}>
                {([
                  { id: "fixed", label: "Fixed & Secure", desc: "Salaried, guaranteed pension" },
                  { id: "freelance", label: "Variable / Freelance", desc: "Fluctuates month to month" },
                  { id: "unstable", label: "Unstable / Irregular", desc: "Unemployed or highly volatile" },
                  { id: "student", label: "Student / No income", desc: "Full-time student or not currently earning" },
                ] as const).map((opt) => (
                  <OptionCard
                    key={opt.id}
                    styles={styles}
                    selected={data.incomeStability === opt.id && !data.incomePreferNotToSay}
                    onPress={() => { Haptics.selectionAsync(); update("incomeStability", opt.id); update("incomePreferNotToSay", false); }}
                  >
                    <View style={styles.optionCardInner}>
                      <View style={styles.optionCardText}>
                        <Text style={[styles.optionLabel, data.incomeStability === opt.id && !data.incomePreferNotToSay && styles.optionLabelSelected]}>{opt.label}</Text>
                        <Text style={styles.optionDesc}>{opt.desc}</Text>
                      </View>
                      {data.incomeStability === opt.id && !data.incomePreferNotToSay && (
                        <Feather name="check-circle" size={20} color={colors.primary} />
                      )}
                    </View>
                  </OptionCard>
                ))}
                <Pressable
                  onPress={() => { Haptics.selectionAsync(); update("incomePreferNotToSay", !data.incomePreferNotToSay); update("incomeStability", "freelance"); }}
                  style={[styles.preferNotCard, data.incomePreferNotToSay && styles.preferNotCardSelected]}
                >
                  <Text style={[styles.preferNotLabel, data.incomePreferNotToSay && styles.preferNotLabelSelected]}>
                    {data.incomePreferNotToSay ? "✓ Prefer not to say" : "Prefer not to say"}
                  </Text>
                  <Text style={styles.preferNotDesc}>Your answers remain private — won't block your results</Text>
                </Pressable>
              </View>
            )}

            {/* ── STEP 4: FINANCIAL RUNWAY ── */}
            {step === 4 && (
              <View style={styles.section}>
                {!data.savingsPreferNotToSay ? (
                  <SliderControl
                    styles={styles}
                    value={data.savingsMonths}
                    min={0}
                    max={36}
                    onChange={(v) => update("savingsMonths", v)}
                    formatValue={(v) => v === 36 ? "36+ months" : v === 1 ? "1 month" : `${v} months`}
                  />
                ) : (
                  <View style={{ paddingVertical: 24, alignItems: "center" }}>
                    <Text style={[styles.optionDesc, { textAlign: "center", fontSize: 14 }]}>
                      We'll use a neutral estimate for your financial runway.
                    </Text>
                  </View>
                )}
                <Pressable
                  onPress={() => { Haptics.selectionAsync(); update("savingsPreferNotToSay", !data.savingsPreferNotToSay); }}
                  style={[styles.preferNotCard, data.savingsPreferNotToSay && styles.preferNotCardSelected]}
                >
                  <Text style={[styles.preferNotLabel, data.savingsPreferNotToSay && styles.preferNotLabelSelected]}>
                    {data.savingsPreferNotToSay ? "✓ Prefer not to say" : "Prefer not to say"}
                  </Text>
                  <Text style={styles.preferNotDesc}>Skip the slider — we'll use a neutral mid-range value</Text>
                </Pressable>
              </View>
            )}

            {/* ── STEP 5: DEPENDENTS ── */}
            {step === 5 && (
              <View style={styles.optionList}>
                {([
                  { value: 0, label: "None", desc: "No dependents", icon: "user" },
                  { value: 1, label: "One", desc: "One dependent", icon: "user-plus" },
                  { value: 2, label: "Two or three", desc: "2–3 dependents", icon: "users" },
                  { value: 3, label: "Four or more", desc: "4+ dependents", icon: "users" },
                ] as const).map((opt) => {
                  const selected = data.dependentCount === opt.value;
                  return (
                    <OptionCard key={opt.value} styles={styles} selected={selected} onPress={() => { Haptics.selectionAsync(); update("dependentCount", opt.value); }}>
                      <View style={styles.optionCardInner}>
                        <View style={styles.optionCardText}>
                          <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{opt.label}</Text>
                          <Text style={styles.optionDesc}>{opt.desc}</Text>
                        </View>
                        {selected && <Feather name="check-circle" size={20} color={colors.primary} />}
                      </View>
                    </OptionCard>
                  );
                })}
              </View>
            )}

            {/* ── STEP 6: SKILLS ── */}
            {step === 6 && (
              <View style={styles.chipGrid}>
                {[
                  { id: "digital", label: "Digital / Tech" },
                  { id: "physical", label: "Trade / Manual" },
                  { id: "survival", label: "Outdoors / Survival" },
                  { id: "medical", label: "First Aid / Medical" },
                  { id: "financial", label: "Trading / Finance" },
                  { id: "language", label: "Multiple Languages" },
                  { id: "caregiving", label: "Caregiving" },
                  { id: "agriculture", label: "Agriculture / Homesteading" },
                  { id: "community", label: "Community Organizing" },
                  { id: "teaching", label: "Education / Teaching" },
                  { id: "none", label: "None that apply" },
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

            {/* ── STEP 7: HEALTH ── */}
            {step === 7 && (
              <View style={styles.section}>
                <Text style={styles.subSectionTitle}>Overall Health Status</Text>
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

                <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Chronic Condition or Disability</Text>
                <Text style={styles.subSectionDesc}>Do you have a chronic condition or disability that affects your daily functioning? (Optional)</Text>
                <View style={styles.segmentRow}>
                  {([
                    { id: "no", label: "No" },
                    { id: "yes", label: "Yes" },
                    { id: "prefer_not_to_say", label: "Prefer not to say" },
                  ] as const).map((opt) => (
                    <Pressable
                      key={opt.id}
                      onPress={() => { Haptics.selectionAsync(); update("chronicCondition", opt.id); }}
                      style={[styles.segment, data.chronicCondition === opt.id && styles.segmentSelected]}
                    >
                      <Text style={[styles.segmentText, data.chronicCondition === opt.id && styles.segmentTextSelected]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* ── STEP 8: MOBILITY & RELOCATION ── */}
            {step === 8 && (
              <View style={styles.section}>
                <Text style={styles.subSectionTitle}>Physical Capability</Text>
                <Text style={styles.subSectionDesc}>How physically capable are you of handling demanding situations?</Text>
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

                <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Relocation Readiness</Text>
                <Text style={styles.subSectionDesc}>How quickly could you pack up and relocate if needed?</Text>
                <View style={styles.optionList}>
                  {([
                    { id: "immediate", label: "Immediately", desc: "Could leave within days" },
                    { id: "within_month", label: "Within a month", desc: "Need a few weeks to prepare" },
                    { id: "within_3months", label: "Within 3 months", desc: "Need time to sort things out" },
                    { id: "difficult", label: "Very difficult", desc: "Tied down for the foreseeable future" },
                  ] as const).map((opt) => {
                    const selected = data.relocationReadiness === opt.id;
                    return (
                      <OptionCard key={opt.id} styles={styles} selected={selected} onPress={() => { Haptics.selectionAsync(); update("relocationReadiness", opt.id); }}>
                        <View style={styles.optionCardInner}>
                          <View style={styles.optionCardText}>
                            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{opt.label}</Text>
                            <Text style={styles.optionDesc}>{opt.desc}</Text>
                          </View>
                          {selected && <Feather name="check-circle" size={20} color={colors.primary} />}
                        </View>
                      </OptionCard>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── STEP 9: HOUSING ── */}
            {step === 9 && (
              <View style={styles.optionList}>
                {[
                  { id: "own", label: "Own a home", desc: "Mortgage or outright ownership" },
                  { id: "rent", label: "Renting", desc: "Long-term rental agreement" },
                  { id: "family", label: "Living with family", desc: "With parents or relatives" },
                  { id: "temporary", label: "Temporary/Subsidised housing", desc: "Short-term or government-assisted" },
                  { id: "transitional", label: "Transitional housing or shelter", desc: "Crisis accommodation or shelter" },
                  { id: "nomadic", label: "Nomadic", desc: "Frequent traveler, no fixed base" },
                  { id: "other", label: "Other", desc: "Any other arrangement" },
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

            {/* ── STEP 10: EMERGENCY SUPPLIES (TIERED) ── */}
            {step === 10 && (
              <View style={styles.optionList}>
                {([
                  { id: "none", label: "None", desc: "Not prepared yet" },
                  { id: "under_3days", label: "Under 3 days", desc: "Very basic supplies only" },
                  { id: "3_14days", label: "3–14 days", desc: "A couple of weeks covered" },
                  { id: "2weeks_1month", label: "2 weeks – 1 month", desc: "Well stocked for most crises" },
                  { id: "over_1month", label: "1 month +", desc: "Extended preparedness" },
                ] as const).map((opt) => {
                  const selected = data.emergencySupplyTier === opt.id;
                  return (
                    <OptionCard key={opt.id} styles={styles} selected={selected} onPress={() => { Haptics.selectionAsync(); update("emergencySupplyTier", opt.id); }}>
                      <View style={styles.optionCardInner}>
                        <View style={styles.optionCardText}>
                          <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{opt.label}</Text>
                          <Text style={styles.optionDesc}>{opt.desc}</Text>
                        </View>
                        {selected && <Feather name="check-circle" size={20} color={colors.primary} />}
                      </View>
                    </OptionCard>
                  );
                })}
              </View>
            )}

            {/* ── STEP 11: RISK CONCERNS ── */}
            {step === 11 && (
              <View style={styles.chipGrid}>
                {[
                  { id: "job_loss", label: "Job Loss" },
                  { id: "inflation", label: "Hyperinflation" },
                  { id: "financial_crisis", label: "Market Crash" },
                  { id: "natural_disaster", label: "Natural Disaster" },
                  { id: "supply_chain", label: "Supply Chain" },
                  { id: "political_instability", label: "Political Unrest" },
                  { id: "cyber_attack", label: "Cyber Attack" },
                  { id: "grid_failure", label: "Power Grid Failure" },
                  { id: "war_conflict", label: "War / Conflict" },
                  { id: "pandemic", label: "Pandemic" },
                  { id: "illness", label: "Personal Illness" },
                ].map((r) => {
                  const selected = data.riskConcerns.includes(r.id);
                  const isTraumaAdjacent = r.id === "war_conflict" || r.id === "illness";
                  return (
                    <View key={r.id} style={{ width: "47%" }}>
                      <Pressable
                        onPress={() => toggleRisk(r.id)}
                        style={[styles.chip, styles.riskChip, selected && styles.chipSelectedDanger]}
                      >
                        <Text style={[styles.chipText, selected && styles.chipTextDanger]}>
                          {r.label}
                        </Text>
                      </Pressable>
                      {selected && isTraumaAdjacent && (
                        <Text style={styles.traumaNote}>
                          We understand this may be personal. Your answers shape a plan that takes this seriously.
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* ── STEP 12: SOCIAL CAPITAL ── */}
            {step === 12 && (
              <View style={styles.section}>
                <Text style={styles.subSectionTitle}>Trusted contacts in a crisis</Text>
                <Text style={styles.subSectionDesc}>People locally or abroad who would genuinely help you — family, friends, colleagues, or community.</Text>
                <View style={styles.optionList}>
                  {([
                    { value: 0, label: "None", desc: "No one I could reliably call on" },
                    { value: 1, label: "1–2 people", desc: "A handful of trusted people" },
                    { value: 2, label: "3–5 people", desc: "A solid support circle" },
                    { value: 3, label: "6 or more", desc: "A broad, reliable network" },
                  ] as const).map((opt) => {
                    const selected = data.trustedLocalContacts === opt.value;
                    return (
                      <OptionCard key={opt.value} styles={styles} selected={selected} onPress={() => { Haptics.selectionAsync(); update("trustedLocalContacts", opt.value); }}>
                        <View style={styles.optionCardInner}>
                          <View style={styles.optionCardText}>
                            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{opt.label}</Text>
                            <Text style={styles.optionDesc}>{opt.desc}</Text>
                          </View>
                          {selected && <Feather name="check-circle" size={20} color={colors.primary} />}
                        </View>
                      </OptionCard>
                    );
                  })}
                </View>

                <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Community involvement</Text>
                <Text style={styles.subSectionDesc}>Religious groups, community support networks, volunteer organizations, professional associations, etc.</Text>
                <View style={styles.segmentRow}>
                  {([
                    { id: "none", label: "None" },
                    { id: "occasional", label: "Occasionally" },
                    { id: "active", label: "Actively" },
                  ] as const).map((opt) => (
                    <Pressable
                      key={opt.id}
                      onPress={() => { Haptics.selectionAsync(); update("communityInvolvement", opt.id); }}
                      style={[styles.segment, data.communityInvolvement === opt.id && styles.segmentSelected]}
                    >
                      <Text style={[styles.segmentText, data.communityInvolvement === opt.id && styles.segmentTextSelected]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Community support access</Text>
                <Text style={styles.subSectionDesc}>Could you access food, shelter, tools, or practical help from your community or network if needed?</Text>
                <View style={styles.yesNoGrid}>
                  {([
                    { val: true, label: "Yes", desc: "I could access support" },
                    { val: false, label: "Not sure", desc: "No / uncertain" },
                  ] as const).map((opt) => {
                    const selected = data.mutualAidAccess === opt.val;
                    return (
                      <OptionCard key={String(opt.val)} styles={styles} selected={selected} onPress={() => { Haptics.selectionAsync(); update("mutualAidAccess", opt.val); }}>
                        <View style={styles.yesNoCard}>
                          <Feather name={opt.val ? "users" : "user-x"} size={28} color={selected ? colors.primary : colors.textMuted} />
                          <Text style={[styles.yesNoLabel, selected && styles.yesNoLabelSelected]}>{opt.label}</Text>
                          <Text style={styles.yesNoDesc}>{opt.desc}</Text>
                        </View>
                      </OptionCard>
                    );
                  })}
                </View>
              </View>
            )}
          </>
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
            {step === TOTAL_STEPS - 1
              ? "Generate Report"
              : step === MR_STEP && mrSubStep < MR_QUESTIONS.length - 1
              ? "Next Question"
              : step === MR_STEP && mrSubStep === MR_QUESTIONS.length - 1
              ? "Continue"
              : "Continue"}
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
  // ── Age bracket chips ──
  ageChip: {
    width: "47%",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
  },
  ageChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  ageChipLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: colors.textSecondary,
  },
  ageChipLabelSelected: { color: colors.primary },
  ageChipDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  // ── Currency grid ──
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  currencyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  currencyBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  currencyBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.textSecondary,
  },
  currencyBtnTextSelected: {
    color: colors.primary,
  },
  // ── Geolocation button ──
  geoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignSelf: "flex-start",
  },
  geoBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: colors.primary,
  },
  // ── Prefer not to say ──
  preferNotCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  preferNotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
    borderStyle: "solid",
  },
  preferNotLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.textSecondary,
  },
  preferNotLabelSelected: { color: colors.primary },
  preferNotDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  // ── Trauma note ──
  traumaNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    paddingHorizontal: 4,
    lineHeight: 16,
  },
  // ── Mental Resilience ──
  mrContainer: {
    gap: 20,
  },
  mrBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primaryMuted,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: 8,
  },
  mrBannerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: colors.primary,
  },
  mrBannerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  mrDimension: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  mrSubCounter: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 4,
  },
  mrQuestion: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  mrDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  mrDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  mrDotActive: {
    backgroundColor: colors.primary,
    width: 18,
    borderRadius: 3,
  },
  mrDotDone: {
    backgroundColor: colors.primaryBorder,
  },
  mrRating: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  mrBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  mrBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  mrBtnNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: colors.textSecondary,
  },
  mrBtnNumSelected: {
    color: colors.background,
  },
  mrScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -8,
  },
  mrScaleLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.textMuted,
  },
  // ── Shared ──
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
  optionCardPressed: { opacity: 0.8 },
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
  optionLabelSelected: { color: colors.primary },
  optionDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  yesNoGrid: { flexDirection: "row", gap: 12 },
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
  yesNoLabelSelected: { color: colors.primary },
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
  segmentRow: { flexDirection: "row", gap: 8 },
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
  segmentTextSelected: { color: colors.primary },
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
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipTextSelected: { color: colors.primary },
  chipTextDanger: { color: colors.danger },
  sliderValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sliderRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  sliderTick: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTickSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  sliderTickText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: colors.textSecondary,
  },
  sliderTickTextSelected: { color: colors.primary },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextBtnPressed: { opacity: 0.85 },
  nextBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: colors.background,
  },
});
