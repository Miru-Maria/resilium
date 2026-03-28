import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const CONSENT_KEY = "resilium_consent";
const SESSION_KEY = "resilium_session_id";
const CONSENT_DATE_KEY = "resilium_consent_date";

type SessionContextType = {
  sessionId: string | null;
  hasConsented: boolean;
  consentDate: string | null;
  giveConsent: () => Promise<string>;
  revokeConsent: () => Promise<void>;
  isLoaded: boolean;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [consentDate, setConsentDate] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [consent, sid, date] = await Promise.all([
          AsyncStorage.getItem(CONSENT_KEY),
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(CONSENT_DATE_KEY),
        ]);
        if (consent === "true" && sid) {
          setHasConsented(true);
          setSessionId(sid);
          setConsentDate(date);
        }
      } catch (e) {
        console.error("Error loading session", e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const giveConsent = async (): Promise<string> => {
    const newId = Crypto.randomUUID();
    const now = new Date().toISOString();
    await Promise.all([
      AsyncStorage.setItem(CONSENT_KEY, "true"),
      AsyncStorage.setItem(SESSION_KEY, newId),
      AsyncStorage.setItem(CONSENT_DATE_KEY, now),
    ]);
    setHasConsented(true);
    setSessionId(newId);
    setConsentDate(now);
    return newId;
  };

  const revokeConsent = async () => {
    await Promise.all([
      AsyncStorage.removeItem(CONSENT_KEY),
      AsyncStorage.removeItem(SESSION_KEY),
      AsyncStorage.removeItem(CONSENT_DATE_KEY),
    ]);
    setHasConsented(false);
    setSessionId(null);
    setConsentDate(null);
  };

  return (
    <SessionContext.Provider value={{ sessionId, hasConsented, consentDate, giveConsent, revokeConsent, isLoaded }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
