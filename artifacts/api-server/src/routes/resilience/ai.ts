import { openai } from "@workspace/integrations-openai-ai-server";

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
};

export async function generateResilienceReport(
  input: AssessmentInput,
  scores: Scores
): Promise<ReportContent> {
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
  ]
}

Requirements:
- Short-term: 3-5 items (within 30 days)
- Mid-term: 3-5 items (1-6 months)
- Long-term: 3-5 items (6+ months)
- Scenario simulations: cover the top 3 risk concerns from the user's list
- Daily habits: 6-8 habits across different categories
- Voice: intelligent, grounded, strategic, empowering (not alarmist)
- Be specific to the user's actual situation, not generic

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
