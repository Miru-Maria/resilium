export interface BadgeCriteria {
  id: string;
  label: string;
  description: string;
  iconName: string;
  earned: boolean;
  colorKey: string;
}

export interface BadgeCriteriaInput {
  planCount: number;
  allDimsAssessed: boolean;
  streak: number;
  completedDaysCount?: number;
  isPro?: boolean;
}

export function computeBadgeCriteria(input: BadgeCriteriaInput): BadgeCriteria[] {
  const { planCount, allDimsAssessed, streak, completedDaysCount = 0, isPro = false } = input;
  return [
    {
      id: "first_plan",
      label: "First Step",
      description: "Completed your first resilience assessment",
      iconName: "star",
      earned: planCount >= 1,
      colorKey: "amber",
    },
    {
      id: "consistent",
      label: "Consistent Planner",
      description: "Completed 3 or more assessments",
      iconName: "book-open",
      earned: planCount >= 3,
      colorKey: "blue",
    },
    {
      id: "full_spectrum",
      label: "Full Spectrum",
      description: "Assessed all 6 resilience dimensions",
      iconName: "zap",
      earned: allDimsAssessed,
      colorKey: "violet",
    },
    {
      id: "week_streak",
      label: "Week Streak",
      description: "7-day engagement streak",
      iconName: "flame",
      earned: streak >= 7,
      colorKey: "orange",
    },
    {
      id: "month_streak",
      label: "Month Streak",
      description: "30-day engagement streak",
      iconName: "trophy",
      earned: streak >= 30,
      colorKey: "emerald",
    },
    {
      id: "challenge_warrior",
      label: "Challenge Warrior",
      description: "Completed 10 days of the 30-day challenge",
      iconName: "flame",
      earned: completedDaysCount >= 10,
      colorKey: "rose",
    },
    {
      id: "challenge_champion",
      label: "Challenge Champion",
      description: "Completed all 30 days of the challenge",
      iconName: "trophy",
      earned: completedDaysCount >= 30,
      colorKey: "emerald-dark",
    },
    {
      id: "pro",
      label: "Pro Member",
      description: "Unlocked full platform access",
      iconName: "award",
      earned: isPro,
      colorKey: "primary",
    },
  ];
}

export function computeBadgeCount(input: BadgeCriteriaInput): number {
  return computeBadgeCriteria(input).filter((b) => b.earned).length;
}
