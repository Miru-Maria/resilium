import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Announcement {
  id: number;
  message: string;
  type: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchAnnouncements(): Promise<{ announcements: Announcement[] }> {
  const res = await fetch(`${BASE}/api/announcements`);
  if (!res.ok) return { announcements: [] };
  return res.json();
}

const TYPE_STYLES: Record<string, { bg: string; border: string; text: string; Icon: React.ComponentType<{ className?: string }> }> = {
  info: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-300", Icon: Info },
  warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300", Icon: AlertTriangle },
  success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300", Icon: CheckCircle2 },
};

export function AnnouncementBanner() {
  const { data } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
    staleTime: 5 * 60 * 1000,
  });

  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const active = (data?.announcements ?? []).filter((a) => !dismissed.has(a.id));
  if (active.length === 0) return null;

  return (
    <div className="w-full z-50 flex flex-col gap-1">
      {active.map((a) => {
        const style = TYPE_STYLES[a.type] ?? TYPE_STYLES.info;
        const { Icon } = style;
        return (
          <div
            key={a.id}
            className={`w-full px-4 py-3 flex items-center gap-3 border-b ${style.bg} ${style.border} border-b`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${style.text}`} />
            <p className={`flex-1 text-sm font-medium ${style.text}`}>{a.message}</p>
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, a.id]))}
              className={`flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors ${style.text}`}
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
