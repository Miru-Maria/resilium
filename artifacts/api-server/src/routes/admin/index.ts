import { Router, type IRouter } from "express";
import { db, resilienceReportsTable, reportFeedbackTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAdminSession } from "../../middlewares/adminAuth.js";

const router: IRouter = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  const adminUsername = process.env["ADMIN_USERNAME"];
  const adminPassword = process.env["ADMIN_PASSWORD"];

  if (!adminUsername || !adminPassword) {
    res.status(500).json({ error: "CONFIGURATION_ERROR", message: "Admin credentials not configured." });
    return;
  }

  if (username === adminUsername && password === adminPassword) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Invalid username or password." });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/analytics", requireAdminSession, async (req, res) => {
  try {
    const reports = await db.select().from(resilienceReportsTable).orderBy(desc(resilienceReportsTable.createdAt));
    const feedbackRows = await db.select().from(reportFeedbackTable).orderBy(desc(reportFeedbackTable.createdAt));

    const totalReports = reports.length;
    const avgOverall = totalReports > 0
      ? reports.reduce((sum, r) => sum + r.scoreOverall, 0) / totalReports
      : 0;

    // Reports per day (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentReports = reports.filter(r => r.createdAt >= thirtyDaysAgo);

    const dayBuckets: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayBuckets[key] = 0;
    }
    for (const r of recentReports) {
      const key = r.createdAt.toISOString().slice(0, 10);
      if (key in dayBuckets) dayBuckets[key]++;
    }
    const reportsPerDay = Object.entries(dayBuckets).map(([date, count]) => ({ date, count }));

    // Demographics
    const countBy = (arr: typeof reports, field: keyof typeof reports[0]) => {
      const map: Record<string, number> = {};
      for (const r of arr) {
        const val = String(r[field]);
        map[val] = (map[val] ?? 0) + 1;
      }
      return Object.entries(map).map(([name, count]) => ({ name, count }));
    };

    const demographics = {
      location: countBy(reports, "location"),
      incomeStability: countBy(reports, "incomeStability"),
      healthStatus: countBy(reports, "healthStatus"),
      housingType: countBy(reports, "housingType"),
      mobilityLevel: countBy(reports, "mobilityLevel"),
    };

    // Score analytics
    const scoreCategories = ["scoreFinancial", "scoreHealth", "scoreSkills", "scoreMobility", "scorePsychological", "scoreResources"] as const;
    const avgScores = scoreCategories.map(cat => ({
      category: cat.replace("score", ""),
      avg: totalReports > 0 ? reports.reduce((sum, r) => sum + r[cat], 0) / totalReports : 0,
    }));

    // Overall score histogram (buckets of 10)
    const histogramData: { range: string; count: number }[] = [];
    for (let i = 0; i < 10; i++) {
      histogramData.push({ range: `${i * 10}-${i * 10 + 9}`, count: 0 });
    }
    histogramData.push({ range: "100", count: 0 });
    for (const r of reports) {
      if (r.scoreOverall >= 100) {
        histogramData[10].count++;
      } else {
        const bucket = Math.min(Math.floor(r.scoreOverall / 10), 9);
        histogramData[bucket].count++;
      }
    }
    const scoreHistogram = histogramData;

    // Risk concerns
    const concernCounts: Record<string, number> = {};
    for (const r of reports) {
      const concerns = r.riskConcerns as string[];
      for (const c of concerns) {
        concernCounts[c] = (concernCounts[c] ?? 0) + 1;
      }
    }
    const riskConcerns = Object.entries(concernCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([concern, count]) => ({ concern, count }));

    // Recent reports table
    const recentReportsList = reports.slice(0, 50).map(r => ({
      reportId: r.reportId,
      createdAt: r.createdAt.toISOString(),
      location: r.location,
      overallScore: r.scoreOverall,
      incomeStability: r.incomeStability,
    }));

    // Feedback summary
    const totalFeedback = feedbackRows.length;
    const avgRating = totalFeedback > 0
      ? feedbackRows.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
      : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: feedbackRows.filter(f => f.rating === star).length,
    }));

    const recentComments = feedbackRows
      .filter(f => f.comment && f.comment.trim().length > 0)
      .slice(0, 20)
      .map(f => ({
        reportId: f.reportId,
        rating: f.rating,
        comment: f.comment,
        createdAt: f.createdAt.toISOString(),
      }));

    res.json({
      overview: {
        totalReports,
        avgOverall: Math.round(avgOverall * 10) / 10,
        reportsPerDay,
      },
      demographics,
      scoreAnalytics: {
        avgScores,
        scoreHistogram,
      },
      riskConcerns,
      recentReports: recentReportsList,
      feedback: {
        totalFeedback,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingDistribution,
        recentComments,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching admin analytics");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch analytics." });
  }
});

export default router;
