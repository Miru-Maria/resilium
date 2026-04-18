import { Router, type IRouter } from "express";
import { db, resilienceReportsTable, consentRecordsTable, usersTable, subscriptionsTable } from "@workspace/db";
import { desc, gte, sql, count, avg, isNotNull } from "drizzle-orm";
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

router.get("/users", async (req, res) => {
  try {
    const [totalUsersResult] = await db.select({ count: count() }).from(usersTable);
    const totalUsers = Number(totalUsersResult?.count ?? 0);

    const [totalProResult] = await db
      .select({ count: count() })
      .from(subscriptionsTable)
      .where(sql`${subscriptionsTable.status} IN ('active', 'cancel_scheduled')`);
    const totalPro = Number(totalProResult?.count ?? 0);

    const usersWithPlans = await db
      .select({ userId: resilienceReportsTable.userId, c: count() })
      .from(resilienceReportsTable)
      .where(isNotNull(resilienceReportsTable.userId))
      .groupBy(resilienceReportsTable.userId);
    const usersWithAtLeastOnePlan = usersWithPlans.length;

    const signupsByMonth: Record<string, number> = {};
    const assessmentsByMonth: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      signupsByMonth[key] = 0;
      assessmentsByMonth[key] = 0;
    }

    const allUsers = await db.select({ id: usersTable.id, createdAt: usersTable.createdAt }).from(usersTable);
    for (const u of allUsers) {
      const key = u.createdAt.toISOString().slice(0, 7);
      if (key in signupsByMonth) signupsByMonth[key]++;
    }

    const allReports = await db
      .select({ createdAt: resilienceReportsTable.createdAt })
      .from(resilienceReportsTable)
      .where(isNotNull(resilienceReportsTable.userId));
    for (const r of allReports) {
      const key = r.createdAt.toISOString().slice(0, 7);
      if (key in assessmentsByMonth) assessmentsByMonth[key]++;
    }

    const [dimAvgs] = await db.select({
      financial: avg(resilienceReportsTable.scoreFinancial),
      health: avg(resilienceReportsTable.scoreHealth),
      skills: avg(resilienceReportsTable.scoreSkills),
      mobility: avg(resilienceReportsTable.scoreMobility),
      psychological: avg(resilienceReportsTable.scorePsychological),
      resources: avg(resilienceReportsTable.scoreResources),
    }).from(resilienceReportsTable);

    const planBuckets = { "0 plans": 0, "1 plan": 0, "2 plans": 0, "3 plans": 0 };
    const planCountMap = new Map<string, number>();
    for (const row of usersWithPlans) {
      if (row.userId) planCountMap.set(row.userId, Number(row.c));
    }
    for (const u of allUsers) {
      const c = planCountMap.get(u.id) ?? 0;
      if (c === 0) planBuckets["0 plans"]++;
      else if (c === 1) planBuckets["1 plan"]++;
      else if (c === 2) planBuckets["2 plans"]++;
      else planBuckets["3 plans"]++;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsersResult = await db.execute(sql`
      SELECT COUNT(DISTINCT user_id)::int AS count FROM (
        SELECT user_id FROM resilience_reports WHERE user_id IS NOT NULL AND created_at >= ${thirtyDaysAgo}
        UNION
        SELECT user_id FROM checkin_entries WHERE created_at >= ${thirtyDaysAgo}
        UNION
        SELECT c.user_id FROM conversations c
          JOIN messages m ON m.conversation_id = c.id
          WHERE m.created_at >= ${thirtyDaysAgo}
      ) active_users
    `);
    const activeUsers30d = Number((activeUsersResult.rows[0] as { count: number } | undefined)?.count ?? 0);

    const activeUsersTrendResult = await db.execute(sql`
      SELECT
        TO_CHAR(date_trunc('day', activity_at), 'YYYY-MM-DD') AS day,
        COUNT(DISTINCT user_id)::int AS count
      FROM (
        SELECT user_id, created_at AS activity_at
          FROM resilience_reports
          WHERE user_id IS NOT NULL AND created_at >= ${thirtyDaysAgo}
        UNION ALL
        SELECT user_id, created_at AS activity_at
          FROM checkin_entries
          WHERE created_at >= ${thirtyDaysAgo}
        UNION ALL
        SELECT c.user_id, m.created_at AS activity_at
          FROM conversations c
          JOIN messages m ON m.conversation_id = c.id
          WHERE m.created_at >= ${thirtyDaysAgo}
      ) all_activity
      GROUP BY date_trunc('day', activity_at)
      ORDER BY day
    `);

    const trendMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const row of activeUsersTrendResult.rows as { day: string; count: number }[]) {
      const key = row.day.slice(0, 10);
      if (key in trendMap) trendMap[key] = Number(row.count);
    }
    const activeUsersByDay = Object.entries(trendMap).map(([date, count]) => ({ date, count }));

    res.json({
      totals: { totalUsers, totalPro, usersWithAtLeastOnePlan, activeUsers30d, conversionRate: totalUsers > 0 ? Math.round((totalPro / totalUsers) * 1000) / 10 : 0 },
      signupsByMonth: Object.entries(signupsByMonth).map(([month, count]) => ({ month, count })),
      assessmentsByMonth: Object.entries(assessmentsByMonth).map(([month, count]) => ({ month, count })),
      dimensionAverages: [
        { name: "Financial", value: Math.round(Number(dimAvgs?.financial ?? 0) * 10) / 10 },
        { name: "Health", value: Math.round(Number(dimAvgs?.health ?? 0) * 10) / 10 },
        { name: "Skills", value: Math.round(Number(dimAvgs?.skills ?? 0) * 10) / 10 },
        { name: "Mobility", value: Math.round(Number(dimAvgs?.mobility ?? 0) * 10) / 10 },
        { name: "Psychological", value: Math.round(Number(dimAvgs?.psychological ?? 0) * 10) / 10 },
        { name: "Resources", value: Math.round(Number(dimAvgs?.resources ?? 0) * 10) / 10 },
      ],
      planBuckets: Object.entries(planBuckets).map(([label, count]) => ({ label, count })),
      activeUsersByDay,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching user analytics");
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

export default router;
