import { Router, type IRouter, type Request } from "express";
import { getAuth, createClerkClient } from "@clerk/express";
import { randomUUID } from "crypto";
import { SubmitAssessmentBody, GetReportParams } from "@workspace/api-zod";
import { db, resilienceReportsTable, checklistProgressTable, progressSnapshotsTable, subscriptionsTable, planViewsTable, usersTable } from "@workspace/db";
import { eq, and, count, inArray } from "drizzle-orm";

import { calculateScores } from "./scoring.js";
import { generateResilienceReport } from "./ai.js";
import { PLAN_LIMIT } from "../users.js";
import rateLimit from "express-rate-limit";
import scenariosRouter from "./scenarios.js";
import guidedStepsRouter from "./guided-steps.js";
import { sendWelcomeEmail } from "../../lib/email.js";

function normalizeCountry(location: string): string | null {
  if (!location || !location.trim()) return null;
  const parts = location.split(",").map(p => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || null;
}

function getUserId(req: Request): string | null {
  const auth = getAuth(req);
  return (auth?.sessionClaims?.userId as string | undefined) || auth?.userId || null;
}

// ── Async job store ──────────────────────────────────────────────────────────
// Holds in-progress and recently completed assessment jobs so the client can
// poll for the result without the request staying open for 90+ seconds.
type JobEntry =
  | { status: "processing"; createdAt: number }
  | { status: "complete";   createdAt: number; reportId: string }
  | { status: "failed";     createdAt: number; error: string };

const reportJobs = new Map<string, JobEntry>();

// Prune jobs older than 15 minutes every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [id, job] of reportJobs) {
    if (job.createdAt < cutoff) reportJobs.delete(id);
  }
}, 5 * 60 * 1000).unref();

const router: IRouter = Router();

const VALID_CURRENCIES = ["USD", "EUR", "GBP", "AUD", "CAD", "JPY", "INR", "BRL", "RON"] as const;
type SupportedCurrency = string;
const CUSTOM_CURRENCY_RE = /^[A-Z]{2,6}$/;

function parseCurrency(value: unknown): SupportedCurrency {
  if (typeof value !== "string") return "USD";
  const upper = value.toUpperCase();
  if ((VALID_CURRENCIES as readonly string[]).includes(upper)) return upper;
  if (CUSTOM_CURRENCY_RE.test(upper)) return upper;
  return "USD";
}

const assessRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  keyGenerator: (req) => getUserId(req as Request) ?? "anonymous",
  message: {
    error: "RATE_LIMITED",
    message: "You've run 5 assessments this hour. Please wait before starting another.",
  },
});

