import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl } from "@workspace/api-client-react";
import { ClerkProvider } from "@clerk/expo";
import * as SecureStore from "expo-secure-store";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as Sentry from "@sentry/react-native";

import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SessionProvider } from "@/context/session";
import { ThemeProvider, useColors } from "@/context/theme";

Sentry.init({
  dsn: "https://18da13e057fbeb42d6a6d1346a664d62@o4511187075923968.ingest.de.sentry.io/4511187688816720",
  environment: __DEV__ ? "development" : "production",
  enableNative: Platform.OS !== "web",
  tracesSampleRate: 0.1,
  enabled: !__DEV__,
});

const webTokenCache = {
  async getToken(key: string) {
    try { return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null; } catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try { if (typeof localStorage !== "undefined") localStorage.setItem(key, value); } catch {}
  },
  async clearToken(key: string) {
    try { if (typeof localStorage !== "undefined") localStorage.removeItem(key); } catch {}
  },
};

const nativeTokenCache = {
  async getToken(key: string) {
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try { await SecureStore.setItemAsync(key, value); } catch {}
  },
  async clearToken(key: string) {
    try { await SecureStore.deleteItemAsync(key); } catch {}
  },
};

const tokenCache = Platform.OS === "web" ? webTokenCache : nativeTokenCache;

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav({ showIntro, onIntroDone }: { showIntro: boolean; onIntroDone: () => void }) {
  const colors = useColors();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="consent" />
          <Stack.Screen name="assessment" />
          <Stack.Screen name="loading" />
          <Stack.Screen name="results" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="pricing" />
          <Stack.Screen name="scenarios" />
          <Stack.Screen name="about" />
          <Stack.Screen name="coaching" />
        </Stack>
      </KeyboardProvider>
      {showIntro && <AppLoadingScreen onDone={onIntroDone} />}
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [showIntro, setShowIntro] = useState(true);

  // Load Feather separately — on web it's handled by the @font-face in +html.tsx,
  // on native we call Font.loadAsync. Errors are swallowed so a missing font never
  // blocks startup.
  const [featherReady, setFeatherReady] = useState<boolean>(
    () => Platform.OS === "web" || Font.isLoaded("Feather")
  );
  useEffect(() => {
    if (featherReady) return;
    Font.loadAsync(Feather.font)
      .then(() => setFeatherReady(true))
      .catch(() => setFeatherReady(true));
  }, [featherReady]);

  // Timeout fallback: if fonts haven't loaded or errored after 7 s (e.g. slow CDN /
  // Android emulator latency), render with system fonts so the app isn't stuck.
  const [fontTimedOut, setFontTimedOut] = useState(false);
  useEffect(() => {
    if (fontsLoaded || fontError) return;
    const timer = setTimeout(() => setFontTimedOut(true), 7000);
    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  const fontReady = (fontsLoaded || !!fontError || fontTimedOut) && featherReady;

  useEffect(() => {
    if (fontReady) {
      SplashScreen.hideAsync();
    }
  }, [fontReady]);

  if (!fontReady) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ClerkProvider
          publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ""}
          tokenCache={tokenCache}
        >
          <QueryClientProvider client={queryClient}>
            <SessionProvider>
              <ThemeProvider>
                <RootLayoutNav showIntro={showIntro} onIntroDone={() => setShowIntro(false)} />
              </ThemeProvider>
            </SessionProvider>
          </QueryClientProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
