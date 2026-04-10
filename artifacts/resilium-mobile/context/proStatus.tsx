import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth";

type ProStatusContextType = {
  isPro: boolean;
  isLoading: boolean;
  refetch: () => void;
};

const ProStatusContext = createContext<ProStatusContextType>({
  isPro: false,
  isLoading: true,
  refetch: () => {},
});

export function ProStatusProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getAuthHeaders } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isSignedIn) {
      setIsPro(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const domain = process.env.EXPO_PUBLIC_DOMAIN;

    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`https://${domain}/api/users/me/subscription`, { headers });
        if (!res.ok) { setIsLoading(false); return; }
        const data = await res.json();
        setIsPro(data.isActive === true);
      } catch {
        setIsPro(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isSignedIn, tick]);

  const refetch = () => setTick(t => t + 1);

  return (
    <ProStatusContext.Provider value={{ isPro, isLoading, refetch }}>
      {children}
    </ProStatusContext.Provider>
  );
}

export function useProStatus() {
  return useContext(ProStatusContext);
}
