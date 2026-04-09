import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { NeuralNetSVG } from "./NeuralNetSVG";

const ND = Platform.OS !== "web";

const { width: W, height: H } = Dimensions.get("window");

const BRAND      = "#E08040";
const BRAND_GLOW = "rgba(224,128,64,0.16)";
const BRAND_MID  = "rgba(224,128,64,0.28)";
const BG         = "#0D1225";

// Ring geometry — sized to frame the logo
const RING_R   = 72;          // inner ring radius
const RING_SZ  = RING_R * 2 + 8;
const RING2_R  = RING_R + 18; // outer ring radius
const RING2_SZ = RING2_R * 2 + 8;

interface Props {
  onDone: () => void;
}

export function AppLoadingScreen({ onDone }: Props) {
  const screenFade  = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.78)).current;
  const glowScale   = useRef(new Animated.Value(0.88)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;
  const ringRot     = useRef(new Animated.Value(0)).current;
  const ringRot2    = useRef(new Animated.Value(0)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordY       = useRef(new Animated.Value(14)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const dot1        = useRef(new Animated.Value(0.25)).current;
  const dot2        = useRef(new Animated.Value(0.25)).current;
  const dot3        = useRef(new Animated.Value(0.25)).current;
  const netOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(screenFade,  { toValue: 1, duration: 380, useNativeDriver: ND }).start();
    Animated.timing(netOpacity,  { toValue: 1, duration: 700, useNativeDriver: ND }).start();

    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 620, delay: 160, useNativeDriver: ND }),
      Animated.spring(logoScale,   { toValue: 1, delay: 160, tension: 55, friction: 9, useNativeDriver: ND }),
    ]).start();

    Animated.parallel([
      Animated.timing(wordOpacity, { toValue: 1, duration: 520, delay: 540, useNativeDriver: ND }),
      Animated.timing(wordY,       { toValue: 0, duration: 520, delay: 540, useNativeDriver: ND }),
    ]).start();

    Animated.timing(tagOpacity, { toValue: 1, duration: 480, delay: 900, useNativeDriver: ND }).start();

    // Pulsing glow
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale,   { toValue: 1.14, duration: 2600, useNativeDriver: ND }),
          Animated.timing(glowOpacity, { toValue: 0.9,  duration: 2600, useNativeDriver: ND }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale,   { toValue: 0.88, duration: 2600, useNativeDriver: ND }),
          Animated.timing(glowOpacity, { toValue: 0.5,  duration: 2600, useNativeDriver: ND }),
        ]),
      ])
    );
    glowAnim.start();

    // Rotating dashed rings
    const ring1Anim = Animated.loop(
      Animated.timing(ringRot,  { toValue: 1, duration: 7000, useNativeDriver: ND })
    );
    ring1Anim.start();
    const ring2Anim = Animated.loop(
      Animated.timing(ringRot2, { toValue: -1, duration: 11000, useNativeDriver: ND })
    );
    ring2Anim.start();

    // Loading dots
    const dotAnim = Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(dot1, { toValue: 1,    duration: 260, useNativeDriver: ND }),
        Animated.timing(dot1, { toValue: 0.25, duration: 260, useNativeDriver: ND }),
        Animated.timing(dot2, { toValue: 1,    duration: 260, useNativeDriver: ND }),
        Animated.timing(dot2, { toValue: 0.25, duration: 260, useNativeDriver: ND }),
        Animated.timing(dot3, { toValue: 1,    duration: 260, useNativeDriver: ND }),
        Animated.timing(dot3, { toValue: 0.25, duration: 260, useNativeDriver: ND }),
        Animated.delay(400),
      ])
    );
    dotAnim.start();

    const dismiss = setTimeout(() => {
      Animated.timing(screenFade, { toValue: 0, duration: 460, useNativeDriver: ND }).start(() => {
        glowAnim.stop();
        ring1Anim.stop();
        ring2Anim.stop();
        dotAnim.stop();
        onDone();
      });
    }, 4800);

    return () => {
      clearTimeout(dismiss);
      glowAnim.stop();
      ring1Anim.stop();
      ring2Anim.stop();
      dotAnim.stop();
    };
  }, []);

  const ring1Deg = ringRot.interpolate({
    inputRange: [0, 1], outputRange: ["0deg", "360deg"],
  });
  const ring2Deg = ringRot2.interpolate({
    inputRange: [-1, 0], outputRange: ["-360deg", "0deg"],
  });

  return (
    <Animated.View style={[s.root, { opacity: screenFade }]}>
      {/* Neural network background */}
      <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity: netOpacity }}>
        <NeuralNetSVG width={W} height={H} opacity={0.52} particleCount={38} />
      </Animated.View>

      {/* Ambient glow */}
      <Animated.View
        style={[s.glowOuter, { transform: [{ scale: glowScale }], opacity: glowOpacity, pointerEvents: "none" }]}
      />
      <View style={[s.glowInner, { pointerEvents: "none" }]} />

      <View style={s.center}>
        {/* Icon area: logo centered inside the two dashed rings */}
        <View style={s.iconArea}>
          {/* Inner dashed ring — rotates clockwise */}
          <Animated.View style={[s.ringWrap, { transform: [{ rotate: ring1Deg }] }]}>
            <Svg width={RING_SZ} height={RING_SZ}>
              <Circle
                cx={RING_SZ / 2} cy={RING_SZ / 2}
                r={RING_R}
                stroke={BRAND}
                strokeWidth={1.2}
                strokeDasharray="14 6"
                fill="none"
                opacity={0.55}
              />
            </Svg>
          </Animated.View>

          {/* Outer dashed ring — rotates counter-clockwise */}
          <Animated.View style={[s.ringWrap, s.ringWrapOuter, { transform: [{ rotate: ring2Deg }] }]}>
            <Svg width={RING2_SZ} height={RING2_SZ}>
              <Circle
                cx={RING2_SZ / 2} cy={RING2_SZ / 2}
                r={RING2_R}
                stroke={BRAND}
                strokeWidth={0.7}
                strokeDasharray="6 10"
                fill="none"
                opacity={0.28}
              />
            </Svg>
          </Animated.View>

          {/* Logo — with soft vignette at all four edges */}
          <Animated.View
            style={[s.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
          >
            <Image
              source={require("../assets/images/brain-logo.png")}
              style={s.logoImage}
              resizeMode="contain"
            />
            {/* Vignette overlays — fade the rectangular edges into the dark background */}
            <LinearGradient colors={[BG, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.vigLeft}   pointerEvents="none" />
            <LinearGradient colors={["transparent", BG]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.vigRight}  pointerEvents="none" />
            <LinearGradient colors={[BG, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.vigTop}    pointerEvents="none" />
            <LinearGradient colors={["transparent", BG]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.vigBottom} pointerEvents="none" />
          </Animated.View>
        </View>

        {/* Wordmark */}
        <Animated.Text
          style={[s.wordmark, { opacity: wordOpacity, transform: [{ translateY: wordY }] }]}
        >
          RESILIUM
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[s.tagline, { opacity: tagOpacity }]}>
          Your Personal Resilience Platform
        </Animated.Text>

        {/* Loading dots */}
        <View style={s.dotsRow}>
          <Animated.View style={[s.dot, { opacity: dot1 }]} />
          <Animated.View style={[s.dot, { opacity: dot2 }]} />
          <Animated.View style={[s.dot, { opacity: dot3 }]} />
        </View>
      </View>

      {/* Footer */}
      <Animated.Text style={[s.footer, { opacity: tagOpacity }]}>
        Built for what matters most
      </Animated.Text>
    </Animated.View>
  );
}

const OFFSET = (RING2_SZ - RING_SZ) / 2; // centering offset for outer ring

const s = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    width: W, height: H,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  glowOuter: {
    position: "absolute",
    width: 360, height: 360, borderRadius: 180,
    backgroundColor: BRAND_GLOW,
    alignSelf: "center",
    top: H / 2 - 180,
  },
  glowInner: {
    position: "absolute",
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: BRAND_MID,
    alignSelf: "center",
    top: H / 2 - 100,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconArea: {
    width: RING2_SZ,
    height: RING2_SZ,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  // Inner ring — positioned from top-left of iconArea
  ringWrap: {
    position: "absolute",
    top: OFFSET,
    left: OFFSET,
  },
  // Outer ring — fills the full iconArea
  ringWrapOuter: {
    top: 0,
    left: 0,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 108,
    height: 86,
  },
  vigLeft: {
    position: "absolute",
    top: 0, bottom: 0, left: 0,
    width: 28,
  },
  vigRight: {
    position: "absolute",
    top: 0, bottom: 0, right: 0,
    width: 28,
  },
  vigTop: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 22,
  },
  vigBottom: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 22,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: "700",
    color: "#EAD9BE",
    letterSpacing: 7,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 13,
    color: "rgba(176,168,144,0.75)",
    letterSpacing: 0.3,
    marginBottom: 36,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: BRAND,
  },
  footer: {
    position: "absolute",
    bottom: 52,
    fontSize: 11,
    color: "rgba(106,96,112,0.85)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
