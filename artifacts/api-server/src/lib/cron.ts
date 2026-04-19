import cron from "node-cron";
import { db, subscriptionsTable, reportFeedbackTable, resilienceReportsTable, usersTable, emailDripQueueTable } from "@workspace/db";
import { and, desc, eq, gte, inArray, isNull, lte, sql } from "drizzle-orm";
import { sendAdminDigest, sendErrorAlert, sendReassessmentReminder, sendUserWeeklyDigest, sendE2eAssessmentReport, sendSiteAuditReport, sendDripDay2Email, sendDripDay5Email, sendDripDay9Email, sendDripDay14Email, type E2eCheckResult } from "./email.js";
import { runDatabaseBackup } from "./backup.js";
import { sendPushNotificationsToUsers } from "./push.js";
import { logger } from "./logger.js";
import { createClerkClient } from "@clerk/express";

const APP_URL = process.env["APP_URL"] ?? "https://resilium-platform.com";

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

// ─── Wednesday e2e assessment test ───────────────────────────────────────────

async function runE2eAssessmentTest() {
  const startMs = Date.now();
  const checks: E2eCheckResult[] = [];
  let testReportId: string | undefined;

  logger.info("Running Wednesday e2e assessment test");

  // Check 1: API health check
  {
    const t = Date.now();
    try {
      const res = await fetch(`${APP_URL}/api/health`, { signal: AbortSignal.timeout(10_000) });
      checks.push({ name: "API health check (/api/health)", passed: res.ok, durationMs: Date.now() - t, detail: res.ok ? undefined : `HTTP ${res.status}` });
    } catch (err: any) {
      checks.push({ name: "API health check (/api/health)", passed: false, durationMs: Date.now() - t, detail: err?.message });
    }
  }

  // Check 2: Submit a realistic test assessment (anonymously)
  {
    const t = Date.now();
    try {
      const payload = {
        location: "Romania",
        incomeStability: "freelance",
        savingsMonths: 6,
        hasDependents: false,
        skills: ["digital", "language"],
        healthStatus: "good",
        mobilityLevel: "medium",
        housingType: "own",
        hasEmergencySupplies: true,
        psychologicalResilience: 7,
        riskConcerns: ["job_loss", "inflation"],
        mentalResilienceAnswers: {
          stressTolerance1: 3, stressTolerance2: 4,
          adaptability1: 4, adaptability2: 3,
          learningAgility1: 4,
          changeManagement1: 3, changeManagement2: 3,
          emotionalRegulation1: 4, emotionalRegulation2: 3,
          socialSupport1: 3,
        },
      };
      // Step 1: Submit — now returns 202 + jobId immediately
      const res = await fetch(`${APP_URL}/api/resilience/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        checks.push({ name: "Submit assessment (POST /api/resilience/assess)", passed: false, durationMs: Date.now() - t, detail: `HTTP ${res.status}: ${body.slice(0, 200)}` });
      } else {
        const { jobId } = await res.json() as any;
        const submitDuration = Date.now() - t;
        checks.push({ name: "Submit assessment (POST /api/resilience/assess)", passed: !!jobId, durationMs: submitDuration, detail: jobId ? `jobId ${jobId.slice(0, 8)}…` : "No jobId returned" });

        // Step 2: Poll until complete (up to 3 minutes for smoke test)
        if (jobId) {
          const pollStart = Date.now();
          const MAX_POLL_MS = 3 * 60 * 1000;
          let pollPassed = false;
          let pollDetail = "Timed out waiting for job completion";
          while (Date.now() - pollStart < MAX_POLL_MS) {
            await new Promise(r => setTimeout(r, 5000));
            try {
              const pollRes = await fetch(`${APP_URL}/api/resilience/jobs/${jobId}`, { signal: AbortSignal.timeout(10_000) });
              if (pollRes.ok) {
                const job = await pollRes.json() as any;
                if (job.status === "complete") {
                  testReportId = job.reportId;
                  pollPassed = true;
                  pollDetail = `Report ${testReportId} generated in ${Math.round((Date.now() - pollStart) / 1000)}s`;
                  break;
                }
                if (job.status === "failed") {
                  pollDetail = job.error ?? "Job failed";
                  break;
                }
              }
            } catch { /* keep polling */ }
          }
          checks.push({ name: "Poll job to completion (GET /api/resilience/jobs/:id)", passed: pollPassed, durationMs: Date.now() - pollStart, detail: pollDetail });
        }
      }
    } catch (err: any) {
      checks.push({ name: "Submit assessment (POST /api/resilience/assess)", passed: false, durationMs: Date.now() - t, detail: err?.message });
    }
  }

  // Check 3: Retrieve the test report
  if (testReportId) {
    const t = Date.now();
    try {
      const res = await fetch(`${APP_URL}/api/resilience/reports/${testReportId}`, { signal: AbortSignal.timeout(10_000) });
      const durationMs = Date.now() - t;
      checks.push({ name: `Retrieve test report (GET /api/resilience/reports/:id)`, passed: res.ok, durationMs, detail: res.ok ? undefined : `HTTP ${res.status}` });
    } catch (err: any) {
      checks.push({ name: `Retrieve test report (GET /api/resilience/reports/:id)`, passed: false, durationMs: Date.now() - t, detail: err?.message });
    }
  }

  // Check 4: Retrieve checklists for the test report
  if (testReportId) {
    const t = Date.now();
    try {
      const res = await fetch(`${APP_URL}/api/resilience/reports/${testReportId}/checklists`, { signal: AbortSignal.timeout(10_000) });
      const durationMs = Date.now() - t;
      checks.push({ name: `Retrieve checklists (GET /api/resilience/reports/:id/checklists)`, passed: res.ok, durationMs, detail: res.ok ? undefined : `HTTP ${res.status}` });
    } catch (err: any) {
      checks.push({ name: `Retrieve checklists (GET /api/resilience/reports/:id/checklists)`, passed: false, durationMs: Date.now() - t, detail: err?.message });
    }
  }

  // Check 5: Web app homepage responds
  {
    const t = Date.now();
    try {
      const res = await fetch(APP_URL, { signal: AbortSignal.timeout(10_000) });
      const durationMs = Date.now() - t;
      checks.push({ name: "Web app homepage (GET /)", passed: res.ok, durationMs, detail: res.ok ? undefined : `HTTP ${res.status}` });
    } catch (err: any) {
      checks.push({ name: "Web app homepage (GET /)", passed: false, durationMs: Date.now() - t, detail: err?.message });
    }
  }

  // Clean up the test report from the DB so it doesn't pollute user data
  if (testReportId) {
    try {
      await db.delete(resilienceReportsTable).where(eq(resilienceReportsTable.reportId, testReportId));
      logger.info({ testReportId }, "E2e test report cleaned up from DB");
    } catch (err) {
      logger.warn({ err, testReportId }, "Failed to clean up e2e test report");
    }
  }

  const passed = checks.every(c => c.passed);
  const totalMs = Date.now() - startMs;
  logger.info({ passed, checks: checks.map(c => ({ name: c.name, passed: c.passed })), totalMs }, "Wednesday e2e assessment test complete");

  await sendE2eAssessmentReport({ passed, checks, totalMs, reportId: testReportId }).catch(err =>
    logger.error({ err }, "Failed to send e2e assessment report email")
  );
}

// ─── Sunday site-wide functionality audit ────────────────────────────────────

async function runSiteAudit() {
  const startMs = Date.now();
  const checks: E2eCheckResult[] = [];

  logger.info("Running Sunday site-wide functionality audit");

  const endpoints: Array<{ name: string; url: string; expectedStatus?: number }> = [
    { name: "API health (/api/health)", url: `${APP_URL}/api/health` },
    { name: "Announcements (/api/announcements)", url: `${APP_URL}/api/announcements` },
    { name: "Testimonials (/api/feedback/testimonials)", url: `${APP_URL}/api/feedback/testimonials` },
    { name: "Web app homepage (/)", url: APP_URL },
    { name: "Assessment page (/assess)", url: `${APP_URL}/assess` },
    { name: "Pricing page (/pricing)", url: `${APP_URL}/pricing` },
    { name: "Consent page (/consent)", url: `${APP_URL}/consent` },
  ];

  for (const endpoint of endpoints) {
    const t = Date.now();
    try {
      const res = await fetch(endpoint.url, { signal: AbortSignal.timeout(15_000) });
      const expected = endpoint.expectedStatus ?? 200;
      const passed = res.status === expected || (endpoint.expectedStatus == null && res.ok);
      checks.push({ name: endpoint.name, passed, durationMs: Date.now() - t, detail: passed ? undefined : `HTTP ${res.status} (expected ${expected})` });
    } catch (err: any) {
      checks.push({ name: endpoint.name, passed: false, durationMs: Date.now() - t, detail: err?.message });
    }
  }

  // Check the most recent real user report is retrievable
  {
    const t = Date.now();
    try {
      const [latestReport] = await db
        .select({ reportId: resilienceReportsTable.reportId })
        .from(resilienceReportsTable)
        .orderBy(desc(resilienceReportsTable.createdAt))
        .limit(1);
      if (latestReport) {
        const res = await fetch(`${APP_URL}/api/resilience/reports/${latestReport.reportId}`, { signal: AbortSignal.timeout(15_000) });
        checks.push({
          name: "Most recent user report retrievable",
          passed: res.ok,
          durationMs: Date.now() - t,
          detail: res.ok ? `Report ${latestReport.reportId.slice(0, 8)}…` : `HTTP ${res.status}`,
        });
      } else {
        checks.push({ name: "Most recent user report retrievable", passed: false, durationMs: Date.now() - t, detail: "No reports in database" });
      }
    } catch (err: any) {
      checks.push({ name: "Most recent user report retrievable", passed: false, durationMs: Date.now() - t, detail: err?.message });
    }
  }

  // Check DB connectivity directly
  {
    const t = Date.now();
    try {
      const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(resilienceReportsTable);
      checks.push({ name: "Database connectivity (report count)", passed: true, durationMs: Date.now() - t, detail: `${row?.count ?? 0} total reports` });
    } catch (err: any) {
      checks.push({ name: "Database connectivity (report count)", passed: false, durationMs: Date.now() - t, detail: err?.message });
    }
  }

  const passed = checks.every(c => c.passed);
  const totalMs = Date.now() - startMs;
  logger.info({ passed, checks: checks.map(c => ({ name: c.name, passed: c.passed })), totalMs }, "Sunday site audit complete");

  await sendSiteAuditReport({ passed, checks, totalMs }).catch(err =>
    logger.error({ err }, "Failed to send site audit email")
  );
}

// ─── Post-assessment drip email processor ────────────────────────────────────

async function runDripProcessor() {
  if (process.env["DRIP_EMAILS_ENABLED"] !== "true") return;

  try {
    logger.info("Running drip email processor");
    const now = new Date();

    const dueRows = await db
      .select()
      .from(emailDripQueueTable)
      .where(and(
        lte(emailDripQueueTable.scheduledFor, now),
        isNull(emailDripQueueTable.sentAt),
        isNull(emailDripQueueTable.cancelledAt),
      ));

    if (dueRows.length === 0) {
      logger.info("Drip processor: no due emails");
      return;
    }

    logger.info({ count: dueRows.length }, "Drip processor: emails due");
    const clerkClient = createClerkClient({ secretKey: process.env["CLERK_SECRET_KEY"] });
    const optedOut = await getOptedOutUserIds();

    for (const row of dueRows) {
      if (optedOut.has(row.userId)) {
        await db.update(emailDripQueueTable).set({ cancelledAt: now }).where(eq(emailDripQueueTable.id, row.id));
        continue;
      }

      try {
        const clerkUser = await clerkClient.users.getUser(row.userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) {
          await db.update(emailDripQueueTable).set({ cancelledAt: now }).where(eq(emailDripQueueTable.id, row.id));
          continue;
        }

        const base = {
          email,
          firstName: clerkUser.firstName,
          userId: row.userId,
          reportId: row.reportId,
          scoreOverall: row.scoreOverall,
        };

        switch (row.emailType) {
          case "day2":
            await sendDripDay2Email({ ...base, weakestDimension: row.weakestDimension ?? "Financial" });
            break;
          case "day5":
            await sendDripDay5Email(base);
            break;
          case "day9":
            await sendDripDay9Email(base);
            break;
          case "day14":
            await sendDripDay14Email(base);
            break;
          default:
            logger.warn({ emailType: row.emailType, id: row.id }, "Drip processor: unknown emailType — skipping");
            continue;
        }

        await db.update(emailDripQueueTable).set({ sentAt: now }).where(eq(emailDripQueueTable.id, row.id));
        logger.info({ id: row.id, userId: row.userId, emailType: row.emailType }, "Drip email sent");
      } catch (err) {
        logger.error({ err, id: row.id, userId: row.userId, emailType: row.emailType }, "Drip email send failed");
      }
    }

    logger.info({ processed: dueRows.length }, "Drip processor complete");
  } catch (err) {
    logger.error({ err }, "Drip processor failed");
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

  // Every Wednesday at 06:00 UTC — e2e assessment smoke test
  cron.schedule("0 6 * * 3", () => {
    runE2eAssessmentTest().catch(() => {});
  }, { timezone: "UTC" });

  // Every Sunday at 07:00 UTC — site-wide functionality audit
  cron.schedule("0 7 * * 0", () => {
    runSiteAudit().catch(() => {});
  }, { timezone: "UTC" });

  // Every hour at :15 — post-assessment drip email processor (no-op when DRIP_EMAILS_ENABLED≠true)
  cron.schedule("15 * * * *", () => {
    runDripProcessor().catch(() => {});
  }, { timezone: "UTC" });

  // Every day at 02:30 UTC — full database backup to object storage (keeps last 7 days)
  cron.schedule("30 2 * * *", () => {
    runDatabaseBackup().catch(() => {});
  }, { timezone: "UTC" });

  logger.info("Cron jobs scheduled (admin digest: Mon 07:00, user digest: Sun 18:00, 7d reminders: daily 09:00, 30d reminders: Mon 08:00, e2e test: Wed 06:00, site audit: Sun 07:00, drip: hourly :15, db-backup: daily 02:30 UTC)");
}
