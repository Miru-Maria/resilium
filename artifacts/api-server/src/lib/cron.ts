import cron from "node-cron";
import { db, subscriptionsTable, reportFeedbackTable, resilienceReportsTable, usersTable } from "@workspace/db";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { sendAdminDigest, sendErrorAlert, sendReassessmentReminder, sendUserWeeklyDigest } from "./email.js";
import { sendPushNotificationsToUsers } from "./push.js";
import { logger } from "./logger.js";
import { createClerkClient } from "@clerk/express";

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

// ─── Opt-out helpers ──────────────────────────────────────────────────────────

async function getOptedOutUserIds(): Promise<Set<string>> {
  try {
    const rows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.emailOptOut, true));
    return new Set(rows.map(r => r.id));
  } catch {
    return new Set();
  }
}

// ─── Re-assessment reminder helper ───────────────────────────────────────────

async function fetchReminders(dayFrom: number, dayTo: number) {
  const windowStart = new Date(Date.now() - dayTo   * 24 * 60 * 60 * 1000);
  const windowEnd   = new Date(Date.now() - dayFrom * 24 * 60 * 60 * 1000);

  // Fetch only the report data — no join on local users table (Clerk is source of truth)
  const rows = await db.execute(sql`
    WITH latest AS (
      SELECT user_id,
             MAX(created_at)    AS last_at,
             MAX(score_overall) AS last_score
      FROM   resilience_reports
      WHERE  user_id IS NOT NULL
      GROUP  BY user_id
    )
    SELECT l.user_id, l.last_score, l.last_at
    FROM   latest l
    WHERE  l.last_at >= ${windowStart}
      AND  l.last_at <= ${windowEnd}
  `);

  const rawRows = rows.rows as Array<{ user_id: string; last_score: number; last_at: Date }>;
  if (rawRows.length === 0) return [];

  // Resolve email + name from Clerk
  const clerkClient = createClerkClient({ secretKey: process.env["CLERK_SECRET_KEY"] });
  const enriched: Array<{ user_id: string; last_score: number; last_at: Date; email: string; first_name: string | null }> = [];

  for (const row of rawRows) {
    try {
      const clerkUser = await clerkClient.users.getUser(row.user_id);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) continue;
      enriched.push({
        user_id: row.user_id,
        last_score: row.last_score,
        last_at: row.last_at,
        email,
        first_name: clerkUser.firstName ?? null,
      });
    } catch {
      // User may have been deleted from Clerk — skip silently
    }
  }

  return enriched;
}

// ─── 7-day re-engagement reminder ─────────────────────────────────────────────

async function runEarlyReminders() {
  try {
    logger.info("Running 7-day re-engagement reminder job");
    const [users, optedOut] = await Promise.all([
      fetchReminders(5, 9),
      getOptedOutUserIds(),
    ]);
    const eligible = users.filter(u => !optedOut.has(u.user_id));
    logger.info({ candidates: users.length, eligible: eligible.length }, "7-day reminder candidates");

    const userIds: string[] = eligible.map(u => u.user_id);

    for (const u of eligible) {
      const daysSince = Math.round((Date.now() - new Date(u.last_at).getTime()) / (1000 * 60 * 60 * 24));
      await sendReassessmentReminder({
        email: u.email,
        firstName: u.first_name,
        lastScore: Math.round(u.last_score),
        daysSince,
        userId: u.user_id,
      }).catch(() => {});
    }

    if (userIds.length > 0) {
      await sendPushNotificationsToUsers(
        userIds,
        "One action from your Resilium plan",
        "It's been a week. Pick one item from your plan and take it today.",
        { screen: "results" }
      ).catch(() => {});
    }
  } catch (err) {
    logger.error({ err }, "Failed to run 7-day re-engagement reminders");
  }
}

// ─── 30-day re-assessment reminder ────────────────────────────────────────────

async function runReassessmentReminders() {
  try {
    logger.info("Running 30-day re-assessment reminder job");
    const [users, optedOut] = await Promise.all([
      fetchReminders(28, 35),
      getOptedOutUserIds(),
    ]);
    const eligible = users.filter(u => !optedOut.has(u.user_id));
    logger.info({ candidates: users.length, eligible: eligible.length }, "30-day re-assessment reminder candidates");

    const userIds: string[] = eligible.map(u => u.user_id);

    for (const u of eligible) {
      const daysSince = Math.round((Date.now() - new Date(u.last_at).getTime()) / (1000 * 60 * 60 * 24));
      await sendReassessmentReminder({
        email: u.email,
        firstName: u.first_name,
        lastScore: Math.round(u.last_score),
        daysSince,
        userId: u.user_id,
      }).catch(() => {});
    }

    if (userIds.length > 0) {
      await sendPushNotificationsToUsers(
        userIds,
        "Time for your monthly check-in",
        "A lot can change in 30 days. Retake your Resilium assessment to see where you stand.",
        { screen: "assessment" }
      ).catch(() => {});
    }
  } catch (err) {
    logger.error({ err }, "Failed to run 30-day re-assessment reminders");
  }
}

// ─── User weekly digest ───────────────────────────────────────────────────────

async function runUserWeeklyDigest() {
  try {
    logger.info("Running user weekly digest job");

    // Fetch users with a report in the last 60 days (active users only)
    const sinceDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const rows = await db.execute(sql`
      WITH latest AS (
        SELECT DISTINCT ON (user_id)
               user_id,
               id          AS report_id,
               score_overall,
               created_at
        FROM   resilience_reports
        WHERE  user_id IS NOT NULL
          AND  created_at >= ${sinceDate}
        ORDER  BY user_id, created_at DESC
      )
      SELECT user_id, report_id, score_overall
      FROM   latest
    `);

    const rawRows = rows.rows as Array<{ user_id: string; report_id: string; score_overall: number }>;
    logger.info({ count: rawRows.length }, "User weekly digest candidates");
    if (rawRows.length === 0) return;

    const [clerkClient, optedOut] = [
      createClerkClient({ secretKey: process.env["CLERK_SECRET_KEY"] }),
      await getOptedOutUserIds(),
    ];
    const eligibleRows = rawRows.filter(r => !optedOut.has(r.user_id));

    for (const row of eligibleRows) {
      try {
        const clerkUser = await clerkClient.users.getUser(row.user_id);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) continue;
        await sendUserWeeklyDigest({
          email,
          firstName: clerkUser.firstName ?? null,
          lastScore: Math.round(row.score_overall),
          reportId: row.report_id,
          userId: row.user_id,
        }).catch(() => {});
      } catch {
        // User may have been deleted from Clerk — skip
      }
    }

    logger.info({ sent: rawRows.length }, "User weekly digest complete");
  } catch (err) {
    logger.error({ err }, "Failed to run user weekly digest");
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

  // Every day at 09:00 UTC — 7-day re-engagement reminders
  cron.schedule("0 9 * * *", () => {
    runEarlyReminders().catch(() => {});
  }, { timezone: "UTC" });

  // Every Monday at 08:00 UTC — 30-day re-assessment reminders
  cron.schedule("0 8 * * 1", () => {
    runReassessmentReminders().catch(() => {});
  }, { timezone: "UTC" });

  // Every Sunday at 18:00 UTC — user weekly digest
  cron.schedule("0 18 * * 0", () => {
    runUserWeeklyDigest().catch(() => {});
  }, { timezone: "UTC" });

  logger.info("Cron jobs scheduled (admin digest: Mon 07:00, user digest: Sun 18:00, 7d reminders: daily 09:00, 30d reminders: Mon 08:00 UTC)");
}
