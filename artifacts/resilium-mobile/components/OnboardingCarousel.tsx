import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const ONBOARDING_KEY = "resilium_onboarded_mobile_v1";

const MODAL_H = Math.min(Math.round(SCREEN_H * 0.84), 680);
const MODAL_W = SCREEN_W - 32;

const C = {
  bg: "#0D1225",
  surface: "#141B30",
  border: "#252E4A",
  primary: "#E08040",
  text: "#F0EBE3",
  text2: "#A09880",
  success: "#34D399",
};

type BulletItem = { icon: string; label: string };
type Slide = {
  key: string;
  icon: string;
  accent: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: BulletItem[];
};

const SLIDES: Slide[] = [
  {
    key: "what",
    icon: "shield",
    accent: C.primary,
    eyebrow: "WHAT IS RESILIUM?",
    title: "Know your real\nvulnerabilities",
    subtitle:
      "Most people don't know how resilient they actually are — until a crisis hits. Resilium measures it across 6 life dimensions.",
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
    subtitle:
      "Answer honestly — the assessment takes 10–15 minutes. AI scores you across all 6 dimensions and generates a personalised resilience report.",
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
    subtitle:
      "Your report becomes a trackable action plan. Daily check-ins build your streak. Book coaching when you need more than a checklist.",
    bullets: [
      { icon: "check-circle", label: "Trackable action checklist" },
      { icon: "refresh-cw", label: "Daily check-ins & streaks" },
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
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -16, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex(nextIndex);
      slideAnim.setValue(16);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  };

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
    <View style={s.overlay}>
      <View style={s.modal}>
        {/* Skip */}
        <Pressable style={s.skipBtn} onPress={dismiss} hitSlop={12}>
          <Text style={s.skipText}>Skip</Text>
        </Pressable>

        {/* Animated slide content */}
        <Animated.View
          style={[
            s.slideWrapper,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SlideView slide={slide} />
        </Animated.View>

        {/* Dots + CTA */}
        <View style={s.bottom}>
          {/* Progress dots */}
          <View style={s.dotsRow}>
            {SLIDES.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => i !== currentIndex && animateTo(i)}
                hitSlop={8}
              >
                <View
                  style={[
                    s.dot,
                    {
                      width: i === currentIndex ? 22 : 8,
                      backgroundColor:
                        i === currentIndex ? slide.accent : C.border,
                      opacity: i === currentIndex ? 1 : 0.5,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {isLast ? (
            <Pressable
              style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.85 }]}
              onPress={handleStart}
            >
              <LinearGradient
                colors={["#E08040", "#C05820"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.ctaGradient}
              >
                <Text style={s.ctaText}>Start My Assessment</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.75 }]}
              onPress={handleNext}
            >
              <Text style={s.nextText}>Next</Text>
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
    <ScrollView
      style={s.slideScroll}
      contentContainerStyle={s.slideContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Icon orb */}
      <View
        style={[
          s.iconOrb,
          {
            backgroundColor: slide.accent + "22",
            borderColor: slide.accent + "44",
          },
        ]}
      >
        <Feather name={slide.icon as any} size={32} color={slide.accent} />
      </View>

      {/* Eyebrow */}
      <Text style={[s.eyebrow, { color: slide.accent }]}>
        {slide.eyebrow}
      </Text>

      {/* Title */}
      <Text style={s.title}>{slide.title}</Text>

      {/* Subtitle */}
      <Text style={s.subtitle}>{slide.subtitle}</Text>

      {/* Bullets — 2-per-row grid using explicit widths */}
      <View style={s.bulletsGrid}>
        {slide.bullets.map((b, i) => (
          <View key={i} style={s.bullet}>
            <View
              style={[
                s.bulletIcon,
                { backgroundColor: slide.accent + "18" },
              ]}
            >
              <Feather name={b.icon as any} size={13} color={slide.accent} />
            </View>
            <Text style={s.bulletText} numberOfLines={1}>
              {b.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export async function shouldShowOnboarding(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === null;
}

const BULLET_W = (MODAL_W - 48 - 8) / 2;

const s = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: MODAL_W,
    height: MODAL_H,
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    flexDirection: "column",
  },
  skipBtn: {
    position: "absolute",
    top: 14,
    right: 18,
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
  slideScroll: {
    flex: 1,
  },
  slideContent: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  iconOrb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 9,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: C.text,
    lineHeight: 31,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: C.text2,
    lineHeight: 20,
    marginBottom: 18,
  },
  bulletsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bullet: {
    width: BULLET_W,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
    marginBottom: 8,
  },
  bulletIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: C.text2,
    fontWeight: "500",
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  ctaBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    marginRight: 4,
  },
});
