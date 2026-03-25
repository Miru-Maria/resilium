import { Router, type IRouter } from "express";
import { db, resilienceReportsTable, consentRecordsTable } from "@workspace/db";
import { desc, gte, sql } from "drizzle-orm";
import { requireAdminSession } from "../../middlewares/adminAuth.js";

const router: IRouter = Router();

router.use(requireAdminSession);

router.get("/mobile", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const mobileConsentRows = await db
      .select({ sessionId: consentRecordsTable.sessionId })
      .from(consentRecordsTable)
      .where(sql`${consentRecordsTable.platform} = 'mobile'`);

    const mobileSessionIds = mobileConsentRows.map((r) => r.sessionId);

    const webConsentRows = await db
      .select({ sessionId: consentRecordsTable.sessionId })
      .from(consentRecordsTable)
      .where(sql`${consentRecordsTable.platform} != 'mobile'`);

    const webSessionIds = webConsentRows.map((r) => r.sessionId);

    const allReports = await db
      .select({
        reportId: resilienceReportsTable.reportId,
        sessionId: resilienceReportsTable.sessionId,
        createdAt: resilienceReportsTable.createdAt,
        scoreOverall: resilienceReportsTable.scoreOverall,
        location: resilienceReportsTable.location,
      })
      .from(resilienceReportsTable)
      .orderBy(desc(resilienceReportsTable.createdAt));

    const mobileReports = allReports.filter(
      (r) => r.sessionId && mobileSessionIds.includes(r.sessionId),
    );

    const webReports = allReports.filter(
      (r) => !r.sessionId || webSessionIds.includes(r.sessionId) || !mobileSessionIds.includes(r.sessionId ?? ""),
    );

    const totalMobile = mobileReports.length;
    const totalWeb = allReports.length - totalMobile;

    const dailyBreakdown: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyBreakdown[key] = 0;
    }
    for (const r of mobileReports) {
      const key = r.createdAt.toISOString().slice(0, 10);
      if (key in dailyBreakdown) {
        dailyBreakdown[key]++;
      }
    }

    const scoreDistribution: Record<string, number> = {
      "0-20": 0,
      "21-40": 0,
      "41-60": 0,
      "61-80": 0,
      "81-100": 0,
    };
    for (const r of mobileReports) {
      const s = r.scoreOverall * 100;
      if (s <= 20) scoreDistribution["0-20"]++;
      else if (s <= 40) scoreDistribution["21-40"]++;
      else if (s <= 60) scoreDistribution["41-60"]++;
      else if (s <= 80) scoreDistribution["61-80"]++;
      else scoreDistribution["81-100"]++;
    }

    const locationCounts: Record<string, number> = {};
    for (const r of mobileReports) {
      const loc = r.location || "Unknown";
      locationCounts[loc] = (locationCounts[loc] ?? 0) + 1;
    }
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }));

    res.json({
      totalMobile,
      totalWeb,
      totalAll: allReports.length,
      dailyBreakdown: Object.entries(dailyBreakdown).map(([date, count]) => ({
        date,
        count,
      })),
      scoreDistribution: Object.entries(scoreDistribution).map(([range, count]) => ({
        range,
        count,
      })),
      topLocations,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching mobile analytics");
    res.status(500).json({ error: "Failed to fetch mobile analytics" });
  }
});

export default router;
