// PATHWAY THRESHOLDS
// composite >= 60 → growth pathway (user has capacity for challenge-oriented goals)
// composite < 60  → compensation pathway (build confidence, scaffold steps first)
const GROWTH_PATHWAY_THRESHOLD = 60;

type MentalResilienceAnswers = {
  stressTolerance1: number;
  stressTolerance2: number;
  adaptability1: number;
  adaptability2: number;
  learningAgility1: number;
  changeManagement1: number;
  changeManagement2: number;
  emotionalRegulation1: number;
  emotionalRegulation2: number;
  socialSupport1: number;
};

type MentalResilienceSubScores = {
  stressTolerance: number;
  adaptability: number;
  learningAgility: number;
  changeManagement: number;
  emotionalRegulation: number;
  socialSupport: number;
  composite: number;
  pathway: "growth" | "compensation";
};

type AssessmentInput = {
  location: string;
  ageBracket?: string;
  incomeStability: "fixed" | "freelance" | "unstable" | "student";
  savingsMonths: number;
  // New: count 0=none, 1=one, 2=two-three, 3=four+
  // Legacy boolean hasDependents kept for backward compat
  dependentCount?: number;
  hasDependents?: boolean;
  skills: string[];
  healthStatus: "excellent" | "good" | "fair" | "poor";
  mobilityLevel: "high" | "medium" | "low";
  housingType: "own" | "rent" | "family" | "nomadic" | "other" | "temporary" | "transitional";
  // New: explicit relocation readiness
  relocationReadiness?: "immediate" | "within_month" | "within_3months" | "difficult";
  hasEmergencySupplies: boolean;
  psychologicalResilience: number;
  riskConcerns: string[];
  mentalResilienceAnswers?: MentalResilienceAnswers;
};

// ─── Age modifiers ────────────────────────────────────────────────────────────
// Financial: reflects time-horizon risk. A 60-year-old with 3 months savings
//   is in a fundamentally different position than a 25-year-old with the same.
// Health: reflects baseline vulnerability that self-reported status underweights.
function getAgeModifiers(ageBracket?: string): { financial: number; health: number } {
  switch (ageBracket) {
    case "18-24": return { financial: +10, health: +12 };
    case "25-34": return { financial: +5,  health: +6  };
    case "35-44": return { financial:  0,  health:  0  };  // baseline
    case "45-54": return { financial: -5,  health: -5  };
    case "55-64": return { financial: -12, health: -10 };
    case "65+":   return { financial: -8,  health: -15 };
    default:      return { financial:  0,  health:  0  };
  }
}

// Resolve dependentCount from either new field or legacy boolean
function resolveDependentCount(input: AssessmentInput): number {
  if (typeof input.dependentCount === "number") return input.dependentCount;
  // Legacy fallback
  if (input.hasDependents === true) return 2; // assume moderate burden
  return 0;
}

// Normalize a Likert dimension score (1-5 avg) to 0-100
function likertToScore(avg: number): number {
  return Math.round(((avg - 1) / 4) * 100);
}

export function computeMentalResilienceSubScores(
  answers: MentalResilienceAnswers
): MentalResilienceSubScores {
  const safe = (v: number | undefined) => (typeof v === "number" && !isNaN(v) && v >= 1 && v <= 5 ? v : 3);
  const stressToleranceAvg = (safe(answers.stressTolerance1) + safe(answers.stressTolerance2)) / 2;
  const adaptabilityAvg = (safe(answers.adaptability1) + safe(answers.adaptability2)) / 2;
  const learningAgilityAvg = safe(answers.learningAgility1);
  const changeManagementAvg = (safe(answers.changeManagement1) + safe(answers.changeManagement2)) / 2;
  const emotionalRegulationAvg = (safe(answers.emotionalRegulation1) + safe(answers.emotionalRegulation2)) / 2;
  const socialSupportAvg = safe(answers.socialSupport1);

  const stressTolerance = likertToScore(stressToleranceAvg);
  const adaptability = likertToScore(adaptabilityAvg);
  const learningAgility = likertToScore(learningAgilityAvg);
  const changeManagement = likertToScore(changeManagementAvg);
  const emotionalRegulation = likertToScore(emotionalRegulationAvg);
  const socialSupport = likertToScore(socialSupportAvg);

  // Composite: equal weight across 6 dimensions
  const composite = Math.round(
    (stressTolerance + adaptability + learningAgility + changeManagement + emotionalRegulation + socialSupport) / 6
  );

  const pathway: "growth" | "compensation" =
    composite >= GROWTH_PATHWAY_THRESHOLD ? "growth" : "compensation";

  return {
    stressTolerance,
    adaptability,
    learningAgility,
    changeManagement,
    emotionalRegulation,
    socialSupport,
    composite,
    pathway,
  };
}