router.post("/assess", assessRateLimit, async (req, res) => {
  try {
    const parseResult = SubmitAssessmentBody.safeParse(req.body);
    if (!parseResult.success) {
      req.log.error({ zodIssues: parseResult.error.issues, body: req.body }, "Assessment validation failed");
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Invalid assessment input: " + parseResult.error.message,
        issues: parseResult.error.issues,
      });
      return;
    }

    const input = parseResult.data;

    const userId = getUserId(req);
    let planCount = 0;
    if (userId) {
      const [{ planCount: pc }] = await db
        .select({ planCount: count() })
        .from(resilienceReportsTable)
        .where(eq(resilienceReportsTable.userId, userId));
      planCount = pc;

      const subs = await db
        .select({ status: subscriptionsTable.status })
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.userId, userId))
        .limit(1);

      const isSubscriber = subs.length > 0 && (subs[0].status === "active" || subs[0].status === "cancel_scheduled");

      req.log.info({ userId, planCount, isSubscriber }, "Plan gate check");
      if (!isSubscriber && planCount >= PLAN_LIMIT) {
        req.log.warn({ userId, planCount }, "Plan limit exceeded");
        res.status(400).json({
          error: "PLAN_LIMIT_EXCEEDED",
          message: `You have reached the maximum of ${PLAN_LIMIT} saved plans. Upgrade to Pro for unlimited access.`,
        });
        return;
      }
    }
    const scoreResult = calculateScores({
      location: input.location,
      ageBracket: input.ageBracket ?? undefined,
      incomeStability: input.incomeStability,
      savingsMonths: input.savingsMonths,
      dependentCount: input.dependentCount,
      relocationReadiness: input.relocationReadiness ?? undefined,
      skills: input.skills as string[],
      healthStatus: input.healthStatus,
      mobilityLevel: input.mobilityLevel,
      housingType: input.housingType,
      hasEmergencySupplies: input.hasEmergencySupplies,
      emergencySupplyTier: input.emergencySupplyTier ?? undefined,
      psychologicalResilience: input.psychologicalResilience,
      riskConcerns: input.riskConcerns as string[],
      mentalResilienceAnswers: input.mentalResilienceAnswers ?? undefined,
      chronicCondition: input.chronicCondition ?? undefined,
      chronicConditionName: (input as any).chronicConditionName ?? undefined,
      chronicSeverity: (input as any).chronicSeverity ?? undefined,
      chronicRequiresMedication: (input as any).chronicRequiresMedication ?? undefined,
      trustedLocalContacts: input.trustedLocalContacts ?? undefined,
      communityInvolvement: input.communityInvolvement ?? undefined,
      mutualAidAccess: input.mutualAidAccess ?? undefined,
      householdMode: input.householdMode ?? undefined,
      householdComposition: input.householdComposition ?? undefined,
    } as any);

    const { mentalResilienceSubScores, ...scores } = scoreResult;

    const currency = parseCurrency(req.body.currency);

    // ── Return a jobId immediately so the HTTP connection can close ──────────
    // The AI call can take 90–120 s; Replit's proxy cuts connections at ~60 s.
    // Processing continues in the background; the client polls /jobs/:jobId.
    const jobId = randomUUID();
    reportJobs.set(jobId, { status: "processing", createdAt: Date.now() });
    res.status(202).json({ jobId, status: "processing" });

    // ── Background processing ─────────────────────────────────────────────────
    setImmediate(async () => {
      try {
        const reportContent = await generateResilienceReport(
          {
            location: input.location,
            ageBracket: input.ageBracket ?? undefined,
            incomeStability: input.incomeStability,
            savingsMonths: input.savingsMonths,
            dependentCount: input.dependentCount,
            relocationReadiness: input.relocationReadiness ?? undefined,
            skills: input.skills as string[],
            healthStatus: input.healthStatus,
            mobilityLevel: input.mobilityLevel,
            housingType: input.housingType,
            hasEmergencySupplies: input.hasEmergencySupplies,
            emergencySupplyTier: input.emergencySupplyTier ?? undefined,
            psychologicalResilience: input.psychologicalResilience,
            riskConcerns: input.riskConcerns as string[],
            currency,
            chronicCondition: input.chronicCondition ?? undefined,
            chronicConditionName: (input as any).chronicConditionName ?? undefined,
            chronicSeverity: (input as any).chronicSeverity ?? undefined,
            chronicRequiresMedication: (input as any).chronicRequiresMedication ?? undefined,
            trustedLocalContacts: input.trustedLocalContacts ?? undefined,
            communityInvolvement: input.communityInvolvement ?? undefined,
            mutualAidAccess: input.mutualAidAccess ?? undefined,
            primaryGoal: input.primaryGoal ?? undefined,
            successVision: input.successVision ?? undefined,
            householdMode: input.householdMode ?? undefined,
            householdComposition: input.householdComposition ?? undefined,
          },
          scores,
          mentalResilienceSubScores
        );

        const APP_URL = process.env["APP_URL"] ?? "https://resilium-platform.com";
        if (scores.psychological < 50) {
          const coachingResource = {
            title: "1:1 Mental Resilience Coaching",
            category: "Psychological",
            description:
              "Resilium maps the gap — a coach helps close it. Cristiana Paun offers tailored 1:1 sessions designed around your Resilium report, for people whose psychological resilience signals a need for structured human support alongside the practical action plan.",
            url: `${APP_URL}/coaching?ref=resilium&score=${scores.psychological}`,
            badge: "1:1 Session",
            priority: "high" as const,
          };
          reportContent.recommendedResources = [
            coachingResource,
            ...(reportContent.recommendedResources ?? []),
          ];
        }

        const reportId = randomUUID();
        const now = new Date();

        // Ensure the authenticated user exists in the local users table before
        // inserting the report (foreign key constraint). A Clerk user may be
        // authenticated but not yet synced to our DB if the webhook was missed.
        if (userId) {
          await db.insert(usersTable).values({ id: userId }).onConflictDoNothing();
        }

        await db.insert(resilienceReportsTable).values({
          reportId,
          sessionId: input.sessionId ?? null,
          userId: userId ?? null,
          currency,
          ageBracket: input.ageBracket ?? null,
          location: input.location,
          locationCountry: normalizeCountry(input.location),
          incomeStability: input.incomeStability,
          savingsMonths: input.savingsMonths,
          dependentCount: input.dependentCount,
          relocationReadiness: input.relocationReadiness ?? null,
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
          scoreSocialCapital: scores.socialCapital ?? null,
          riskProfileSummary: reportContent.riskProfileSummary,
          topVulnerabilities: reportContent.topVulnerabilities,
          actionPlan: reportContent.actionPlan,
          scenarioSimulations: reportContent.scenarioSimulations,
          dailyHabits: reportContent.dailyHabits,
          checklistsByArea: reportContent.checklistsByArea ?? null,
          recommendedResources: reportContent.recommendedResources ?? null,
          primaryGoal: input.primaryGoal ?? null,
          successVision: input.successVision ?? null,
          emergencySupplyTier: input.emergencySupplyTier ?? null,
          householdMode: input.householdMode ?? null,
          householdComposition: input.householdComposition ?? null,
          createdAt: now,
        });

        // Fire welcome email on first authenticated plan (fire-and-forget)
        if (userId && typeof planCount === "number" && planCount === 0) {
          (async () => {
            try {
              const clerkClient = createClerkClient({ secretKey: process.env["CLERK_SECRET_KEY"] });
              const clerkUser = await clerkClient.users.getUser(userId);
              const email = clerkUser.emailAddresses[0]?.emailAddress;
              if (email) {
                await sendWelcomeEmail({ email, firstName: clerkUser.firstName });
              }
            } catch (err) {
              req.log.warn({ err }, "sendWelcomeEmail failed (non-critical)");
            }
          })();
        }

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

        reportJobs.set(jobId, { status: "complete", createdAt: Date.now(), reportId });
        req.log.info({ jobId, reportId }, "Background report generation complete");
      } catch (err: any) {
        // Log the underlying cause (actual PostgreSQL error) separately so it is
        // never truncated by the outer JSON stringification of `err`.
        const cause = err?.cause;
        req.log.error(
          { jobId, errMsg: err?.message, causeMsg: cause?.message, causeCode: cause?.code, causeDetail: cause?.detail },
          "Background report generation failed"
        );
        reportJobs.set(jobId, { status: "failed", createdAt: Date.now(), error: "Failed to generate report. Please try again." });
      }
    });
  } catch (err) {
    req.log.error({ err }, "Error in assess endpoint (pre-dispatch)");
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to start report generation. Please try again.",
    });
  }
});

