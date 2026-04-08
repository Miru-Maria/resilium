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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl } from "@workspace/api-client-react";
import { ClerkProvider } from "@clerk/expo";
import * as SecureStore from "expo-secure-store";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SessionProvider } from "@/context/session";
import { ThemeProvider, useColors } from "@/context/theme";

const tokenCache = {
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

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
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
          <Stack.Screen name="index" />
          <Stack.Screen name="consent" />
          <Stack.Screen name="assessment" />
          <Stack.Screen name="loading" />
          <Stack.Screen name="results" />
          <Stack.Screen name="my-data" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="my-plans" />
          <Stack.Screen name="pricing" />
          <Stack.Screen name="scenarios" />
          <Stack.Screen name="about" />
          <Stack.Screen name="coaching" />
        </Stack>
      </KeyboardProvider>
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

  // Timeout fallback: if fonts haven't loaded or errored after 5 s (e.g. slow CDN),
  // render with system fonts so the app isn't permanently stuck on a white screen.
  const [fontTimedOut, setFontTimedOut] = useState(false);
  useEffect(() => {
    if (fontsLoaded || fontError) return;
    const timer = setTimeout(() => setFontTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  const fontReady = fontsLoaded || fontError || fontTimedOut;

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
                <RootLayoutNav />
              </ThemeProvider>
            </SessionProvider>
          </QueryClientProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
