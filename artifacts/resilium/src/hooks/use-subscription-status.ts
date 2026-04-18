import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface SubscriptionStatus {
  isPro: boolean;
  status?: string;
  planName?: string;
  currentPeriodEnd?: string | null;
  cancelScheduled?: boolean;
}

export function useSubscriptionStatus() {
  return useQuery<SubscriptionStatus | null>({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/subscription/status`, { credentials: "include" });
      if (!r.ok) return null;
      return r.json() as Promise<SubscriptionStatus>;
    },
    staleTime: 60_000,
  });
}
