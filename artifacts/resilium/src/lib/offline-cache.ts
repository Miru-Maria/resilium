const PREFIX = "resilium_offline_v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  savedAt: number;
}

export function saveToCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, savedAt: Date.now() };
    localStorage.setItem(`${PREFIX}_${key}`, JSON.stringify(entry));
  } catch {
  }
}

export function loadFromCache<T>(key: string): { data: T; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(`${PREFIX}_${key}`);
      return null;
    }
    return { data: entry.data, savedAt: entry.savedAt };
  } catch {
    return null;
  }
}

export function clearCache(key: string): void {
  try {
    localStorage.removeItem(`${PREFIX}_${key}`);
  } catch {
  }
}

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

export function reportCacheKey(reportId: string): string {
  return `report_${reportId}`;
}

export function plansListCacheKey(userId: string): string {
  return `plans_${userId}`;
}
