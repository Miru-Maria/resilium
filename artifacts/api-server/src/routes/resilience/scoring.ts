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
};

export function calculateScores(input: AssessmentInput) {
  const financial = calculateFinancialScore(input);
  const health = calculateHealthScore(input);
  const skills = calculateSkillsScore(input);
  const mobility = calculateMobilityScore(input);
  const psychological = calculatePsychologicalScore(input);
  const resources = calculateResourcesScore(input);

  const overall = Math.round(
    financial * 0.25 +
    health * 0.15 +
    skills * 0.20 +
    mobility * 0.15 +
    psychological * 0.15 +
    resources * 0.10
  );

  return { overall, financial, health, skills, mobility, psychological, resources };
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

function calculatePsychologicalScore(input: AssessmentInput): number {
  return Math.round((input.psychologicalResilience / 10) * 100);
}

function calculateResourcesScore(input: AssessmentInput): number {
  let score = 0;

  if (input.hasEmergencySupplies) score += 50;

  const financialSkill = input.skills.includes("financial") ? 20 : 0;
  const survivalSkill = input.skills.includes("survival") ? 30 : 0;
  score += financialSkill + survivalSkill;

  return Math.min(100, score);
}
