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
  ageBracket?: string;
  incomeStability: string;
  savingsMonths: number;
  dependentCount?: number;
  hasDependents?: boolean;
  relocationReadiness?: string;
  skills: string[];
  healthStatus: string;
  mobilityLevel: string;
  housingType: string;
  hasEmergencySupplies?: boolean;
  emergencySupplyTier?: string;
  psychologicalResilience: number;
  riskConcerns: string[];
  currency?: string;
  chronicCondition?: string;
  trustedLocalContacts?: number;
  communityInvolvement?: string;
  mutualAidAccess?: boolean;
  primaryGoal?: string;
  successVision?: string;
};

type Scores = {
  overall: number;
  financial: number;
  health: number;
  skills: number;
  mobility: number;
  psychological: number;
  resources: number;
  socialCapital: number;
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
    socialCapital: ChecklistItem[];
  };
  recommendedResources: RecommendedResource[];
};

function describeEmergencyTier(tier?: string, legacy?: boolean): string {
  if (tier === "over_1month") return "over 1 month of emergency supplies";
  if (tier === "2weeks_1month") return "2 weeks to 1 month of emergency supplies";
  if (tier === "3_14days") return "3–14 days of emergency supplies";
  if (tier === "under_3days") return "under 3 days of emergency supplies";
  if (tier === "none") return "no emergency supplies";
  // legacy boolean
  if (legacy === true) return "at least 14 days of emergency supplies (legacy data)";
  return "emergency supply status unknown";
}

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

  const emergencyTierDesc = describeEmergencyTier(input.emergencySupplyTier, input.hasEmergencySupplies);
  const emergencyAdvice = input.emergencySupplyTier === "over_1month"
    ? "This user has excellent emergency supply depth — focus on optimization, rotation, and diversification rather than urgent stocking."
    : input.emergencySupplyTier === "2weeks_1month"
    ? "This user has a good emergency supply base — focus on filling gaps and extending to a full month where possible."
    : input.emergencySupplyTier === "3_14days"
    ? "This user has a modest emergency supply buffer — recommend extending to a 1-month supply as a near-term priority."
    : input.emergencySupplyTier === "under_3days"
    ? "URGENT: This user has under 3 days of emergency supplies — this is a critical vulnerability. Make stocking basic water, food, and medicines the single highest-priority near-term action."
    : input.emergencySupplyTier === "none"
    ? "CRITICAL: This user has no emergency supplies at all — treat this as the most urgent preparedness gap and make it the top short-term action."
    : "";

  const chronicHealthNote = input.chronicCondition === "yes"
    ? "IMPORTANT: The user has a chronic condition or disability affecting daily function. Do NOT recommend self-directed physical tasks such as manual labor, strenuous exercise drills, or physically demanding emergency preparations. Instead prioritize: assisted alternatives, digital preparation tools, professional support networks, and community-based resources. Note this explicitly in health checklist items."
    : "";

  const socialCapitalLevel = scores.socialCapital >= 70
    ? "strong"
    : scores.socialCapital >= 40
    ? "moderate"
    : "limited";

  const goalLabels: Record<string, string> = {
    job_security: "Worried about job loss or income instability",
    financial_independence: "Building financial independence",
    disaster_preparedness: "Preparing for natural disasters or emergencies",
    health_continuity: "Concerned about health crises for self or family",
    geopolitical_risk: "Preparing for political instability or conflict",
    general_resilience: "Want to be prepared for anything",
    life_transition: "Going through a major life transition",
  };
  const goalContext = input.primaryGoal
    ? `\nRESILIENCE GOAL: ${goalLabels[input.primaryGoal] ?? input.primaryGoal}. Tailor the plan, priorities, and framing to this specific goal.`
    : "";
  const successVisionContext = input.successVision
    ? `SUCCESS VISION (user's own words): "${input.successVision}". Reference this explicitly in the risk profile summary and ensure the plan is oriented toward achieving it.`
    : "";

  const prompt = `You are a resilience planning expert. Based on the following assessment, generate a structured resilience report.

USER PROFILE:
- Location: ${input.location}
- Age bracket: ${input.ageBracket ?? "not specified"}
- Income stability: ${input.incomeStability}
- Savings runway: ${input.savingsMonths} months
- Dependents: ${input.dependentCount === 0 ? "None" : input.dependentCount === 1 ? "One" : input.dependentCount === 2 ? "Two or three" : "Four or more"}
- Skills: ${input.skills.join(", ") || "none"}
- Health status: ${input.healthStatus}
- Chronic condition affecting daily function: ${input.chronicCondition ?? "not specified"}
- Mobility level: ${input.mobilityLevel}
- Housing type: ${input.housingType}
- Emergency supplies: ${emergencyTierDesc}
- Psychological resilience (self-rated): ${input.psychologicalResilience}/10
- Primary risk concerns: ${input.riskConcerns.join(", ")}
- Preferred currency: ${input.currency ?? "USD"} (use this currency symbol and amounts in all financial advice and examples)
- Social network: trusted contacts ${input.trustedLocalContacts ?? "unspecified"}, community involvement: ${input.communityInvolvement ?? "unspecified"}, community support access: ${input.mutualAidAccess ?? "unspecified"}
${goalContext}
${successVisionContext}

RESILIENCE SCORES (0-100):
- Overall: ${scores.overall}
- Financial: ${scores.financial}
- Health: ${scores.health}
- Skills: ${scores.skills}
- Mobility: ${scores.mobility}
- Psychological: ${scores.psychological}
- Resources: ${scores.resources}
- Social Capital: ${scores.socialCapital} (${socialCapitalLevel} community/network strength)

MENTAL RESILIENCE PATHWAY:
${pathwayContext}
${interdependenceContext}

EMERGENCY SUPPLIES GUIDANCE:
${emergencyAdvice}

CHRONIC HEALTH GUIDANCE:
${chronicHealthNote}

PURCHASING POWER PARITY (PPP) NOTE:
When giving financial advice with specific numbers (e.g., savings targets, emergency fund months, spending thresholds), you MUST contextualise these to the user's location. What "3 months of savings" means in Lagos, Nairobi, or Bucharest is fundamentally different from what it means in London, Sydney, or New York. Adjust all monetary benchmarks, timeframes, and cost references to reflect the local cost of living, not a Western urban baseline. If the user's currency or location suggests a lower cost-of-living context, your financial targets and examples should reflect that reality — not imported numbers from high-cost economies.

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
    ],
    "socialCapital": [
      {"id": "socialCapital_1", "title": "item title", "description": "specific actionable description", "priority": "critical|high|medium|low", "pathway": "${pathway}"}
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
- checklistsByArea: 4-8 items per area, ordered by priority descending (critical first). All item ids must be unique within their area (use area_1, area_2, etc.). Include socialCapital checklist items that are specific to the user's community network strength (${socialCapitalLevel}).
- recommendedResources: 6-8 resources ordered by priority (critical first), personalized as follows:
  * LOCATION-SPECIFIC: Include the national/regional emergency management agency, civil protection authority, and emergency contact number for the user's country/region. E.g., FEMA + ready.gov for USA; Civil Protection / IGSU + 112 for Romania; NHS + GOV.UK emergency prep for UK; AEMET/Protección Civil for Spain; etc.
  * DISASTER-SPECIFIC: For each of the user's top risk concerns (e.g., earthquake, flood, pandemic, economic collapse, cyberattack), include the most authoritative regional resource addressing that specific threat.
  * GAP-TARGETED: Include 2-3 resources directly addressing the user's lowest-scoring dimensions (financial tools for low financial score, mental health resources for low psychological score, first aid/medical courses for low health score, skills training for low skills score, community organizations for low social capital score).
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
- If health is poor or mobility is low OR the user has a chronic condition: do not recommend self-directed physical tasks. Suggest assisted, digital, or community-based alternatives.
- If the psychological score is below 45: begin the riskProfileSummary by recognizing resilience shown under difficulty — lead with what is working, not what is missing.
- If the user's location or risk concerns suggest recent immigration or displacement: do not assume full access to government services or stable legal status. Prioritize NGO and community organization resources.
- For high-stress profiles (single parents, students with debt, low-income renters): validate stress and time constraints explicitly before listing actions. Frame actions as "one at a time" rather than a comprehensive program.
- If the user has strong specific skills (medical, military, technical, languages): explicitly name these as resilience assets in the summary — they are often undersold by users themselves.
- If the user lives with family or friends: acknowledge this as a genuine resilience asset — shared housing can mean shared resources, mutual support, and lower individual cost burden. Do not frame it as a vulnerability unless combined with other clear risk factors.

CULTURAL FRAMING — mental resilience and social strength:
- When discussing mental resilience strengths, frame them in BOTH individual AND community/collective terms. E.g., instead of "you have good personal coping skills", also reference "your ability to lean on and give support to those around you" where relevant.
- Acknowledge that resilience takes different forms in different cultural contexts — for some people, community bonds, family interdependence, and collective problem-solving are primary resilience strategies, not secondary ones.
- For users with strong social capital or family/community networks: explicitly name this as a core resilience dimension in the summary, not an afterthought.
- For users in collectivist-leaning cultural contexts (suggested by location such as sub-Saharan Africa, South/Southeast Asia, Eastern Europe, Latin America, Middle East): apply extra weight to community-based recommendations and community support strategies in the action plan and checklist.

COMMUNITY RESOURCES — apply when relevant:
- For users with low mobility, low income, or likely language barriers: include at least 2 resources in recommendedResources that are accessible without physical travel or significant cost (phone hotlines, online portals, community organizations, government benefit finders).
- For users in financial hardship (savings < 2 months and unstable income): include at least one resource for emergency financial assistance, food security, or housing support relevant to their location.

Return ONLY the JSON, no additional text.`;

  const callAI = async (): Promise<ReportContent> => {
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
    if (!content) throw new Error("No content returned from AI");

    const parsed = JSON.parse(content) as ReportContent;
    if (!parsed.riskProfileSummary || !parsed.actionPlan) {
      throw new Error("AI response missing required fields");
    }
    return parsed;
  };

  try {
    return await callAI();
  } catch (firstErr) {
    await new Promise(r => setTimeout(r, 1500));
    return await callAI();
  }
}

