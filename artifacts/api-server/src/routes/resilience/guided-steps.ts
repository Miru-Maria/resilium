import { Router, type Request } from "express";
import { getAuth } from "@clerk/express";
import { db, resilienceReportsTable, subscriptionsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { generateGuidedSteps } from "./ai.js";

const router = Router();

function getUserId(req: Request): string | null {
  const auth = getAuth(req);
  return (auth?.sessionClaims?.userId as string | undefined) || auth?.userId || null;
}

router.post(
  "/reports/:reportId/checklist/:area/items/:itemId/expand",
  async (req, res) => {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const activeSub = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.userId, userId),
          eq(subscriptionsTable.status, "active"),
          gt(subscriptionsTable.currentPeriodEnd, new Date())
        )
      )
      .limit(1);

    if (activeSub.length === 0) {
      return res.status(403).json({ error: "Pro subscription required" });
    }

    const { reportId, area } = req.params;
    const { itemTitle, itemDescription } = req.body as {
      itemTitle?: string;
      itemDescription?: string;
    };

    if (!itemTitle || typeof itemTitle !== "string") {
      return res.status(400).json({ error: "itemTitle is required" });
    }

    const rows = await db
      .select({
        location: resilienceReportsTable.location,
        incomeStability: resilienceReportsTable.incomeStability,
        savingsMonths: resilienceReportsTable.savingsMonths,
        healthStatus: resilienceReportsTable.healthStatus,
        currency: resilienceReportsTable.currency,
        primaryGoal: resilienceReportsTable.primaryGoal,
        successVision: resilienceReportsTable.successVision,
        userId: resilienceReportsTable.userId,
      })
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.reportId, reportId))
      .limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const report = rows[0]!;

    if (report.userId && report.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    try {
      const steps = await generateGuidedSteps({
        itemTitle,
        itemDescription: itemDescription ?? "",
        area: decodeURIComponent(area),
        location: report.location,
        primaryGoal: report.primaryGoal,
        successVision: report.successVision,
        incomeStability: report.incomeStability,
        savingsMonths: report.savingsMonths,
        healthStatus: report.healthStatus,
        currency: report.currency,
      });

      return res.json({ steps });
    } catch (err) {
      console.error("[guided-steps] AI error:", err);
      return res.status(500).json({ error: "Failed to generate guided steps" });
    }
  }
);

export default router;