// ── Job status polling endpoint ───────────────────────────────────────────────
router.get("/jobs/:jobId", (req, res) => {
  const job = reportJobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "JOB_NOT_FOUND", message: "Job not found or expired." });
    return;
  }
  res.json(job);
});

router.get("/my-reports", async (req, res) => {
  const myReportsUserId = getUserId(req);
  if (!myReportsUserId) {
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
        primaryGoal: resilienceReportsTable.primaryGoal,
        checklistsByArea: resilienceReportsTable.checklistsByArea,
      })
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.userId, myReportsUserId))
      .orderBy(resilienceReportsTable.createdAt);

    const reportIds = rows.map(r => r.reportId);
    const progressRows = reportIds.length > 0
      ? await db
          .select({
            reportId: checklistProgressTable.reportId,
            completed: checklistProgressTable.completed,
          })
          .from(checklistProgressTable)
          .where(inArray(checklistProgressTable.reportId, reportIds))
      : [];

    const completedByReport: Record<string, number> = {};
    for (const p of progressRows) {
      if (p.completed) {
        completedByReport[p.reportId] = (completedByReport[p.reportId] ?? 0) + 1;
      }
    }

    res.json({ reports: rows.map(r => {
      const checklists = (r.checklistsByArea ?? {}) as Record<string, Array<unknown>>;
      const totalItems = Object.values(checklists).reduce((sum, items) => sum + items.length, 0);
      const completedItems = completedByReport[r.reportId] ?? 0;
      return {
        reportId: r.reportId,
        createdAt: r.createdAt.toISOString(),
        location: r.location,
        riskProfileSummary: r.riskProfileSummary,
        primaryGoal: r.primaryGoal,
        totalItems,
        completedItems,
        score: {
          overall: r.scoreOverall,
          financial: r.scoreFinancial,
          health: r.scoreHealth,
          skills: r.scoreSkills,
          mobility: r.scoreMobility,
          psychological: r.scorePsychological,
          resources: r.scoreResources,
        },
      };
    }) });
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
      householdMode: row.householdMode ?? undefined,
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
        dependentCount: row.dependentCount,
        relocationReadiness: row.relocationReadiness ?? undefined,
        skills: row.skills as string[],
        healthStatus: row.healthStatus as "excellent" | "good" | "fair" | "poor",
        mobilityLevel: row.mobilityLevel as "high" | "medium" | "low",
        housingType: row.housingType as "own" | "rent" | "family" | "nomadic" | "other",
        hasEmergencySupplies: row.hasEmergencySupplies,
        psychologicalResilience: row.psychologicalResilience,
        riskConcerns: row.riskConcerns as string[],
        householdMode: row.householdMode ?? undefined,
        householdComposition: (row.householdComposition as {
          adults?: number;
          hasMinors?: boolean;
          hasMobilityLimitation?: boolean;
          hasMultipleIncomes?: boolean;
        } | null) ?? undefined,
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
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "Sign in to track your checklist progress." });
      return;
    }

    const { reportId, area, itemId } = req.params;
    const body = req.body as { completed?: unknown };
    if (typeof body.completed !== "boolean") {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "Invalid body: 'completed' must be a boolean" });
      return;
    }

    // Verify report belongs to this user
    const reportRows = await db
      .select({ userId: resilienceReportsTable.userId })
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.reportId, reportId))
      .limit(1);
    if (!reportRows[0] || reportRows[0].userId !== userId) {
      res.status(403).json({ error: "FORBIDDEN", message: "You do not have access to this report." });
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

// POST /resilience/reports/:reportId/view — lightweight plan engagement tracking
router.post("/reports/:reportId/view", async (req, res) => {
  try {
    const reportId = req.params.reportId;
    if (!reportId) { res.status(400).json({ error: "Missing reportId" }); return; }
    const userId = getUserId(req as Request);
    const sessionId = (req.body as { sessionId?: string })?.sessionId ?? null;
    await db.insert(planViewsTable).values({ reportId, userId, sessionId });
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

router.use(scenariosRouter);
router.use(guidedStepsRouter);

export default router;
