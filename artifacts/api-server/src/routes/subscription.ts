import { Router } from "express";
import { db, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/subscription/status", async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.json({ isPro: false, status: "unauthenticated" });
  }

  try {
    const [sub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, userId))
      .limit(1);

    if (!sub) {
      return res.json({ isPro: false, status: "none" });
    }

    const isPro = sub.status === "active" || sub.status === "cancel_scheduled";
    const isExpired = sub.currentPeriodEnd ? sub.currentPeriodEnd < new Date() : false;

    return res.json({
      isPro: isPro && !isExpired,
      status: sub.status,
      planName: sub.planName,
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
      cancelScheduled: sub.status === "cancel_scheduled",
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch subscription status");
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

export default router;
