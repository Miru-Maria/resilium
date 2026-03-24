import { openai } from "@workspace/integrations-openai-ai-server";

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
  incomeStability: string;
  savingsMonths: number;
  hasDependents: boolean;
  skills: string[];
  healthStatus: string;
  mobilityLevel: string;
  housingType: string;
  hasEmergencySupplies: boolean;
  psychologicalResilience: number;
  riskConcerns: string[];
};

type Scores = {
  overall: number;
  financial: number;
  health: number;
  skills: number;
  mobility: number;
  psychological: number;
  resources: number;
};

type ActionItem = {
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
};

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  pathway: "growth" | "compensation";
};

type ScenarioSimulation = {
  scenario: string;
  impact: "severe" | "high" | "moderate" | "low";
  description: string;
  immediateSteps: string[];
  timeToRecover: string;
};

type DailyHabit = {
  habit: string;
  frequency: "daily" | "weekly" | "monthly";
  category: string;
};

type ReportContent = {
  riskProfileSummary: string;
  topVulnerabilities: string[];
  actionPlan: {
    shortTerm: ActionItem[];
    midTerm: ActionItem[];
    longTerm: ActionItem[];
  };
  scenarioSimulations: ScenarioSimulation[];
  dailyHabits: DailyHabit[];
  checklistsByArea: {
    financial: ChecklistItem[];
    health: ChecklistItem[];
    skills: ChecklistItem[];
    mobility: ChecklistItem[];
    psychological: ChecklistItem[];
    resources: ChecklistItem[];
  };
};

export async function generateResilienceReport(
  input: AssessmentInput,
  scores: Scores,
  mentalResilienceSubScores: MentalResilienceSubScores | null
): Promise<ReportContent> {
  const pathway = mentalResilienceSubScores?.pathway ?? "compensation";
  const mrComposite = mentalResilienceSubScores?.composite ?? Math.round((input.psychologicalResilience / 10) * 100);

  const pathwayContext = pathway === "growth"
    ? `The user has a HIGH mental resilience composite (${mrComposite}/100) — use a GROWTH pathway. Checklist items should be ambitious, challenge-oriented, and push the user toward capability expansion. Frame tasks as opportunities.`
    : `The user has a LOWER mental resilience composite (${mrComposite}/100) — use a COMPENSATION pathway. Checklist items should be emotionally scaffolded, confidence-building, and broken into small achievable steps. Prioritize quick wins. Frame tasks as safety-building.`;

  const interdependenceContext = scores.financial < 40 && scores.psychological < 50
    ? "IMPORTANT: The user has both critical financial vulnerability AND low psychological resilience. Financial checklist items must include emotionally-scaffolded steps (e.g., 'take one small financial action per week' rather than 'build 6-month emergency fund immediately'). Psychological pressure from financial stress is compounding — acknowledge this explicitly in relevant items."
    : "";

  const prompt = `You are a resilience planning expert. Based on the following assessment, generate a structured resilience report.

USER PROFILE:
- Location: ${input.location}
- Income stability: ${input.incomeStability}
- Savings runway: ${input.savingsMonths} months
- Has dependents: ${input.hasDependents}
- Skills: ${input.skills.join(", ") || "none"}
- Health status: ${input.healthStatus}
- Mobility level: ${input.mobilityLevel}
- Housing type: ${input.housingType}
- Has emergency supplies: ${input.hasEmergencySupplies}
- Psychological resilience (self-rated): ${input.psychologicalResilience}/10
- Primary risk concerns: ${input.riskConcerns.join(", ")}

RESILIENCE SCORES (0-100):
- Overall: ${scores.overall}
- Financial: ${scores.financial}
- Health: ${scores.health}
- Skills: ${scores.skills}
- Mobility: ${scores.mobility}
- Psychological: ${scores.psychological}
- Resources: ${scores.resources}

MENTAL RESILIENCE PATHWAY:
${pathwayContext}
${interdependenceContext}

Generate a JSON response with this exact structure:
{
  "riskProfileSummary": "2-3 sentence honest but empowering assessment of the user's overall risk profile. Be grounded and strategic, not alarming.",
  "topVulnerabilities": ["vulnerability 1", "vulnerability 2", "vulnerability 3", "vulnerability 4", "vulnerability 5"],
  "actionPlan": {
    "shortTerm": [
      {"title": "action title", "description": "specific actionable description", "priority": "critical|high|medium|low", "category": "financial|health|skills|resources|social|legal"}
    ],
    "midTerm": [
      {"title": "action title", "description": "specific actionable description", "priority": "critical|high|medium|low", "category": "financial|health|skills|resources|social|legal"}
    ],
    "longTerm": [
      {"title": "action title", "description": "specific actionable description", "priority": "critical|high|medium|low", "category": "financial|health|skills|resources|social|legal"}
    ]
  },
  "scenarioSimulations": [
    {
      "scenario": "Job Loss",
      "impact": "severe|high|moderate|low",
      "description": "2-3 sentences on how this scenario would affect this specific user",
      "immediateSteps": ["step 1", "step 2", "step 3"],
      "timeToRecover": "e.g., 3-6 months"
    }
  ],
  "dailyHabits": [
    {"habit": "specific habit", "frequency": "daily|weekly|monthly", "category": "financial|health|skills|mental|social"}
  ],
  "checklistsByArea": {
    "financial": [
      {"id": "financial_1", "title": "item title", "description": "specific actionable description", "priority": "critical|high|medium|low", "pathway": "${pathway}"}
    ],
    "health": [
      {"id": "health_1", "title": "item title", "description": "specific actionable description", "priority": "critical|high|medium|low", "pathway": "${pathway}"}
    ],
    "skills": [
      {"id": "skills_1", "title": "item title", "description": "specific actionable description", "priority": "critical|high|medium|low", "pathway": "${pathway}"}
    ],
    "mobility": [
      {"id": "mobility_1", "title": "item title", "description": "specific actionable description", "priority": "critical|high|medium|low", "pathway": "${pathway}"}
    ],
    "psychological": [
      {"id": "psychological_1", "title": "item title", "description": "specific actionable description", "priority": "critical|high|medium|low", "pathway": "${pathway}"}
    ],
    "resources": [
      {"id": "resources_1", "title": "item title", "description": "specific actionable description", "priority": "critical|high|medium|low", "pathway": "${pathway}"}
    ]
  }
}

Requirements:
- Short-term: 3-5 items (within 30 days)
- Mid-term: 3-5 items (1-6 months)
- Long-term: 3-5 items (6+ months)
- Scenario simulations: cover the top 3 risk concerns from the user's list
- Daily habits: 6-8 habits across different categories
- checklistsByArea: 4-8 items per area, ordered by priority descending (critical first). All item ids must be unique within their area (use area_1, area_2, etc.)
- Voice: intelligent, grounded, strategic, empowering (not alarmist)
- Be specific to the user's actual situation, not generic
- Checklist items MUST reflect the ${pathway} pathway — ${pathway === "growth" ? "challenge-oriented, ambitious" : "scaffolded, confidence-building"}

Return ONLY the JSON, no additional text.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: "You are a resilience planning expert. Always respond with valid JSON only." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from AI");
  }

  return JSON.parse(content) as ReportContent;
}
