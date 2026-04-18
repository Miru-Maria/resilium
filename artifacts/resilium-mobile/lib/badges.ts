export const DIMENSION_SCORE_KEYS = [
  "scoreFinancial",
  "scoreHealth",
  "scoreSkills",
  "scoreMobility",
  "scorePsychological",
  "scoreResources",
] as const;

export interface BadgeCriteria {
  planCount: number;
  streak: number;
  isPro: boolean;
  allDimsAssessed: boolean;
  completedDaysCount: number;
}

export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  earned: (criteria: BadgeCriteria) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "first_plan",
    label: "First Step",
    description: "Completed your first resilience assessment",
    earned: (c) => c.planCount >= 1,
  },
  {
    id: "consistent",
    label: "Consistent Planner",
    description: "Completed 3 or more assessments",
    earned: (c) => c.planCount >= 3,
  },
  {
    id: "full_spectrum",
    label: "Full Spectrum",
    description: "Assessed all 6 resilience dimensions",
    earned: (c) => c.allDimsAssessed,
  },
  {
    id: "week_streak",
    label: "Week Streak",
    description: "7-day engagement streak",
    earned: (c) => c.streak >= 7,
  },
  {
    id: "month_streak",
    label: "Month Streak",
    description: "30-day engagement streak",
    earned: (c) => c.streak >= 30,
  },
  {
    id: "challenge_warrior",
    label: "Challenge Warrior",
    description: "Completed 10 days of the 30-day challenge",
    earned: (c) => c.completedDaysCount >= 10,
  },
  {
    id: "challenge_champion",
    label: "Challenge Champion",
    description: "Completed all 30 days of the challenge",
    earned: (c) => c.completedDaysCount >= 30,
  },
  {
    id: "pro",
    label: "Pro Member",
    description: "Unlocked full platform access",
    earned: (c) => c.isPro,
  },
];

export function computeBadges(criteria: BadgeCriteria): Array<BadgeDefinition & { isEarned: boolean }> {
  return BADGE_DEFINITIONS.map((def) => ({ ...def, isEarned: def.earned(criteria) }));
}

export function computeBadgeCount(criteria: BadgeCriteria): number {
  return BADGE_DEFINITIONS.filter((def) => def.earned(criteria)).length;
}

export function allDimsAssessedFromPlan(plan: Record<string, unknown>): boolean {
  return DIMENSION_SCORE_KEYS.every(
    (k) => plan[k] !== null && plan[k] !== undefined
  );
}
