import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { SubmitAssessmentBody, GetReportParams } from "@workspace/api-zod";
import { db, resilienceReportsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { calculateScores } from "./scoring.js";
import { generateResilienceReport } from "./ai.js";

const router: IRouter = Router();

router.post("/assess", async (req, res) => {
  try {
    const parseResult = SubmitAssessmentBody.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Invalid assessment input: " + parseResult.error.message,
      });
      return;
    }

    const input = parseResult.data;
    const scores = calculateScores({
      location: input.location,
      incomeStability: input.incomeStability,
      savingsMonths: input.savingsMonths,
      hasDependents: input.hasDependents,
      skills: input.skills as string[],
      healthStatus: input.healthStatus,
      mobilityLevel: input.mobilityLevel,
      housingType: input.housingType,
      hasEmergencySupplies: input.hasEmergencySupplies,
      psychologicalResilience: input.psychologicalResilience,
      riskConcerns: input.riskConcerns as string[],
    });

    const reportContent = await generateResilienceReport(
      {
        location: input.location,
        incomeStability: input.incomeStability,
        savingsMonths: input.savingsMonths,
        hasDependents: input.hasDependents,
        skills: input.skills as string[],
        healthStatus: input.healthStatus,
        mobilityLevel: input.mobilityLevel,
        housingType: input.housingType,
        hasEmergencySupplies: input.hasEmergencySupplies,
        psychologicalResilience: input.psychologicalResilience,
        riskConcerns: input.riskConcerns as string[],
      },
      scores
    );

    const reportId = randomUUID();
    const now = new Date();

    await db.insert(resilienceReportsTable).values({
      reportId,
      sessionId: input.sessionId ?? null,
      location: input.location,
      incomeStability: input.incomeStability,
      savingsMonths: input.savingsMonths,
      hasDependents: input.hasDependents,
      skills: input.skills,
      healthStatus: input.healthStatus,
      mobilityLevel: input.mobilityLevel,
      housingType: input.housingType,
      hasEmergencySupplies: input.hasEmergencySupplies,
      psychologicalResilience: input.psychologicalResilience,
      riskConcerns: input.riskConcerns,
      scoreOverall: scores.overall,
      scoreFinancial: scores.financial,
      scoreHealth: scores.health,
      scoreSkills: scores.skills,
      scoreMobility: scores.mobility,
      scorePsychological: scores.psychological,
      scoreResources: scores.resources,
      riskProfileSummary: reportContent.riskProfileSummary,
      topVulnerabilities: reportContent.topVulnerabilities,
      actionPlan: reportContent.actionPlan,
      scenarioSimulations: reportContent.scenarioSimulations,
      dailyHabits: reportContent.dailyHabits,
      createdAt: now,
    });

    res.json({
      reportId,
      createdAt: now.toISOString(),
      score: {
        overall: scores.overall,
        financial: scores.financial,
        health: scores.health,
        skills: scores.skills,
        mobility: scores.mobility,
        psychological: scores.psychological,
        resources: scores.resources,
      },
      riskProfileSummary: reportContent.riskProfileSummary,
      topVulnerabilities: reportContent.topVulnerabilities,
      actionPlan: reportContent.actionPlan,
      scenarioSimulations: reportContent.scenarioSimulations,
      dailyHabits: reportContent.dailyHabits,
      input: {
        location: input.location,
        incomeStability: input.incomeStability,
        savingsMonths: input.savingsMonths,
        hasDependents: input.hasDependents,
        skills: input.skills,
        healthStatus: input.healthStatus,
        mobilityLevel: input.mobilityLevel,
        housingType: input.housingType,
        hasEmergencySupplies: input.hasEmergencySupplies,
        psychologicalResilience: input.psychologicalResilience,
        riskConcerns: input.riskConcerns,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Error generating resilience report");
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to generate resilience report. Please try again.",
    });
  }
});

router.get("/reports/:reportId", async (req, res) => {
  try {
    const parseResult = GetReportParams.safeParse(req.params);
    if (!parseResult.success) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Invalid report ID",
      });
      return;
    }

    const { reportId } = parseResult.data;

    const rows = await db
      .select()
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.reportId, reportId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Report not found",
      });
      return;
    }

    res.json({
      reportId: row.reportId,
      createdAt: row.createdAt.toISOString(),
      score: {
        overall: row.scoreOverall,
        financial: row.scoreFinancial,
        health: row.scoreHealth,
        skills: row.scoreSkills,
        mobility: row.scoreMobility,
        psychological: row.scorePsychological,
        resources: row.scoreResources,
      },
      riskProfileSummary: row.riskProfileSummary,
      topVulnerabilities: row.topVulnerabilities as string[],
      actionPlan: row.actionPlan,
      scenarioSimulations: row.scenarioSimulations,
      dailyHabits: row.dailyHabits,
      input: {
        location: row.location,
        incomeStability: row.incomeStability as "fixed" | "freelance" | "unstable",
        savingsMonths: row.savingsMonths,
        hasDependents: row.hasDependents,
        skills: row.skills as string[],
        healthStatus: row.healthStatus as "excellent" | "good" | "fair" | "poor",
        mobilityLevel: row.mobilityLevel as "high" | "medium" | "low",
        housingType: row.housingType as "own" | "rent" | "family" | "nomadic" | "other",
        hasEmergencySupplies: row.hasEmergencySupplies,
        psychologicalResilience: row.psychologicalResilience,
        riskConcerns: row.riskConcerns as string[],
      },
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching resilience report");
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to fetch report.",
    });
  }
});

export default router;
