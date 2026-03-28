import cron from "node-cron";
import { db, subscriptionsTable, reportFeedbackTable, resilienceReportsTable } from "@workspace/db";
import { gte, sql, eq, and } from "drizzle-orm";
import { sendAdminDigest, sendErrorAlert } from "./email.js";
import { logger } from "./logger.js";

// ─── In-memory error rate tracking ───────────────────────────────────────────

interface ErrorWindow {
  count: number;
  errors: string[];
  windowStart: number;
}

const errorWindow: ErrorWindow = { count: 0, errors: [], windowStart: Date.now() };
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const ALERT_THRESHOLD = 5;
let alertSentAt = 0;
const ALERT_COOLDOWN_MS = 30 * 60 * 1000; // 30 min between repeat alerts

export function recordServerError(message: string): void {
  const now = Date.now();

  // Reset window if expired
  if (now - errorWindow.windowStart > WINDOW_MS) {
    errorWindow.count = 0;
    errorWindow.errors = [];
    errorWindow.windowStart = now;
  }

  errorWindow.count += 1;
  errorWindow.errors.push(`[${new Date(now).toISOString()}] ${message}`);

  // Fire alert if threshold exceeded and not recently alerted
  if (errorWindow.count >= ALERT_THRESHOLD && now - alertSentAt > ALERT_COOLDOWN_MS) {
    alertSentAt = now;
    sendErrorAlert({
      errorCount: errorWindow.count,
      recentErrors: errorWindow.errors,
    }).catch(() => {});
  }
}

export function getWeeklyErrorCount(): number {
  return errorWindow.count;
}

// ─── Weekly digest ────────────────────────────────────────────────────────────

async function buildWeeklyStats() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalReports] = await db.select({ count: sql<number>`count(*)::int` }).from(resilienceReportsTable);
  const [newReports] = await db.select({ count: sql<number>`count(*)::int` }).from(resilienceReportsTable).where(gte(resilienceReportsTable.createdAt, oneWeekAgo));
  const [avgScoreRow] = await db.select({ avg: sql<number>`round(avg(score_overall))::int` }).from(resilienceReportsTable);
  const [newPro] = await db.select({ count: sql<number>`count(*)::int` })
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.status, "active"), gte(subscriptionsTable.createdAt, oneWeekAgo)));
  const [feedbackTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(reportFeedbackTable);
  const [avgRatingRow] = await db.select({ avg: sql<number>`round(avg(rating)::numeric, 1)::float` }).from(reportFeedbackTable);

  return {
    totalReports: totalReports?.count ?? 0,
    newReportsThisWeek: newReports?.count ?? 0,
    avgScore: avgScoreRow?.avg ?? 0,
    newProSubscribers: newPro?.count ?? 0,
    totalFeedback: feedbackTotal?.count ?? 0,
    avgRating: avgRatingRow?.avg ?? 0,
    errorCount: errorWindow.count,
  };
}

async function runWeeklyDigest() {
  try {
    logger.info("Running weekly admin digest");
    const stats = await buildWeeklyStats();
    await sendAdminDigest(stats);
    // Reset error counter after weekly digest (fresh week)
    errorWindow.count = 0;
    errorWindow.errors = [];
    errorWindow.windowStart = Date.now();
    logger.info({ stats }, "Weekly admin digest sent");
  } catch (err) {
    logger.error({ err }, "Failed to send weekly digest");
  }
}

// ─── Start cron ───────────────────────────────────────────────────────────────

export function startCron(): void {
  // Every Monday at 07:00 UTC
  cron.schedule("0 7 * * 1", () => {
    runWeeklyDigest().catch(() => {});
  }, { timezone: "UTC" });

  logger.info("Cron jobs scheduled (weekly digest: Mon 07:00 UTC)");
}
