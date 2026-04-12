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

type HouseholdComposition = {
  adults?: number;
  hasMinors?: boolean;
  hasMobilityLimitation?: boolean;
  hasMultipleIncomes?: boolean;
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
  // Tiered emergency supplies
  emergencySupplyTier?: "none" | "under_3days" | "3_14days" | "2weeks_1month" | "over_1month";
  // Legacy boolean
  hasEmergencySupplies?: boolean;
  psychologicalResilience: number;
  riskConcerns: string[];
  mentalResilienceAnswers?: MentalResilienceAnswers;
  // Chronic health modifier
  chronicCondition?: "yes" | "prefer_not_to_say" | "no";
  // Social capital inputs
  trustedLocalContacts?: number;   // 0=none, 1=1-2, 2=3-5, 3=6+
  communityInvolvement?: "none" | "occasional" | "active";
  mutualAidAccess?: boolean;
  // Household mode
  householdMode?: "individual" | "household";
  householdComposition?: HouseholdComposition;
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
  // Household mode adjustments: apply before scoring
  const effectiveInput: AssessmentInput = { ...input };

  if (input.householdMode === "household" && input.householdComposition) {
    const comp = input.householdComposition;
    // Cap mobility at "low" if any household member has mobility limitation
    if (comp.hasMobilityLimitation === true && effectiveInput.mobilityLevel !== "low") {
      effectiveInput.mobilityLevel = "low";
    }
  }

  const ageMods = getAgeModifiers(effectiveInput.ageBracket);
  let financial = Math.min(100, Math.max(0, calculateFinancialScore(effectiveInput) + ageMods.financial));

  // Multiple household incomes provide a financial resilience bonus (+8)
  if (input.householdMode === "household" && input.householdComposition?.hasMultipleIncomes === true) {
    financial = Math.min(100, financial + 8);
  }

  const health = Math.min(100, Math.max(0, calculateHealthScore(effectiveInput) + ageMods.health));
  const skills = calculateSkillsScore(effectiveInput);
  const mobility = calculateMobilityScore(effectiveInput);
  const resources = calculateResourcesScore(input);
  const socialCapital = calculateSocialCapitalScore(input);

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

  // Weights: financial 25%, health 15%, skills 18%, mobility 13%, psychological 14%, resources 6%, socialCapital 9%
  const overall = Math.round(
    (financial * modifier) * 0.25 +
    health * 0.15 +
    (skills * modifier) * 0.18 +
    mobility * 0.13 +
    psychological * 0.14 +
    resources * 0.06 +
    socialCapital * 0.09
  );

  return {
    overall: Math.min(100, overall),
    financial,
    health,
    skills,
    mobility,
    psychological,
    resources,
    socialCapital,
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

  if (input.savingsMonths >= 24) score += 40;
  else if (input.savingsMonths >= 12) score += 34;
  else if (input.savingsMonths >= 6) score += 25;
  else if (input.savingsMonths >= 3) score += 15;
  else if (input.savingsMonths >= 1) score += 7;

  // 0=none → +20, 1=one → +12, 2=two-three → +5, 3=four+ → +0
  const dc = resolveDependentCount(input);
  if (dc === 0) score += 20;
  else if (dc === 1) score += 12;
  else if (dc === 2) score += 5;
  // 3+ adds 0

  return Math.min(100, score);
}

// ─── HEALTH (15%) ─────────────────────────────────────────────────────────────
// status(15-80) + medical skill(20) - chronic condition modifier = max 100
function calculateHealthScore(input: AssessmentInput): number {
  let score = 0;

  const healthScores = { excellent: 80, good: 60, fair: 35, poor: 15 };
  score += healthScores[input.healthStatus] ?? 15;

  if (input.skills.includes("medical")) score += 20;

  // Chronic condition or disability affecting daily function: apply negative modifier
  if (input.chronicCondition === "yes") score -= 15;
  // "prefer_not_to_say" and "no" add no modifier

  return Math.min(100, Math.max(0, score));
}

// ─── SKILLS (20%) ─────────────────────────────────────────────────────────────
// Diminishing-returns model: each additional skill beyond the first adds ~70% of the previous.
// Floor at 10, ceiling at 100.
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

  // Sort skills by descending value to maximize diminishing-returns calculation
  const skillScores = input.skills
    .map(s => skillValues[s] ?? 0)
    .filter(v => v > 0)
    .sort((a, b) => b - a);

  let score = 0;
  const DR_FACTOR = 0.7; // each additional skill adds 70% of previous
  for (let i = 0; i < skillScores.length; i++) {
    score += skillScores[i] * Math.pow(DR_FACTOR, i);
  }

  // Floor: everyone has basic life competency
  return Math.min(100, Math.max(10, Math.round(score)));
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
    // "family" housing is treated comparably to renting for mobility
    const housingFlexScores: Record<string, number> = {
      nomadic: 35,
      transitional: 30,
      temporary: 28,
      rent: 25,
      family: 22,   // comparable to renting, slightly lower only due to social ties
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

// ─── RESOURCES (9%) ─────────────────────────────────────────────────────────
// Physical assets: emergency supplies + housing stability (separate from mobility flexibility)
// Emergency supplies now tiered; housing: family is a positive (shared assets & support)
// Floored at 10
function calculateResourcesScore(input: AssessmentInput): number {
  let score = 0;

  // Emergency supplies — tiered scoring (steeper differentiation at the bottom)
  if (input.emergencySupplyTier) {
    const tierScores: Record<string, number> = {
      over_1month: 50,
      "2weeks_1month": 40,
      "3_14days": 26,
      under_3days: 8,
      none: 0,
    };
    score += tierScores[input.emergencySupplyTier] ?? 0;
  } else {
    // Legacy boolean fallback
    if (input.hasEmergencySupplies === true) score += 38; // equivalent to 3-14 days tier
  }

  // Housing as a stability asset (own = major asset; family = moderate positive for shared support)
  // "family" living is NOT penalised — it reflects legitimate mutual support arrangements
  const housingStabilityScores: Record<string, number> = {
    own: 40,
    family: 30,   // comparable to renting — shared assets, mutual support is a genuine strength
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

// ─── SOCIAL CAPITAL (6%) ──────────────────────────────────────────────────────
// Captures community/network strength: trusted contacts, community involvement, mutual aid
// Score range: 10 (floor) - 100 (ceiling)
function calculateSocialCapitalScore(input: AssessmentInput): number {
  let score = 0;

  // Trusted local/abroad contacts (0=none, 1=1-2, 2=3-5, 3=6+)
  const contactScores: Record<number, number> = { 0: 0, 1: 25, 2: 40, 3: 50 };
  score += contactScores[input.trustedLocalContacts ?? 1] ?? 25;

  // Community organization involvement
  const involvementScores: Record<string, number> = {
    active: 30,
    occasional: 15,
    none: 0,
  };
  score += involvementScores[input.communityInvolvement ?? "occasional"] ?? 15;

  // Access to mutual aid networks
  if (input.mutualAidAccess === true) score += 20;
  else if (input.mutualAidAccess === false) score += 0;
  else score += 5; // undefined/unknown — modest default

  return Math.min(100, Math.max(10, score));
}
