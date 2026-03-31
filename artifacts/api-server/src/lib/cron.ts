import cron from "node-cron";
import { db, subscriptionsTable, reportFeedbackTable, resilienceReportsTable } from "@workspace/db";
import { gte, sql } from "drizzle-orm";
import { sendAdminDigest, sendErrorAlert, sendReassessmentReminder } from "./email.js";
import { sendPushNotificationsToUsers } from "./push.js";
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

// ─── Coaching click tracking ──────────────────────────────────────────────────

let coachingClickCount = 0;

export function recordCoachingClick(): void {
  coachingClickCount += 1;
  logger.info({ total: coachingClickCount }, "Coaching page click recorded");
}

export function getCoachingClickCount(): number {
  return coachingClickCount;
}

// ─── Re-assessment reminder ───────────────────────────────────────────────────

async function runReassessmentReminders() {
  try {
    logger.info("Running re-assessment reminder job");
    const windowStart = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
    const windowEnd   = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

    // Find users whose most-recent report falls in the 28–35 day window
    const rows = await db.execute(sql`
      WITH latest AS (
        SELECT user_id,
               MAX(created_at)    AS last_at,
               MAX(score_overall) AS last_score
        FROM   resilience_reports
        WHERE  user_id IS NOT NULL
        GROUP  BY user_id
      )
      SELECT l.user_id, l.last_score, l.last_at,
             u.email, u.first_name
      FROM   latest l
      JOIN   users u ON u.id = l.user_id
      WHERE  u.email IS NOT NULL
        AND  l.last_at >= ${windowStart}
        AND  l.last_at <= ${windowEnd}
    `);

    const users = rows.rows as Array<{ user_id: string; last_score: number; last_at: Date; email: string; first_name: string | null }>;
    logger.info({ count: users.length }, "Re-assessment reminder candidates");

    const userIds: string[] = users.map(u => u.user_id);

    for (const u of users) {
      const daysSince = Math.round((Date.now() - new Date(u.last_at).getTime()) / (1000 * 60 * 60 * 24));
      await sendReassessmentReminder({
        email: u.email,
        firstName: u.first_name,
        lastScore: Math.round(u.last_score),
        daysSince,
      }).catch(() => {});
    }

    // Also send push notifications to users who have registered a token
    if (userIds.length > 0) {
      await sendPushNotificationsToUsers(
        userIds,
        "Time for your monthly check-in",
        "A lot can change in 30 days. Retake your Resilium assessment to see where you stand.",
        { screen: "assessment" }
      ).catch(() => {});
    }
  } catch (err) {
    logger.error({ err }, "Failed to run re-assessment reminders");
  }
}

// ─── Weekly stats ─────────────────────────────────────────────────────────────

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
    coachingClicks: coachingClickCount,
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
  // Every Monday at 07:00 UTC — weekly admin digest
  cron.schedule("0 7 * * 1", () => {
    runWeeklyDigest().catch(() => {});
  }, { timezone: "UTC" });

  // Every Monday at 08:00 UTC — re-assessment reminders
  cron.schedule("0 8 * * 1", () => {
    runReassessmentReminders().catch(() => {});
  }, { timezone: "UTC" });

  logger.info("Cron jobs scheduled (digest: Mon 07:00, reminders: Mon 08:00 UTC)");
}
