import React from "react";
import { Award, CheckCircle2, Flame, Star, Zap, BookOpen, Trophy, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeBadgeCriteria, type BadgeCriteriaInput } from "@/lib/badge-criteria";

const COLOR_CONFIG: Record<string, { bg: string; iconBg: string; text: string; border: string }> = {
  amber:         { bg: "bg-amber-50",   iconBg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
  blue:          { bg: "bg-blue-50",    iconBg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
  violet:        { bg: "bg-violet-50",  iconBg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200" },
  orange:        { bg: "bg-orange-50",  iconBg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200" },
  emerald:       { bg: "bg-emerald-50", iconBg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  rose:          { bg: "bg-rose-50",    iconBg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200" },
  "emerald-dark":{ bg: "bg-emerald-50", iconBg: "bg-emerald-200", text: "text-emerald-800", border: "border-emerald-300" },
  primary:       { bg: "bg-primary/5",  iconBg: "bg-primary/15",  text: "text-primary",     border: "border-primary/20" },
};

const ICON_MAP: Record<string, React.ReactNode> = {
  star:        <Star className="w-5 h-5" />,
  "book-open": <BookOpen className="w-5 h-5" />,
  zap:         <Zap className="w-5 h-5" />,
  flame:       <Flame className="w-5 h-5" />,
  trophy:      <Trophy className="w-5 h-5" />,
  award:       <Award className="w-5 h-5" />,
};

export interface AchievementBadgesProps extends BadgeCriteriaInput {}

export function AchievementBadges({ planCount, streak, isPro, allDimsAssessed, completedDaysCount = 0 }: AchievementBadgesProps) {
  const badges = computeBadgeCriteria({ planCount, streak, isPro, allDimsAssessed, completedDaysCount });

  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  if (earned.length === 0 && locked.length === 0) return null;

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" /> Achievements
        </CardTitle>
        <p className="text-xs text-muted-foreground">{earned.length} of {badges.length} earned</p>
      </CardHeader>
      <CardContent className="pb-4 space-y-2">
        {earned.map((badge) => {
          const cfg = COLOR_CONFIG[badge.colorKey] ?? COLOR_CONFIG.amber;
          return (
            <div
              key={badge.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border ${cfg.bg} ${cfg.border}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg} ${cfg.text}`}>
                {ICON_MAP[badge.iconName] ?? <Star className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-tight ${cfg.text}`}>{badge.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{badge.description}</p>
              </div>
              <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${cfg.text}`} />
            </div>
          );
        })}

        {locked.length > 0 && (
          <div className="pt-1 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Locked</p>
            {locked.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-dashed border-border/60 bg-muted/20"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted/40 text-muted-foreground/40">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-muted-foreground/60 leading-tight">{badge.label}</p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
