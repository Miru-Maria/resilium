import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { SubmitAssessmentBody, GetReportParams } from "@workspace/api-zod";
import { db, resilienceReportsTable, checklistProgressTable, progressSnapshotsTable, subscriptionsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { calculateScores } from "./scoring.js";
import { generateResilienceReport } from "./ai.js";
import { PLAN_LIMIT } from "../users.js";
import rateLimit from "express-rate-limit";
import scenariosRouter from "./scenarios.js";

const router: IRouter = Router();

const VALID_CURRENCIES = ["USD", "EUR", "RON"] as const;
type SupportedCurrency = typeof VALID_CURRENCIES[number];

function parseCurrency(value: unknown): SupportedCurrency {
  if (typeof value === "string" && (VALID_CURRENCIES as readonly string[]).includes(value)) {
    return value as SupportedCurrency;
  }
  return "USD";
}

const assessRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "RATE_LIMITED",
    message: "Too many assessment requests. Please wait a minute before trying again.",
  },
  skip: (req) => !!(req as any).isAuthenticated?.(),
});

router.post("/assess", assessRateLimit, async (req, res) => {
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

    if (req.isAuthenticated()) {
      const [{ planCount }] = await db
        .select({ planCount: count() })
        .from(resilienceReportsTable)
        .where(eq(resilienceReportsTable.userId, req.user.id));

      const subs = await db
        .select({ status: subscriptionsTable.status })
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.userId, req.user.id))
        .limit(1);

      const isSubscriber = subs.length > 0 && (subs[0].status === "active" || subs[0].status === "cancel_scheduled");

      if (!isSubscriber && planCount >= PLAN_LIMIT) {
        res.status(400).json({
          error: "PLAN_LIMIT_EXCEEDED",
          message: `You have reached the maximum of ${PLAN_LIMIT} saved plans. Upgrade to Pro for unlimited access.`,
        });
        return;
      }
    }
    const scoreResult = calculateScores({
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
      mentalResilienceAnswers: input.mentalResilienceAnswers ?? undefined,
    });

    const { mentalResilienceSubScores, ...scores } = scoreResult;

    const currency = parseCurrency(req.body.currency);

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
        currency,
      },
      scores,
      mentalResilienceSubScores
    );

    const reportId = randomUUID();
    const now = new Date();

    await db.insert(resilienceReportsTable).values({
      reportId,
      sessionId: input.sessionId ?? null,
      userId: req.isAuthenticated() ? req.user.id : null,
      currency: currency,
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
      mrStressTolerance: mentalResilienceSubScores?.stressTolerance ?? null,
      mrAdaptability: mentalResilienceSubScores?.adaptability ?? null,
      mrLearningAgility: mentalResilienceSubScores?.learningAgility ?? null,
      mrChangeManagement: mentalResilienceSubScores?.changeManagement ?? null,
      mrEmotionalRegulation: mentalResilienceSubScores?.emotionalRegulation ?? null,
      mrSocialSupport: mentalResilienceSubScores?.socialSupport ?? null,
      mrComposite: mentalResilienceSubScores?.composite ?? null,
      mrPathway: mentalResilienceSubScores?.pathway ?? null,
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
      checklistsByArea: reportContent.checklistsByArea ?? null,
      recommendedResources: reportContent.recommendedResources ?? null,
      createdAt: now,
    });

    // Save a progress snapshot if sessionId is provided
    if (input.sessionId) {
      await db.insert(progressSnapshotsTable).values({
        sessionId: input.sessionId,
        reportId,
        snapshotAt: now,
        scoreOverall: scores.overall,
        scoreFinancial: scores.financial,
        scoreHealth: scores.health,
        scoreSkills: scores.skills,
        scoreMobility: scores.mobility,
        scorePsychological: scores.psychological,
        scoreResources: scores.resources,
        mrComposite: mentalResilienceSubScores?.composite ?? null,
      });
    }

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
      mentalResilienceProfile: mentalResilienceSubScores ?? undefined,
      riskProfileSummary: reportContent.riskProfileSummary,
      topVulnerabilities: reportContent.topVulnerabilities,
      actionPlan: reportContent.actionPlan,
      scenarioSimulations: reportContent.scenarioSimulations,
      dailyHabits: reportContent.dailyHabits,
      checklistsByArea: reportContent.checklistsByArea ?? undefined,
      recommendedResources: reportContent.recommendedResources ?? undefined,
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
        sessionId: input.sessionId,
        mentalResilienceAnswers: input.mentalResilienceAnswers,
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

