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

export { PLAN_LIMIT };
export default router;
