import { Router, type IRouter, type Request, type Response } from "express";
import { db, resilienceReportsTable } from "@workspace/db";
import { and, eq, count, inArray } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const PLAN_LIMIT = 10;

router.get("/me/plans", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const plans = await db
      .select({
        reportId: resilienceReportsTable.reportId,
        createdAt: resilienceReportsTable.createdAt,
        scoreOverall: resilienceReportsTable.scoreOverall,
      })
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.userId, req.user.id))
      .orderBy(resilienceReportsTable.createdAt);

    res.json({
      plans: plans.map((p) => ({
        reportId: p.reportId,
        createdAt: p.createdAt.toISOString(),
        scoreOverall: p.scoreOverall,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching user plans");
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

router.delete("/me/plans/:reportId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { reportId } = req.params;

  try {
    const rows = await db
      .select({ id: resilienceReportsTable.id, userId: resilienceReportsTable.userId })
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.reportId, reportId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    if (row.userId !== req.user.id) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    await db
      .delete(resilienceReportsTable)
      .where(
        and(
          eq(resilienceReportsTable.reportId, reportId),
          eq(resilienceReportsTable.userId, req.user.id),
        ),
      );

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting user plan");
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

router.post("/me/plans/compare", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body as { reportIdA?: string; reportIdB?: string };
  const { reportIdA, reportIdB } = body;

  if (!reportIdA || !reportIdB || reportIdA === reportIdB) {
    res.status(400).json({ error: "Two distinct report IDs are required" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(resilienceReportsTable)
      .where(
        and(
          inArray(resilienceReportsTable.reportId, [reportIdA, reportIdB]),
          eq(resilienceReportsTable.userId, req.user.id)
        )
      );

    if (rows.length !== 2) {
      res.status(404).json({ error: "One or both reports not found" });
      return;
    }

    // Order: A is earlier, B is later
    const sorted = rows.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const [earlier, later] = sorted;

    const scoreKeys = ["financial", "health", "skills", "mobility", "psychological", "resources"] as const;

    const toScore = (r: typeof earlier) => ({
      overall: r.scoreOverall,
      financial: r.scoreFinancial,
      health: r.scoreHealth,
      skills: r.scoreSkills,
      mobility: r.scoreMobility,
      psychological: r.scorePsychological,
      resources: r.scoreResources,
    });

    const scoreA = toScore(earlier);
    const scoreB = toScore(later);

    const deltas = scoreKeys.reduce((acc, k) => {
      acc[k] = Math.round((scoreB[k] - scoreA[k]) * 10) / 10;
      return acc;
    }, {} as Record<string, number>);
    deltas.overall = Math.round((scoreB.overall - scoreA.overall) * 10) / 10;

    // AI conclusions
    const deltaLines = scoreKeys.map(k => {
      const d = deltas[k];
      return `${k.charAt(0).toUpperCase() + k.slice(1)}: ${scoreA[k].toFixed(0)} → ${scoreB[k].toFixed(0)} (${d >= 0 ? "+" : ""}${d})`;
    }).join("\n");

    const prompt = `You are a personal resilience advisor. A user has two resilience assessment reports and wants to understand their progress.

EARLIER REPORT (${new Date(earlier.createdAt).toDateString()}):
Overall score: ${scoreA.overall.toFixed(0)}/100
Location: ${earlier.location}
Risk profile: ${earlier.riskProfileSummary?.slice(0, 300) ?? "N/A"}

LATER REPORT (${new Date(later.createdAt).toDateString()}):
Overall score: ${scoreB.overall.toFixed(0)}/100
Location: ${later.location}
Risk profile: ${later.riskProfileSummary?.slice(0, 300) ?? "N/A"}

SCORE CHANGES:
Overall: ${scoreA.overall.toFixed(0)} → ${scoreB.overall.toFixed(0)} (${deltas.overall >= 0 ? "+" : ""}${deltas.overall})
${deltaLines}

Write a concise, insightful comparison in plain English. Structure your response as JSON with these fields:
- "headline": a one-sentence summary of the overall trend (max 15 words)
- "whatImproved": 2-3 bullet points on what got better (or "No clear improvement" if flat/declined)
- "whatDeclined": 2-3 bullet points on what got worse (or null if nothing declined)  
- "keyInsight": one paragraph (3-4 sentences) synthesising the most important finding
- "nextSteps": 3 specific, actionable recommendations based on the gaps that remain

Return only valid JSON.`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      max_completion_tokens: 700,
      messages: [
        { role: "system", content: "You are a resilience advisor. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const conclusions = JSON.parse(aiRes.choices[0]?.message?.content ?? "{}") as {
      headline: string;
      whatImproved: string[];
      whatDeclined: string[] | null;
      keyInsight: string;
      nextSteps: string[];
    };

    res.json({
      reportA: {
        reportId: earlier.reportId,
        createdAt: earlier.createdAt.toISOString(),
        score: scoreA,
        location: earlier.location,
      },
      reportB: {
        reportId: later.reportId,
        createdAt: later.createdAt.toISOString(),
        score: scoreB,
        location: later.location,
      },
      deltas,
      conclusions,
    });
  } catch (err) {
    req.log.error({ err }, "Error comparing plans");
    res.status(500).json({ error: "Failed to compare plans" });
  }
});

export { PLAN_LIMIT };
export default router;
