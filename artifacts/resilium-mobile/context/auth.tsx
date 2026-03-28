import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const AUTH_TOKEN_KEY = "resilium_auth_token";
const AUTH_USER_KEY = "resilium_auth_user";

export type AuthUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  authToken: string | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  signIn: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function base64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generateCodeVerifier(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return base64urlEncode(bytes);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [tokenRaw, userRaw] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(AUTH_USER_KEY),
        ]);
        if (tokenRaw && userRaw) {
          setAuthToken(tokenRaw);
          setUser(JSON.parse(userRaw));
        }
      } catch (e) {
        console.error("Error loading auth state", e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const signIn = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const replId = process.env.EXPO_PUBLIC_REPL_ID;
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      if (!replId || !domain) return { success: false, error: "App not configured" };

      const codeVerifier = await generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = Crypto.randomUUID();
      const nonce = Crypto.randomUUID();
      const redirectUri = `https://${domain}/api/mobile-auth/redirect`;

      const params = new URLSearchParams({
        client_id: replId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state,
        nonce,
        prompt: "login consent",
      });

      const authUrl = `https://replit.com/oidc/auth?${params.toString()}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
        showInRecents: false,
        dismissButtonStyle: "cancel",
      });

      if (result.type !== "success") {
        return { success: false, error: result.type === "cancel" ? "Cancelled" : "Auth failed" };
      }

      const url = new URL(result.url);
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");

      if (!code || returnedState !== state) {
        return { success: false, error: "Invalid auth response" };
      }

      const exchangeRes = await fetch(`https://${domain}/api/mobile-auth/token-exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, code_verifier: codeVerifier, redirect_uri: redirectUri, state, nonce }),
      });

      if (!exchangeRes.ok) {
        const err = await exchangeRes.json().catch(() => ({}));
        return { success: false, error: (err as any).error || "Token exchange failed" };
      }

      const { token } = await exchangeRes.json();

      const profileRes = await fetch(`https://${domain}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      const authUser: AuthUser = profileData.user;

      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser)),
      ]);
      setAuthToken(token);
      setUser(authUser);
      return { success: true };
    } catch (e: any) {
      console.error("Sign-in error", e);
      return { success: false, error: e.message || "Unknown error" };
    }
  };

  const signOut = async () => {
    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      if (authToken && domain) {
        await fetch(`https://${domain}/api/mobile-auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        }).catch(() => {});
      }
    } finally {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(AUTH_USER_KEY),
      ]);
      setAuthToken(null);
      setUser(null);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!authToken) return {};
    return { Authorization: `Bearer ${authToken}` };
  };

  return (
    <AuthContext.Provider value={{ user, authToken, isSignedIn: !!authToken, isLoaded, signIn, signOut, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
