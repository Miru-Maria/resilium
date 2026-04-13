import React from "react";
import { Award, Flame, Star, Zap, BookOpen, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface BadgeSpec {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  color: string;
}

interface AchievementBadgesProps {
  planCount: number;
  streak: number;
  isPro: boolean;
  allDimsAssessed: boolean;
}

export function AchievementBadges({ planCount, streak, isPro, allDimsAssessed }: AchievementBadgesProps) {
  const badges: BadgeSpec[] = [
    {
      id: "first_plan",
      label: "First Step",
      description: "Completed your first resilience assessment",
      icon: <Star className="w-4 h-4" />,
      earned: planCount >= 1,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: "consistent",
      label: "Consistent Planner",
      description: "Completed 3 or more assessments",
      icon: <BookOpen className="w-4 h-4" />,
      earned: planCount >= 3,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: "full_spectrum",
      label: "Full Spectrum",
      description: "Assessed all 6 resilience dimensions",
      icon: <Zap className="w-4 h-4" />,
      earned: allDimsAssessed,
      color: "text-violet-600 bg-violet-50 border-violet-200",
    },
    {
      id: "week_streak",
      label: "Week Streak",
      description: "7-day engagement streak",
      icon: <Flame className="w-4 h-4" />,
      earned: streak >= 7,
      color: "text-orange-600 bg-orange-50 border-orange-200",
    },
    {
      id: "month_streak",
      label: "Month Streak",
      description: "30-day engagement streak",
      icon: <Trophy className="w-4 h-4" />,
      earned: streak >= 30,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: "pro",
      label: "Pro Member",
      description: "Unlocked full platform access",
      icon: <Award className="w-4 h-4" />,
      earned: isPro,
      color: "text-primary bg-primary/10 border-primary/20",
    },
  ];

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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${badge.color}`}
            >
              {badge.icon}
              {badge.label}
            </div>
          ))}
          {locked.map((badge) => (
            <div
              key={badge.id}
              title={`Locked: ${badge.description}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground/50 bg-muted/20 opacity-50 cursor-default select-none"
            >
              {badge.icon}
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
