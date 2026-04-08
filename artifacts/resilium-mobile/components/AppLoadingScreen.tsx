import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { NeuralNetSVG } from "./NeuralNetSVG";

const ND = Platform.OS !== "web";

const { width: W, height: H } = Dimensions.get("window");

const BRAND = "#E08040";
const BRAND_GLOW = "rgba(224,128,64,0.18)";
const BRAND_GLOW_INNER = "rgba(224,128,64,0.30)";
const BG = "#0D1225";

interface Props {
  onDone: () => void;
}

export function AppLoadingScreen({ onDone }: Props) {
  const screenFade   = useRef(new Animated.Value(0)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.78)).current;
  const glowScale    = useRef(new Animated.Value(0.88)).current;
  const glowOpacity  = useRef(new Animated.Value(0.5)).current;
  const wordOpacity  = useRef(new Animated.Value(0)).current;
  const wordY        = useRef(new Animated.Value(14)).current;
  const tagOpacity   = useRef(new Animated.Value(0)).current;
  const dot1         = useRef(new Animated.Value(0.25)).current;
  const dot2         = useRef(new Animated.Value(0.25)).current;
  const dot3         = useRef(new Animated.Value(0.25)).current;
  const netOpacity   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in whole screen
    Animated.timing(screenFade, { toValue: 1, duration: 380, useNativeDriver: ND }).start();

    // Neural net fades in quickly
    Animated.timing(netOpacity, { toValue: 1, duration: 700, useNativeDriver: ND }).start();

    // Logo pops in
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 620, delay: 160, useNativeDriver: ND }),
      Animated.spring(logoScale,   { toValue: 1, delay: 160, tension: 55, friction: 9, useNativeDriver: ND }),
    ]).start();

    // Wordmark slides up
    Animated.parallel([
      Animated.timing(wordOpacity, { toValue: 1, duration: 520, delay: 540, useNativeDriver: ND }),
      Animated.timing(wordY,       { toValue: 0, duration: 520, delay: 540, useNativeDriver: ND }),
    ]).start();

    // Tagline
    Animated.timing(tagOpacity, { toValue: 1, duration: 480, delay: 900, useNativeDriver: ND }).start();

    // Ambient glow pulse
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

    // Loading dots
    const dotAnim = Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(dot1, { toValue: 1, duration: 260, useNativeDriver: ND }),
        Animated.timing(dot1, { toValue: 0.25, duration: 260, useNativeDriver: ND }),
        Animated.timing(dot2, { toValue: 1, duration: 260, useNativeDriver: ND }),
        Animated.timing(dot2, { toValue: 0.25, duration: 260, useNativeDriver: ND }),
        Animated.timing(dot3, { toValue: 1, duration: 260, useNativeDriver: ND }),
        Animated.timing(dot3, { toValue: 0.25, duration: 260, useNativeDriver: ND }),
        Animated.delay(400),
      ])
    );
    dotAnim.start();

    // Dismiss after 4.8s
    const dismiss = setTimeout(() => {
      Animated.timing(screenFade, { toValue: 0, duration: 460, useNativeDriver: ND }).start(() => {
        glowAnim.stop();
        dotAnim.stop();
        onDone();
      });
    }, 4800);

    return () => {
      clearTimeout(dismiss);
      glowAnim.stop();
      dotAnim.stop();
    };
  }, []);

  return (
    <Animated.View style={[s.root, { opacity: screenFade }]}>
      {/* Neural network — more prominent, fades in with the rest */}
      <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity: netOpacity }}>
        <NeuralNetSVG width={W} height={H} opacity={0.52} particleCount={38} />
      </Animated.View>

      {/* Ambient glow behind logo */}
      <Animated.View
        style={[s.glowOuter, { transform: [{ scale: glowScale }], opacity: glowOpacity }]}
        pointerEvents="none"
      />
      <View style={s.glowInner} pointerEvents="none" />

      <View style={s.center}>
        {/* Brain logo — clean rounded square, no spinning rings */}
        <Animated.View
          style={[s.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        >
          <Image
            source={require("../assets/images/brain-logo.png")}
            style={s.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

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

        {/* Loading indicator dots */}
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
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: BRAND_GLOW,
    alignSelf: "center",
    top: H / 2 - 180,
    pointerEvents: "none",
  },
  glowInner: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: BRAND_GLOW_INNER,
    alignSelf: "center",
    top: H / 2 - 90,
    pointerEvents: "none",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(224,128,64,0.38)",
    backgroundColor: "rgba(13,18,37,0.6)",
    padding: 10,
    marginBottom: 36,
    // Subtle shadow for depth
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  logoImage: {
    width: 112,
    height: 90,
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
    width: 5,
    height: 5,
    borderRadius: 2.5,
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