export async function generateGuidedSteps(opts: {
  itemTitle: string;
  itemDescription: string;
  area: string;
  location: string;
  primaryGoal?: string | null;
  successVision?: string | null;
  incomeStability: string;
  savingsMonths: number;
  healthStatus?: string | null;
  currency?: string | null;
}): Promise<string[]> {
  const goalLabels: Record<string, string> = {
    job_security: "Job & income security",
    financial_independence: "Financial independence",
    disaster_preparedness: "Disaster & emergency preparedness",
    health_continuity: "Health continuity",
    geopolitical_risk: "Geopolitical & conflict risk",
    general_resilience: "General preparedness",
    life_transition: "Major life transition",
  };

  const prompt = `You are a resilience planning expert helping someone take concrete action on their resilience plan.

USER CONTEXT:
- Location: ${opts.location}
- Income stability: ${opts.incomeStability}
- Savings runway: ${opts.savingsMonths} months
- Health: ${opts.healthStatus ?? "not specified"}
- Goal: ${opts.primaryGoal ? (goalLabels[opts.primaryGoal] ?? opts.primaryGoal) : "general resilience"}
${opts.successVision ? `- Success vision: "${opts.successVision}"` : ""}
- Currency: ${opts.currency ?? "USD"}

CHECKLIST ITEM TO EXPAND:
Area: ${opts.area}
Title: ${opts.itemTitle}
Description: ${opts.itemDescription}

Generate 4 to 7 specific, actionable sub-steps to complete this checklist item. Requirements:
- Each sub-step must be concrete and immediately actionable (not vague guidance)
- Adapt to the user's location (${opts.location}) — name real services, portals, organizations, or tools where possible
- Steps must be ordered logically (each builds on the previous)
- Keep each step to 1–2 sentences maximum
- Write in second-person ("Go to...", "Open...", "Set up...", "Contact...")
- Tailor the urgency and framing to their goal: ${opts.primaryGoal ? (goalLabels[opts.primaryGoal] ?? opts.primaryGoal) : "general preparedness"}
- Do not start every step with "Step N:" — write naturally

Return ONLY a JSON object with this exact shape: {"steps": ["step text here", "step text here"]}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    max_completion_tokens: 1024,
    messages: [
      { role: "system", content: "You are a resilience planning expert. Respond with valid JSON only." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No content from AI");

  const parsed = JSON.parse(content) as { steps?: string[] };
  if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    throw new Error("AI returned invalid steps format");
  }
  return parsed.steps.slice(0, 7);
}
