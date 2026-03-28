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
  currency?: string;
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

type RecommendedResource = {
  title: string;
  category: string;
  description: string;
  url: string;
  badge: string;
  priority: "critical" | "high" | "medium" | "low";
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
  recommendedResources: RecommendedResource[];
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
- Preferred currency: ${input.currency ?? "USD"} (use this currency symbol and amounts in all financial advice and examples)

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
  },
  "recommendedResources": [
    {
      "title": "resource name",
      "category": "Emergency Prep|Financial|Health|Skills|Psychological|Community|Legal",
      "description": "why this resource is specifically relevant to this user's situation, location, and gaps",
      "url": "https://actual-url.org",
      "badge": "Free|Guide|Course|Tool|Contact",
      "priority": "critical|high|medium|low"
    }
  ]
}

Requirements:
- Short-term: 3-5 items (within 30 days)
- Mid-term: 3-5 items (1-6 months)
- Long-term: 3-5 items (6+ months)
- Scenario simulations: cover the top 3 risk concerns from the user's list
- Daily habits: 6-8 habits across different categories
- checklistsByArea: 4-8 items per area, ordered by priority descending (critical first). All item ids must be unique within their area (use area_1, area_2, etc.)
- recommendedResources: 6-8 resources ordered by priority (critical first), personalized as follows:
  * LOCATION-SPECIFIC: Include the national/regional emergency management agency, civil protection authority, and emergency contact number for the user's country/region. E.g., FEMA + ready.gov for USA; Civil Protection / IGSU + 112 for Romania; NHS + GOV.UK emergency prep for UK; AEMET/Protección Civil for Spain; etc.
  * DISASTER-SPECIFIC: For each of the user's top risk concerns (e.g., earthquake, flood, pandemic, economic collapse, cyberattack), include the most authoritative regional resource addressing that specific threat.
  * GAP-TARGETED: Include 2-3 resources directly addressing the user's lowest-scoring dimensions (financial tools for low financial score, mental health resources for low psychological score, first aid/medical courses for low health score, skills training for low skills score).
  * CHECKLIST-SUPPORTING: Include at least one resource that helps the user fulfill critical checklist items they likely haven't completed yet (e.g., emergency supply kit builder, 72-hour kit guide, financial resilience workbook).
  * Use real, working URLs. Prefer free government/NGO resources. Include paid courses only if they are uniquely valuable.
  * priority reflects urgency for this specific user (critical = addresses their most critical vulnerability).
- Voice: intelligent, grounded, strategic, empowering (not alarmist)
- Be specific to the user's actual situation, not generic
- Checklist items MUST reflect the ${pathway} pathway — ${pathway === "growth" ? "challenge-oriented, ambitious" : "scaffolded, confidence-building"}

LANGUAGE RULES — strictly enforce in all narrative text:
- Never write raw score labels like "your resources score," "skills score of 20," "low financial score," etc. Instead refer to what the dimension means: "your emergency supply depth," "your practical skill set," "your financial buffer," etc.
- Never use jargon shorthand like "pipeline sprint," "cyber hardening sprint," "no-infrastructure kit," "skills stack," or similar corporate/tech phrases. Use plain everyday language instead.
- Write at an accessible reading level. Avoid unexplained acronyms. Aim to be understood by any adult regardless of education level.

EMPATHY RULES — apply to riskProfileSummary and action plan framing:
- Always acknowledge at least one genuine strength before discussing vulnerabilities.
- If the user has dependents: acknowledge the dual weight of protecting both self and family before prescribing action.
- If income is unstable or savings < 2 months: validate the psychological difficulty of financial uncertainty before recommending financial steps.
- If health is poor or mobility is low: do not recommend self-directed physical tasks. Suggest assisted, digital, or community-based alternatives.
- If the psychological score is below 45: begin the riskProfileSummary by recognising resilience shown under difficulty — lead with what is working, not what is missing.
- If the user's location or risk concerns suggest recent immigration or displacement: do not assume full access to government services or stable legal status. Prioritise NGO and community organisation resources.
- For high-stress profiles (single parents, students with debt, low-income renters): validate stress and time constraints explicitly before listing actions. Frame actions as "one at a time" rather than a comprehensive programme.
- If the user has strong specific skills (medical, military, technical, languages): explicitly name these as resilience assets in the summary — they are often undersold by users themselves.

COMMUNITY RESOURCES — apply when relevant:
- For users with low mobility, low income, or likely language barriers: include at least 2 resources in recommendedResources that are accessible without physical travel or significant cost (phone hotlines, online portals, community organisations, government benefit finders).
- For users in financial hardship (savings < 2 months and unstable income): include at least one resource for emergency financial assistance, food security, or housing support relevant to their location.

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