export function calculateScores(input: AssessmentInput) {
  const ageMods = getAgeModifiers(input.ageBracket);
  const financial = Math.min(100, Math.max(0, calculateFinancialScore(input) + ageMods.financial));
  const health = Math.min(100, Math.max(0, calculateHealthScore(input) + ageMods.health));
  const skills = calculateSkillsScore(input);
  const mobility = calculateMobilityScore(input);
  const resources = calculateResourcesScore(input);

  // Derive psychological score from composite when available; fall back to self-rating
  let mentalResilienceSubScores: MentalResilienceSubScores | null = null;
  let psychological: number;

  if (input.mentalResilienceAnswers) {
    mentalResilienceSubScores = computeMentalResilienceSubScores(input.mentalResilienceAnswers);
    psychological = mentalResilienceSubScores.composite;
  } else {
    psychological = Math.round((input.psychologicalResilience / 10) * 100);
  }

  // Mental resilience composite acts as a cross-area modifier:
  // - growth pathway (composite >= 60): no dampening, scores used as-is
  // - compensation pathway (composite < 60): effective scores slightly dampened
  //   to reflect that psychological pressure compounds other vulnerabilities
  let modifier = 1.0;
  if (mentalResilienceSubScores && mentalResilienceSubScores.pathway === "compensation") {
    // Scale modifier: composite=0 → 0.85, composite=59 → ~0.99
    modifier = 0.85 + (mentalResilienceSubScores.composite / GROWTH_PATHWAY_THRESHOLD) * 0.15;
  }

  const overall = Math.round(
    (financial * modifier) * 0.25 +
    health * 0.15 +
    (skills * modifier) * 0.20 +
    mobility * 0.15 +
    psychological * 0.15 +
    resources * 0.10
  );

  return {
    overall: Math.min(100, overall),
    financial,
    health,
    skills,
    mobility,
    psychological,
    resources,
    mentalResilienceSubScores,
  };
}

// ─── FINANCIAL (25%) ─────────────────────────────────────────────────────────
// income(40) + savings(40) + dependents(0-20) = max 100
function calculateFinancialScore(input: AssessmentInput): number {
  let score = 0;

  // "student" is a life stage, not a risk — scored equivalent to "unstable" for
  // financial purposes. "freelance" also covers "prefer not to say" (neutral mid-range).
  const incomeScores: Record<string, number> = { fixed: 40, freelance: 28, unstable: 12, student: 12 };
  score += incomeScores[input.incomeStability] ?? 28;

  if (input.savingsMonths >= 12) score += 40;
  else if (input.savingsMonths >= 6) score += 30;
  else if (input.savingsMonths >= 3) score += 20;
  else if (input.savingsMonths >= 1) score += 10;

  // 0=none → +20, 1=one → +12, 2=two-three → +5, 3=four+ → +0
  const dc = resolveDependentCount(input);
  if (dc === 0) score += 20;
  else if (dc === 1) score += 12;
  else if (dc === 2) score += 5;
  // 3+ adds 0

  return Math.min(100, score);
}

// ─── HEALTH (15%) ─────────────────────────────────────────────────────────────
// status(15-80) + medical skill(20) = max 100
// No phantom +20 bonus
function calculateHealthScore(input: AssessmentInput): number {
  let score = 0;

  const healthScores = { excellent: 80, good: 60, fair: 35, poor: 15 };
  score += healthScores[input.healthStatus] ?? 15;

  if (input.skills.includes("medical")) score += 20;

  return Math.min(100, score);
}

// ─── SKILLS (20%) ─────────────────────────────────────────────────────────────
// Sum of individual skill values, floored at 10 (basic life competency)
function calculateSkillsScore(input: AssessmentInput): number {
  const skillValues: Record<string, number> = {
    digital: 20,
    physical: 20,
    survival: 25,
    medical: 20,
    financial: 15,
    language: 15,
    caregiving: 15,
    agriculture: 20,
    community: 12,
    teaching: 12,
    none: 0,
  };

  let score = 0;
  for (const skill of input.skills) {
    score += skillValues[skill] ?? 0;
  }

  // Floor: everyone has basic life competency
  return Math.min(100, Math.max(10, score));
}

// ─── MOBILITY (15%) ──────────────────────────────────────────────────────────
// Physical capability(10-50) + geographic flexibility(10-40) + dependents bonus(0-10)
// = max 100
function calculateMobilityScore(input: AssessmentInput): number {
  let score = 0;

  // Physical capability dimension
  const physicalScores = { high: 50, medium: 30, low: 10 };
  score += physicalScores[input.mobilityLevel] ?? 10;

  // Geographic flexibility dimension
  if (input.relocationReadiness) {
    const readinessScores: Record<string, number> = {
      immediate: 40,
      within_month: 30,
      within_3months: 20,
      difficult: 10,
    };
    score += readinessScores[input.relocationReadiness] ?? 20;
  } else {
    // Legacy fallback: derive flexibility from housing type
    const housingFlexScores: Record<string, number> = {
      nomadic: 35,
      transitional: 30,
      temporary: 28,
      rent: 25,
      family: 20,
      other: 15,
      own: 10,
    };
    score += housingFlexScores[input.housingType] ?? 15;
  }

  // Dependents mobility burden
  const dc = resolveDependentCount(input);
  if (dc === 0) score += 10;
  else if (dc === 1) score += 5;
  // 2+ adds 0

  return Math.min(100, score);
}

// ─── RESOURCES (10%) ─────────────────────────────────────────────────────────
// Physical assets: emergency supplies + housing stability (separate from mobility flexibility)
// Floored at 10
function calculateResourcesScore(input: AssessmentInput): number {
  let score = 0;

  // Physical stockpile
  if (input.hasEmergencySupplies) score += 50;

  // Housing as a stability asset (own = major asset; nomadic/transitional = no fixed base)
  const housingStabilityScores: Record<string, number> = {
    own: 40,
    family: 30,
    rent: 20,
    other: 10,
    temporary: 8,
    transitional: 5,
    nomadic: 5,
  };
  score += housingStabilityScores[input.housingType] ?? 10;

  // Floor: everyone has some minimal resources
  return Math.min(100, Math.max(10, score));
}
