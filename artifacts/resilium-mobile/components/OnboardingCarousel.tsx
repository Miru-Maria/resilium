import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const ONBOARDING_KEY = "resilium_onboarded_mobile_v1";

const C = {
  bg: "#0D1225",
  surface: "#141B30",
  border: "#252E4A",
  primary: "#E08040",
  text: "#F0EBE3",
  text2: "#A09880",
  text3: "#6A6070",
  success: "#34D399",
};

type Slide = {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  accent: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: { icon: keyof typeof Feather.glyphMap; label: string }[];
};

const SLIDES: Slide[] = [
  {
    key: "what",
    icon: "shield",
    accent: C.primary,
    eyebrow: "WHAT IS RESILIUM?",
    title: "Know your real\nvulnerabilities",
    subtitle: "Most people don't know how resilient they actually are — until a crisis hits. Resilium measures it across 6 life dimensions.",
    bullets: [
      { icon: "dollar-sign", label: "Financial stability" },
      { icon: "heart", label: "Health continuity" },
      { icon: "tool", label: "Skills & adaptability" },
      { icon: "map-pin", label: "Mobility & relocation" },
      { icon: "activity", label: "Psychological resilience" },
      { icon: "package", label: "Emergency resources" },
    ],
  },
  {
    key: "assess",
    icon: "cpu",
    accent: "#60A5FA",
    eyebrow: "TAKE YOUR ASSESSMENT",
    title: "14 steps.\nYour AI report.",
    subtitle: "Answer honestly — the assessment takes 10–15 minutes. At the end, AI scores you across all 6 dimensions and generates a personalised resilience report.",
    bullets: [
      { icon: "clock", label: "~10 min to complete" },
      { icon: "bar-chart-2", label: "Scored across 6 dimensions" },
      { icon: "file-text", label: "AI-written resilience report" },
      { icon: "lock", label: "Private — your data stays yours" },
    ],
  },
  {
    key: "plan",
    icon: "trending-up",
    accent: C.success,
    eyebrow: "BUILD YOUR RESILIENCE",
    title: "A living plan\nthat grows with you.",
    subtitle: "Your report becomes a trackable action plan. Daily check-ins build your streak. Book coaching when you need more than a checklist.",
    bullets: [
      { icon: "check-circle", label: "Trackable action checklist" },
      { icon: "refresh-cw", label: "Daily check-ins & streak tracking" },
      { icon: "alert-triangle", label: "Stress-test life scenarios" },
      { icon: "user", label: "1-on-1 coaching available" },
    ],
  },
];

interface Props {
  onDismiss: () => void;
}

export function OnboardingCarousel({ onDismiss }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const dismiss = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "1");
    onDismiss();
  };

  const animateTo = (nextIndex: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex(nextIndex);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleSkip = () => dismiss();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      animateTo(currentIndex + 1);
    }
  };

  const handleStart = async () => {
    await dismiss();
    router.push("/assessment");
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const slide = SLIDES[currentIndex];

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Skip */}
        <Pressable style={styles.skipBtn} onPress={handleSkip} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        {/* Animated slide content */}
        <Animated.View
          style={[
            styles.slideWrapper,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SlideView slide={slide} />
        </Animated.View>

        {/* Dots + CTA */}
        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <Pressable key={i} onPress={() => i !== currentIndex && animateTo(i)}>
                <View
                  style={[
                    styles.dot,
                    {
                      width: i === currentIndex ? 22 : 8,
                      backgroundColor: i === currentIndex ? (slide?.accent ?? C.primary) : C.border,
                      opacity: i === currentIndex ? 1 : 0.5,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {isLast ? (
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.85 }]}
              onPress={handleStart}
            >
              <LinearGradient
                colors={["#E08040", "#C05820"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Start My Assessment</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.75 }]}
              onPress={handleNext}
            >
              <Text style={styles.nextText}>Next</Text>
              <Feather name="chevron-right" size={18} color={C.text2} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function SlideView({ slide }: { slide: Slide }) {
  return (
    <View style={styles.slide}>
      {/* Icon orb */}
      <View style={[styles.iconOrb, { backgroundColor: slide.accent + "22", borderColor: slide.accent + "44" }]}>
        <Feather name={slide.icon} size={32} color={slide.accent} />
      </View>

      {/* Eyebrow */}
      <Text style={[styles.eyebrow, { color: slide.accent }]}>{slide.eyebrow}</Text>

      {/* Title */}
      <Text style={styles.title}>{slide.title}</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>{slide.subtitle}</Text>

      {/* Bullets */}
      <View style={styles.bullets}>
        {slide.bullets.map((b, i) => (
          <View key={i} style={styles.bullet}>
            <View style={[styles.bulletIcon, { backgroundColor: slide.accent + "18" }]}>
              <Feather name={b.icon} size={13} color={slide.accent} />
            </View>
            <Text style={styles.bulletText}>{b.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export async function shouldShowOnboarding(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === null;
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: SCREEN_W - 32,
    maxHeight: SCREEN_H * 0.88,
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    paddingBottom: 28,
  },
  skipBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  skipText: {
    color: C.text2,
    fontSize: 13,
    fontWeight: "500",
  },
  slideWrapper: {
    flex: 1,
  },
  slide: {
    paddingTop: 52,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  iconOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: C.text,
    lineHeight: 33,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: C.text2,
    lineHeight: 21,
    marginBottom: 20,
  },
  bullets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
  },
  bulletIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  bulletText: {
    fontSize: 12.5,
    color: C.text2,
    fontWeight: "500",
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 16,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: C.border,
  },
  nextText: {
    color: C.text2,
    fontSize: 15,
    fontWeight: "600",
  },
});
