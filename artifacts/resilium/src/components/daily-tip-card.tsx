import React from "react";
import { Lightbulb, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDailyTip, DIM_LABELS, type DimKey } from "@/data/tips-bank";

const DIM_COLORS: Record<DimKey, string> = {
  financial: "text-emerald-600 bg-emerald-50 border-emerald-200",
  health:     "text-rose-600 bg-rose-50 border-rose-200",
  skills:     "text-blue-600 bg-blue-50 border-blue-200",
  mobility:   "text-violet-600 bg-violet-50 border-violet-200",
  psychological: "text-amber-600 bg-amber-50 border-amber-200",
  resources:  "text-teal-600 bg-teal-50 border-teal-200",
};

interface DailyTipCardProps {
  lowestDim?: DimKey | null;
}

export function DailyTipCard({ lowestDim }: DailyTipCardProps) {
  const dim: DimKey = lowestDim ?? "psychological";
  const tip = getDailyTip(dim);
  const color = DIM_COLORS[dim];
  const label = DIM_LABELS[dim];

  return (
    <Card className="border-none shadow-md overflow-hidden">
      <div className={`h-1 w-full ${color.split(" ")[1].replace("bg-", "bg-")}`} style={{ background: "var(--tw-gradient-stops, currentColor)" }} />
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${color}`}>
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Tip</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
            </div>
            <p className="text-sm text-foreground font-medium leading-snug mb-2">{tip.text}</p>
            <div className="flex items-start gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.action}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