router.get("/my-reports", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Sign in to access your reports." });
    return;
  }
  try {
    const rows = await db
      .select({
        reportId: resilienceReportsTable.reportId,
        createdAt: resilienceReportsTable.createdAt,
        scoreOverall: resilienceReportsTable.scoreOverall,
        scoreFinancial: resilienceReportsTable.scoreFinancial,
        scoreHealth: resilienceReportsTable.scoreHealth,
        scoreSkills: resilienceReportsTable.scoreSkills,
        scoreMobility: resilienceReportsTable.scoreMobility,
        scorePsychological: resilienceReportsTable.scorePsychological,
        scoreResources: resilienceReportsTable.scoreResources,
        location: resilienceReportsTable.location,
        riskProfileSummary: resilienceReportsTable.riskProfileSummary,
      })
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.userId, req.user.id))
      .orderBy(resilienceReportsTable.createdAt);

    res.json({ reports: rows.map(r => ({
      reportId: r.reportId,
      createdAt: r.createdAt.toISOString(),
      location: r.location,
      riskProfileSummary: r.riskProfileSummary,
      score: {
        overall: r.scoreOverall,
        financial: r.scoreFinancial,
        health: r.scoreHealth,
        skills: r.scoreSkills,
        mobility: r.scoreMobility,
        psychological: r.scorePsychological,
        resources: r.scoreResources,
      },
    })) });
  } catch (err) {
    req.log.error({ err }, "Error fetching user reports");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch reports." });
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

    const mentalResilienceProfile = row.mrComposite != null ? {
      stressTolerance: row.mrStressTolerance ?? 0,
      adaptability: row.mrAdaptability ?? 0,
      learningAgility: row.mrLearningAgility ?? 0,
      changeManagement: row.mrChangeManagement ?? 0,
      emotionalRegulation: row.mrEmotionalRegulation ?? 0,
      socialSupport: row.mrSocialSupport ?? 0,
      composite: row.mrComposite,
      pathway: (row.mrPathway as "growth" | "compensation") ?? "compensation",
    } : undefined;

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
      mentalResilienceProfile,
      riskProfileSummary: row.riskProfileSummary,
      topVulnerabilities: row.topVulnerabilities as string[],
      actionPlan: row.actionPlan,
      scenarioSimulations: row.scenarioSimulations,
      dailyHabits: row.dailyHabits,
      checklistsByArea: row.checklistsByArea ?? undefined,
      recommendedResources: (row as any).recommendedResources ?? undefined,
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

// GET /resilience/reports/:reportId/checklists
router.get("/reports/:reportId/checklists", async (req, res) => {
  try {
    const reportId = req.params.reportId;
    if (!reportId) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "Missing reportId" });
      return;
    }

    const progress = await db
      .select()
      .from(checklistProgressTable)
      .where(eq(checklistProgressTable.reportId, reportId));

    res.json({
      progress: progress.map(p => ({
        area: p.area,
        itemId: p.itemId,
        completed: p.completed,
        completedAt: p.completedAt?.toISOString() ?? null,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching checklist progress");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch checklist." });
  }
});

// PATCH /resilience/reports/:reportId/checklists/:area/:itemId
router.patch("/reports/:reportId/checklists/:area/:itemId", async (req, res) => {
  try {
    const { reportId, area, itemId } = req.params;
    const body = req.body as { completed?: unknown };
    if (typeof body.completed !== "boolean") {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "Invalid body: 'completed' must be a boolean" });
      return;
    }
    const completed = body.completed;
    const completedAt = completed ? new Date() : null;

    // Upsert: check if record exists
    const existing = await db
      .select()
      .from(checklistProgressTable)
      .where(
        and(
          eq(checklistProgressTable.reportId, reportId),
          eq(checklistProgressTable.area, area),
          eq(checklistProgressTable.itemId, itemId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(checklistProgressTable)
        .set({ completed, completedAt })
        .where(
          and(
            eq(checklistProgressTable.reportId, reportId),
            eq(checklistProgressTable.area, area),
            eq(checklistProgressTable.itemId, itemId)
          )
        );
    } else {
      await db.insert(checklistProgressTable).values({
        reportId,
        area,
        itemId,
        completed,
        completedAt,
      });
    }

    res.json({
      area,
      itemId,
      completed,
      completedAt: completedAt?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Error updating checklist item");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update checklist item." });
  }
});

// GET /resilience/reports/:reportId/snapshots
router.get("/reports/:reportId/snapshots", async (req, res) => {
  try {
    const reportId = req.params.reportId;
    if (!reportId) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "Missing reportId" });
      return;
    }

    // Find the sessionId for this report
    const reportRows = await db
      .select({ sessionId: resilienceReportsTable.sessionId })
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.reportId, reportId))
      .limit(1);

    const sessionId = reportRows[0]?.sessionId;
    if (!sessionId) {
      res.json({ snapshots: [] });
      return;
    }

    const snapshots = await db
      .select()
      .from(progressSnapshotsTable)
      .where(eq(progressSnapshotsTable.sessionId, sessionId))
      .orderBy(progressSnapshotsTable.snapshotAt);

    res.json({
      snapshots: snapshots.map(s => ({
        reportId: s.reportId,
        snapshotAt: s.snapshotAt.toISOString(),
        score: {
          overall: s.scoreOverall,
          financial: s.scoreFinancial,
          health: s.scoreHealth,
          skills: s.scoreSkills,
          mobility: s.scoreMobility,
          psychological: s.scorePsychological,
          resources: s.scoreResources,
        },
        mrComposite: s.mrComposite ?? null,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching snapshots");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch snapshots." });
  }
});

router.get("/percentile", async (req, res) => {
  try {
    const score = parseFloat(req.query["score"] as string);
    if (isNaN(score) || score < 0 || score > 100) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "score must be a number between 0 and 100." });
      return;
    }
    const all = await db.select({ s: resilienceReportsTable.scoreOverall }).from(resilienceReportsTable);
    const total = all.length;
    if (total < 50) {
      res.json({ percentile: null, total });
      return;
    }
    const below = all.filter(r => r.s < score).length;
    const percentile = Math.round((below / total) * 100);
    res.json({ percentile, total });
  } catch (err) {
    req.log.error({ err }, "Error calculating percentile");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to calculate percentile." });
  }
});

router.use(scenariosRouter);

export default router;
