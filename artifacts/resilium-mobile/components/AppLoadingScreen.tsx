import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { NeuralNetSVG } from "./NeuralNetSVG";

const ND = Platform.OS !== "web";

const { width: W, height: H } = Dimensions.get("window");

const BRAND = "#E08040";
const BRAND_MID = "rgba(224,128,64,0.22)";
const BRAND_SOFT = "rgba(224,128,64,0.08)";
const BG = "#0D1225";
const BLUE_SOFT = "rgba(120,144,224,0.10)";

const RING_R = 62;
const RING_SIZE = RING_R * 2 + 8;

interface Props {
  onDone: () => void;
}

export function AppLoadingScreen({ onDone }: Props) {
  const screenFade = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(0.82)).current;
  const orbOpacity = useRef(new Animated.Value(0.55)).current;
  const innerOrbScale = useRef(new Animated.Value(0.9)).current;
  const innerOrbOpacity = useRef(new Animated.Value(0.7)).current;
  const ringRot = useRef(new Animated.Value(0)).current;
  const ringRot2 = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordY = useRef(new Animated.Value(12)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.25)).current;
  const dot2 = useRef(new Animated.Value(0.25)).current;
  const dot3 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    Animated.timing(screenFade, {
      toValue: 1, duration: 450, useNativeDriver: ND,
    }).start();

    Animated.parallel([
      Animated.timing(iconOpacity, { toValue: 1, duration: 600, delay: 200, useNativeDriver: ND }),
      Animated.spring(iconScale, { toValue: 1, delay: 200, useNativeDriver: ND, tension: 60, friction: 8 }),
    ]).start();

    Animated.parallel([
      Animated.timing(wordOpacity, { toValue: 1, duration: 550, delay: 560, useNativeDriver: ND }),
      Animated.timing(wordY, { toValue: 0, duration: 550, delay: 560, useNativeDriver: ND }),
    ]).start();

    Animated.timing(tagOpacity, { toValue: 1, duration: 500, delay: 960, useNativeDriver: ND }).start();

    const orbAnim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orbScale, { toValue: 1.08, duration: 2400, useNativeDriver: ND }),
          Animated.timing(orbOpacity, { toValue: 0.85, duration: 2400, useNativeDriver: ND }),
        ]),
        Animated.parallel([
          Animated.timing(orbScale, { toValue: 0.82, duration: 2400, useNativeDriver: ND }),
          Animated.timing(orbOpacity, { toValue: 0.55, duration: 2400, useNativeDriver: ND }),
        ]),
      ])
    );
    orbAnim.start();

    const innerOrbAnim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(innerOrbScale, { toValue: 1.12, duration: 1800, useNativeDriver: ND }),
          Animated.timing(innerOrbOpacity, { toValue: 1, duration: 1800, useNativeDriver: ND }),
        ]),
        Animated.parallel([
          Animated.timing(innerOrbScale, { toValue: 0.9, duration: 1800, useNativeDriver: ND }),
          Animated.timing(innerOrbOpacity, { toValue: 0.7, duration: 1800, useNativeDriver: ND }),
        ]),
      ])
    );
    innerOrbAnim.start();

    const ring1Anim = Animated.loop(
      Animated.timing(ringRot, { toValue: 1, duration: 7000, useNativeDriver: ND })
    );
    ring1Anim.start();

    const ring2Anim = Animated.loop(
      Animated.timing(ringRot2, { toValue: -1, duration: 11000, useNativeDriver: ND })
    );
    ring2Anim.start();

    const dotAnim = Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(dot1, { toValue: 1, duration: 280, useNativeDriver: ND }),
        Animated.timing(dot1, { toValue: 0.25, duration: 280, useNativeDriver: ND }),
        Animated.timing(dot2, { toValue: 1, duration: 280, useNativeDriver: ND }),
        Animated.timing(dot2, { toValue: 0.25, duration: 280, useNativeDriver: ND }),
        Animated.timing(dot3, { toValue: 1, duration: 280, useNativeDriver: ND }),
        Animated.timing(dot3, { toValue: 0.25, duration: 280, useNativeDriver: ND }),
        Animated.delay(300),
      ])
    );
    dotAnim.start();

    const dismiss = setTimeout(() => {
      Animated.timing(screenFade, { toValue: 0, duration: 480, useNativeDriver: ND }).start(() => {
        orbAnim.stop();
        innerOrbAnim.stop();
        ring1Anim.stop();
        ring2Anim.stop();
        dotAnim.stop();
        onDone();
      });
    }, 2800);

    return () => {
      clearTimeout(dismiss);
      orbAnim.stop();
      innerOrbAnim.stop();
      ring1Anim.stop();
      ring2Anim.stop();
      dotAnim.stop();
    };
  }, []);

  const ring1Deg = ringRot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const ring2Deg = ringRot2.interpolate({ inputRange: [-1, 0], outputRange: ["-360deg", "0deg"] });

  return (
    <Animated.View style={[styles.root, { opacity: screenFade }]}>
      <NeuralNetSVG width={W} height={H} opacity={0.28} particleCount={30} />

      <Animated.View
        style={[
          styles.glowOuter,
          { transform: [{ scale: orbScale }], opacity: orbOpacity, pointerEvents: "none" },
        ]}
      />
      <Animated.View
        style={[
          styles.glowInner,
          { transform: [{ scale: innerOrbScale }], opacity: innerOrbOpacity, pointerEvents: "none" },
        ]}
      />
      <View style={[styles.glowBlue, { pointerEvents: "none" }]} />

      <View style={styles.center}>
        <View style={styles.iconArea}>
          <Animated.View
            style={[styles.ringWrap, { transform: [{ rotate: ring1Deg }] }]}
          >
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                stroke={BRAND}
                strokeWidth={1.2}
                strokeDasharray="14 6"
                fill="none"
                opacity={0.55}
              />
            </Svg>
          </Animated.View>
          <Animated.View
            style={[styles.ringWrap, styles.ringWrap2, { transform: [{ rotate: ring2Deg }] }]}
          >
            <Svg width={RING_SIZE + 26} height={RING_SIZE + 26}>
              <Circle
                cx={(RING_SIZE + 26) / 2}
                cy={(RING_SIZE + 26) / 2}
                r={RING_R + 13}
                stroke={BRAND}
                strokeWidth={0.7}
                strokeDasharray="6 10"
                fill="none"
                opacity={0.28}
              />
            </Svg>
          </Animated.View>

          <Animated.View
            style={[styles.logoCircle, { opacity: iconOpacity, transform: [{ scale: iconScale }] }]}
          >
            <Text style={styles.logoLetter}>R</Text>
          </Animated.View>
        </View>

        <Animated.Text
          style={[styles.wordmark, { opacity: wordOpacity, transform: [{ translateY: wordY }] }]}
        >
          RESILIUM
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          Your Personal Resilience Platform
        </Animated.Text>

        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </View>

      <Animated.Text style={[styles.footer, { opacity: tagOpacity }]}>
        Built for what matters most
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: BRAND_SOFT,
    alignSelf: "center",
    top: H / 2 - 210,
  },
  glowInner: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: BRAND_MID,
    alignSelf: "center",
    top: H / 2 - 120,
  },
  glowBlue: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: BLUE_SOFT,
    alignSelf: "center",
    top: H / 2 + 60,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconArea: {
    width: RING_SIZE + 26,
    height: RING_SIZE + 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  ringWrap: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  ringWrap2: {
    top: -13,
    left: -13,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(224,128,64,0.14)",
    borderWidth: 1.5,
    borderColor: "rgba(224,128,64,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 34,
    fontWeight: "700",
    color: BRAND,
    letterSpacing: 1,
    lineHeight: 38,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: "700",
    color: "#EAD9BE",
    letterSpacing: 7,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 13.5,
    color: "rgba(176,168,144,0.8)",
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
    fontSize: 11.5,
    color: "rgba(106,96,112,0.9)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
