import React from "react";
import { Award, Flame, Star, Zap, BookOpen, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeBadgeCriteria, type BadgeCriteriaInput } from "@/lib/badge-criteria";

const COLOR_CLASS: Record<string, string> = {
  amber: "text-amber-600 bg-amber-50 border-amber-200",
  blue: "text-blue-600 bg-blue-50 border-blue-200",
  violet: "text-violet-600 bg-violet-50 border-violet-200",
  orange: "text-orange-600 bg-orange-50 border-orange-200",
  emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
  rose: "text-rose-600 bg-rose-50 border-rose-200",
  "emerald-dark": "text-emerald-700 bg-emerald-50 border-emerald-300",
  primary: "text-primary bg-primary/10 border-primary/20",
};

const ICON_MAP: Record<string, React.ReactNode> = {
  star: <Star className="w-4 h-4" />,
  "book-open": <BookOpen className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  flame: <Flame className="w-4 h-4" />,
  trophy: <Trophy className="w-4 h-4" />,
  award: <Award className="w-4 h-4" />,
};

export interface AchievementBadgesProps extends BadgeCriteriaInput {}

export function AchievementBadges({ planCount, streak, isPro, allDimsAssessed, completedDaysCount = 0 }: AchievementBadgesProps) {
  const badges = computeBadgeCriteria({ planCount, streak, isPro, allDimsAssessed, completedDaysCount });

  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  if (earned.length === 0 && locked.length === 0) return null;

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" /> Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-wrap gap-2">
          {earned.map((badge) => (
            <div
              key={badge.id}
              title={badge.description}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${COLOR_CLASS[badge.colorKey] ?? ""}`}
            >
              {ICON_MAP[badge.iconName]}
              {badge.label}
            </div>
          ))}
          {locked.map((badge) => (
            <div
              key={badge.id}
              title={`Locked: ${badge.description}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground/50 bg-muted/20 opacity-50 cursor-default select-none"
            >
              {ICON_MAP[badge.iconName]}
              {badge.label}
            </div>
          ))}
        </div>
        {earned.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">{earned.length} of {badges.length} earned</p>
        )}
      </CardContent>
    </Card>
  );
}
