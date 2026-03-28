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
  incomeStability: "fixed" | "freelance" | "unstable";
  savingsMonths: number;
  hasDependents: boolean;
  skills: string[];
  healthStatus: "excellent" | "good" | "fair" | "poor";
  mobilityLevel: "high" | "medium" | "low";
  housingType: "own" | "rent" | "family" | "nomadic" | "other";
  hasEmergencySupplies: boolean;
  psychologicalResilience: number;
  riskConcerns: string[];
  mentalResilienceAnswers?: MentalResilienceAnswers;
};

// Normalize a Likert dimension score (1-5 avg) to 0-100
function likertToScore(avg: number): number {
  return Math.round(((avg - 1) / 4) * 100);
}

export function computeMentalResilienceSubScores(
  answers: MentalResilienceAnswers
): MentalResilienceSubScores {
  const stressToleranceAvg = (answers.stressTolerance1 + answers.stressTolerance2) / 2;
  const adaptabilityAvg = (answers.adaptability1 + answers.adaptability2) / 2;
  const learningAgilityAvg = answers.learningAgility1;
  const changeManagementAvg = (answers.changeManagement1 + answers.changeManagement2) / 2;
  const emotionalRegulationAvg = (answers.emotionalRegulation1 + answers.emotionalRegulation2) / 2;
  const socialSupportAvg = answers.socialSupport1;

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
  const financial = calculateFinancialScore(input);
  const health = calculateHealthScore(input);
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
  // - growth pathway (composite >= 60): no dampening, scores are used as-is
  // - compensation pathway (composite < 60): effective scores are slightly dampened
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

function calculateFinancialScore(input: AssessmentInput): number {
  let score = 0;

  const incomeScores = { fixed: 40, freelance: 25, unstable: 10 };
  score += incomeScores[input.incomeStability];

  if (input.savingsMonths >= 12) score += 40;
  else if (input.savingsMonths >= 6) score += 30;
  else if (input.savingsMonths >= 3) score += 20;
  else if (input.savingsMonths >= 1) score += 10;
  else score += 0;

  if (!input.hasDependents) score += 20;
  else score += 5;

  return Math.min(100, score);
}

function calculateHealthScore(input: AssessmentInput): number {
  let score = 0;

  const healthScores = { excellent: 60, good: 45, fair: 25, poor: 10 };
  score += healthScores[input.healthStatus];

  const hasMedical = input.skills.includes("medical");
  if (hasMedical) score += 20;

  score += 20;

  return Math.min(100, score);
}

function calculateSkillsScore(input: AssessmentInput): number {
  const skillValues: Record<string, number> = {
    digital: 20,
    physical: 20,
    survival: 25,
    medical: 20,
    financial: 15,
    language: 15,
    none: 0,
  };

  let score = 0;
  for (const skill of input.skills) {
    score += skillValues[skill] ?? 0;
  }

  return Math.min(100, score);
}

function calculateMobilityScore(input: AssessmentInput): number {
  let score = 0;

  const mobilityScores = { high: 50, medium: 30, low: 10 };
  score += mobilityScores[input.mobilityLevel];

  const housingScores = { own: 20, rent: 30, family: 25, nomadic: 40, other: 15 };
  score += housingScores[input.housingType];

  if (!input.hasDependents) score += 10;

  return Math.min(100, score);
}

function calculateResourcesScore(input: AssessmentInput): number {
  let score = 0;

  if (input.hasEmergencySupplies) score += 50;

  const financialSkill = input.skills.includes("financial") ? 20 : 0;
  const survivalSkill = input.skills.includes("survival") ? 30 : 0;
  score += financialSkill + survivalSkill;

  return Math.min(100, score);
}
