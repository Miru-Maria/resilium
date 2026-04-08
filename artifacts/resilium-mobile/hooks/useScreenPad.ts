import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useScreenPad() {
  const insets = useSafeAreaInsets();
  return {
    topPad: insets.top,
    bottomPad: insets.bottom,
    insets,
  };
}
