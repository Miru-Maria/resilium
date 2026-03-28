import { Router } from "express";
import { db, resilienceReportsTable, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { logger } from "../../lib/logger.js";
import rateLimit from "express-rate-limit";

const router = Router();

const scenarioRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "RATE_LIMITED", message: "Too many scenario requests. Please wait." },
});

const BodySchema = z.object({
  scenario: z.enum(["job_loss", "health_crisis", "natural_disaster", "relocation"]),
  parameters: z.object({
    unemploymentMonths: z.number().min(1).max(24).optional(),
    medicalSeverity: z.enum(["mild", "moderate", "severe"]).optional(),
    disasterType: z.enum(["flood", "earthquake", "wildfire", "hurricane"]).optional(),
    destinationRisk: z.enum(["low", "medium", "high"]).optional(),
    relocationType: z.enum(["domestic", "international"]).optional(),
  }).optional().default({}),
});

const SCENARIO_LABELS: Record<string, string> = {
  job_loss: "Sudden Job Loss",
  health_crisis: "Major Health Crisis",
  natural_disaster: "Natural Disaster",
  relocation: "Emergency Relocation",
};

router.post("/scenarios/:reportId", scenarioRateLimit, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required for scenario analysis" });
  }

  const { reportId } = req.params;
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const { scenario, parameters } = parsed.data;

  try {
    // Verify Pro subscription
    const [sub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, userId))
      .limit(1);

    const isPro = sub && (sub.status === "active" || sub.status === "cancel_scheduled");
    const isExpired = sub?.currentPeriodEnd ? sub.currentPeriodEnd < new Date() : false;

    if (!isPro || isExpired) {
      return res.status(403).json({ error: "PRO_REQUIRED", message: "Scenario stress-tests require a Pro subscription." });
    }

    // Fetch report
    const [report] = await db
      .select()
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.reportId, reportId))
      .limit(1);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Build scenario context
    const scenarioLabel = SCENARIO_LABELS[scenario];
    let scenarioContext = "";

    if (scenario === "job_loss") {
      const months = parameters?.unemploymentMonths ?? 3;
      scenarioContext = `The user loses their primary income source for ${months} months (unemployment duration). They have ${report.savingsMonths} months of savings currently. Income stability was "${report.incomeStability}".`;
    } else if (scenario === "health_crisis") {
      const severity = parameters?.medicalSeverity ?? "moderate";
      scenarioContext = `The user experiences a ${severity} health crisis that may prevent work for weeks or months. Current health status: "${report.healthStatus}". They ${report.hasDependents ? "have" : "do not have"} dependents.`;
    } else if (scenario === "natural_disaster") {
      const type = parameters?.disasterType ?? "flood";
      scenarioContext = `A ${type} occurs in or near the user's area (${report.location}). Housing type: ${report.housingType}. They ${report.hasEmergencySupplies ? "have" : "do not have"} emergency supplies. Mobility level: ${report.mobilityLevel}.`;
    } else if (scenario === "relocation") {
      const type = parameters?.relocationType ?? "domestic";
      const destRisk = parameters?.destinationRisk ?? "medium";
      scenarioContext = `The user must relocate ${type === "international" ? "internationally" : "domestically"} to a ${destRisk}-risk area, potentially under pressure. They ${report.hasEmergencySupplies ? "have" : "do not have"} emergency supplies. Housing: ${report.housingType}. Skills: ${(report.skills as string[]).join(", ")}.`;
    }

    const profileSummary = `
Current resilience profile:
- Location: ${report.location}
- Overall score: ${Math.round(report.scoreOverall)}/100
- Financial: ${Math.round(report.scoreFinancial)}/100 (income: ${report.incomeStability}, savings: ${report.savingsMonths} months)
- Health: ${Math.round(report.scoreHealth)}/100 (status: ${report.healthStatus})
- Skills: ${Math.round(report.scoreSkills)}/100 (${(report.skills as string[]).slice(0, 4).join(", ")})
- Mobility: ${Math.round(report.scoreMobility)}/100 (housing: ${report.housingType}, mobility: ${report.mobilityLevel})
- Psychological: ${Math.round(report.scorePsychological)}/100
- Resources: ${Math.round(report.scoreResources)}/100 (supplies: ${report.hasEmergencySupplies ? "yes" : "no"})
- Dependents: ${report.hasDependents ? "yes" : "no"}
- Risk concerns: ${(report.riskConcerns as string[]).join(", ")}
`;

    const prompt = `You are a resilience analyst. Analyze the impact of a scenario on this person's resilience profile.

${profileSummary}

Scenario: ${scenarioLabel}
${scenarioContext}

Respond with a JSON object with exactly this structure:
{
  "scenarioLabel": "${scenarioLabel}",
  "overallImpact": "severe" | "high" | "moderate" | "low",
  "scenarioSummary": "2-3 sentence summary of how this scenario affects this specific person based on their profile",
  "scoreDelta": {
    "overall": <integer -30 to 0>,
    "financial": <integer -40 to 0>,
    "health": <integer -30 to 0>,
    "skills": <integer -10 to 5>,
    "mobility": <integer -30 to 0>,
    "psychological": <integer -25 to 0>,
    "resources": <integer -25 to 0>
  },
  "criticalWeaknesses": ["string", "string", "string"],
  "protectiveFactors": ["string", "string"],
  "immediateActions": [
    { "title": "string", "description": "string", "urgency": "immediate" | "within_24h" | "within_week" },
    { "title": "string", "description": "string", "urgency": "immediate" | "within_24h" | "within_week" },
    { "title": "string", "description": "string", "urgency": "immediate" | "within_24h" | "within_week" },
    { "title": "string", "description": "string", "urgency": "immediate" | "within_24h" | "within_week" },
    { "title": "string", "description": "string", "urgency": "immediate" | "within_24h" | "within_week" }
  ],
  "recoveryTimeline": "string (e.g. '3-6 months with immediate action')",
  "preEmptiveActions": ["string (what to do NOW before this scenario occurs)", "string", "string"]
}

Make score deltas specific to the user's profile — a person with $0 savings experiences a much larger financial delta than one with 12 months of runway.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 1500,
    });

    const content = completion.choices[0].message.content ?? "{}";
    let result: any;
    try {
      result = JSON.parse(content);
    } catch {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    // Clamp score deltas
    const originalScores = {
      overall: Math.round(report.scoreOverall),
      financial: Math.round(report.scoreFinancial),
      health: Math.round(report.scoreHealth),
      skills: Math.round(report.scoreSkills),
      mobility: Math.round(report.scoreMobility),
      psychological: Math.round(report.scorePsychological),
      resources: Math.round(report.scoreResources),
    };

    const delta = result.scoreDelta ?? {};
    const projectedScores = Object.fromEntries(
      Object.entries(originalScores).map(([key, val]) => [
        key,
        Math.max(0, Math.min(100, val + (delta[key] ?? 0))),
      ])
    );

    return res.json({
      scenario,
      scenarioLabel: result.scenarioLabel ?? scenarioLabel,
      overallImpact: result.overallImpact ?? "high",
      scenarioSummary: result.scenarioSummary ?? "",
      originalScores,
      scoreDelta: delta,
      projectedScores,
      criticalWeaknesses: result.criticalWeaknesses ?? [],
      protectiveFactors: result.protectiveFactors ?? [],
      immediateActions: result.immediateActions ?? [],
      recoveryTimeline: result.recoveryTimeline ?? "",
      preEmptiveActions: result.preEmptiveActions ?? [],
    });

  } catch (err) {
    logger.error({ err }, "Scenario analysis failed");
    return res.status(500).json({ error: "Scenario analysis failed" });
  }
});

export default router;
