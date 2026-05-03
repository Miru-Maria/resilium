import { Router, type IRouter } from "express";
import { db, referralCodesTable, referralUsesTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { requireAdminSession } from "../../middlewares/adminAuth.js";
import { logger } from "../../lib/logger.js";

const router: IRouter = Router();
router.use(requireAdminSession);

router.get("/", async (_req, res) => {
  try {
    const uses = await db
      .select()
      .from(referralUsesTable)
      .orderBy(desc(referralUsesTable.createdAt))
      .limit(200);

    const totalReferrals = uses.length;
    const converted = uses.filter(u => u.convertedAt != null).length;

    const codes = await db.select({ cnt: count() }).from(referralCodesTable);
    const totalCodes = Number(codes[0]?.cnt ?? 0);

    const recentReferrals = uses.slice(0, 50).map(u => ({
      id: u.id,
      code: u.code,
      referrerId: u.referrerId,
      referredId: u.referredId,
      convertedAt: u.convertedAt?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    }));

    res.json({ totalCodes, totalReferrals, converted, conversionRate: totalReferrals > 0 ? Math.round(converted / totalReferrals * 100) : 0, recentReferrals });
  } catch (err) {
    logger.error({ err }, "Error fetching referral stats");
    res.status(500).json({ error: "Failed to fetch referral stats" });
  }
});

router.patch("/:id/mark-converted", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db.update(referralUsesTable).set({ convertedAt: new Date() }).where(eq(referralUsesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Error marking referral converted");
    res.status(500).json({ error: "Failed to mark converted" });
  }
});

export default router;
