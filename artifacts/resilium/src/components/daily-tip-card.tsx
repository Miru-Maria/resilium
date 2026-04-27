import React from "react";
import { Lightbulb, ChevronRight } from "lucide-react";
import { getDailyTip, DIM_LABELS, type DimKey } from "@/data/tips-bank";

const DIM_CONFIG: Record<DimKey, { badge: string; icon: string; border: string; iconBg: string }> = {
  financial:     { badge: "bg-amber-100 text-amber-700 border-amber-200",   icon: "text-amber-600",   border: "border-l-amber-400",   iconBg: "bg-amber-50 border-amber-200 text-amber-600" },
  health:        { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "text-emerald-600", border: "border-l-emerald-400", iconBg: "bg-emerald-50 border-emerald-200 text-emerald-600" },
  skills:        { badge: "bg-violet-100 text-violet-700 border-violet-200",   icon: "text-violet-600",  border: "border-l-violet-400",  iconBg: "bg-violet-50 border-violet-200 text-violet-600" },
  mobility:      { badge: "bg-orange-100 text-orange-700 border-orange-200",   icon: "text-orange-600",  border: "border-l-orange-400",  iconBg: "bg-orange-50 border-orange-200 text-orange-600" },
  psychological: { badge: "bg-pink-100 text-pink-700 border-pink-200",         icon: "text-pink-600",    border: "border-l-pink-400",    iconBg: "bg-pink-50 border-pink-200 text-pink-600" },
  resources:     { badge: "bg-sky-100 text-sky-700 border-sky-200",            icon: "text-sky-600",     border: "border-l-sky-400",     iconBg: "bg-sky-50 border-sky-200 text-sky-600" },
};

interface DailyTipCardProps {
  lowestDim?: DimKey | null;
}

export function DailyTipCard({ lowestDim }: DailyTipCardProps) {
  const dim: DimKey = lowestDim ?? "psychological";
  const tip = getDailyTip(dim);
  const label = DIM_LABELS[dim];
  const cfg = DIM_CONFIG[dim];

  return (
    <div className={`bg-white rounded-2xl shadow-md border border-slate-200 border-l-4 ${cfg.border} overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.iconBg}`}>
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Tip</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>{label}</span>
            </div>
            <p className="text-sm text-slate-800 font-semibold leading-snug mb-2">{tip.text}</p>
            <div className="flex items-start gap-1.5 bg-slate-50 rounded-lg px-3 py-2">
              <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${cfg.icon}`} />
              <p className="text-xs text-slate-600 leading-relaxed">{tip.action}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
