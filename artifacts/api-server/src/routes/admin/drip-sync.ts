import { Router, type IRouter } from "express";
import { createClerkClient } from "@clerk/express";
import { db, usersTable, emailDripQueueTable, resilienceReportsTable } from "@workspace/db";
import { eq, and, isNull, isNotNull, inArray, desc, count } from "drizzle-orm";
import { requireAdminSession } from "../../middlewares/adminAuth.js";
import { logger } from "../../lib/logger.js";

const router: IRouter = Router();
router.use(requireAdminSession);

router.get("/stats", async (_req, res) => {
  try {
    const total = await db.select({ cnt: count() }).from(emailDripQueueTable);
    const sent = await db.select({ cnt: count() }).from(emailDripQueueTable)
      .where(isNotNull(emailDripQueueTable.sentAt));
    const cancelled = await db.select({ cnt: count() }).from(emailDripQueueTable)
      .where(isNotNull(emailDripQueueTable.cancelledAt));
    const pending = await db.select({ cnt: count() }).from(emailDripQueueTable)
      .where(and(isNull(emailDripQueueTable.sentAt), isNull(emailDripQueueTable.cancelledAt)));

    const byType = await db
      .select({ emailType: emailDripQueueTable.emailType, cnt: count() })
      .from(emailDripQueueTable)
      .where(isNotNull(emailDripQueueTable.sentAt))
      .groupBy(emailDripQueueTable.emailType);

    const recent = await db
      .select()
      .from(emailDripQueueTable)
      .where(isNotNull(emailDripQueueTable.sentAt))
      .orderBy(desc(emailDripQueueTable.sentAt))
      .limit(10);

    res.json({
      total: Number(total[0]?.cnt ?? 0),
      sent: Number(sent[0]?.cnt ?? 0),
      cancelled: Number(cancelled[0]?.cnt ?? 0),
      pending: Number(pending[0]?.cnt ?? 0),
      byType: byType.map(r => ({ emailType: r.emailType, sent: Number(r.cnt) })),
      recentSent: recent.map(r => ({
        id: r.id,
        userId: r.userId,
        emailType: r.emailType,
        scoreOverall: r.scoreOverall,
        sentAt: r.sentAt?.toISOString() ?? null,
        scheduledFor: r.scheduledFor.toISOString(),
      })),
    });
  } catch (err) {
    logger.error({ err }, "Error fetching drip stats");
    res.status(500).json({ error: "Failed to fetch drip stats" });
  }
});

// ── Clerk REST API helper ─────────────────────────────────────────────────────
// Uses fetch directly against the Clerk Backend REST API instead of the SDK
// to guarantee correct pagination and avoid SDK initialization issues.
type ClerkRestUser = {
  id: string;
  email_addresses: Array<{ id: string; email_address: string }>;
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  created_at: number; // Unix ms
};

async function fetchAllClerkUsers(secretKey: string): Promise<ClerkRestUser[]> {
  const all: ClerkRestUser[] = [];
  const limit = 500; // Clerk max per page
  let offset = 0;

  while (true) {
    const url = `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}&order_by=-created_at`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
    });

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Clerk API ${resp.status}: ${body.slice(0, 200)}`);
    }

    const page: ClerkRestUser[] = await resp.json();
    all.push(...page);
    if (page.length < limit) break;
    offset += limit;
  }

  return all;
}

// ── GET /check ─────────────────────────────────────────────────────────────────
// Diagnostic endpoint: shows key presence, Clerk user count, and local DB count.
router.get("/check", async (_req, res) => {
  const secretKey = process.env["CLERK_SECRET_KEY"];
  const keyPresent = !!secretKey;
  const keyPrefix = secretKey ? secretKey.slice(0, 14) + "…" : "(not set)";

  let clerkCount: number | null = null;
  let clerkError: string | null = null;
  let localCount: number | null = null;

  try {
    const users = await fetchAllClerkUsers(secretKey ?? "");
    clerkCount = users.length;
  } catch (err) {
    clerkError = String(err).slice(0, 200);
  }

  try {
    const rows = await db.select({ cnt: count() }).from(usersTable);
    localCount = Number(rows[0]?.cnt ?? 0);
  } catch (_) {}

  res.json({ keyPresent, keyPrefix, clerkCount, clerkError, localCount });
});

// ── POST /clerk-import ────────────────────────────────────────────────────────
// Fetches EVERY user from Clerk's REST API and upserts them into the local
// users table. Makes them visible to broadcast segments and drip enrollment.
router.post("/clerk-import", async (_req, res) => {
  const secretKey = process.env["CLERK_SECRET_KEY"];

  if (!secretKey) {
    res.status(500).json({ error: "CLERK_SECRET_KEY is not set in this environment. Add it under Secrets and redeploy." });
    return;
  }

  try {
    const allClerkUsers = await fetchAllClerkUsers(secretKey);
    logger.info({ total: allClerkUsers.length }, "Fetched all Clerk users via REST API");

    let imported = 0;
    let alreadyExisted = 0;
    let failed = 0;
    const errors: string[] = [];

    // Load existing user IDs in one query
    const existingRows = await db.select({ id: usersTable.id }).from(usersTable);
    const existingIds = new Set(existingRows.map(r => r.id));

    for (const cu of allClerkUsers) {
      try {
        const primaryEmail =
          cu.email_addresses.find(e => e.id === cu.primary_email_address_id)
          ?? cu.email_addresses[0];

        if (!primaryEmail) {
          failed++;
          errors.push(`${cu.id}: no email address`);
          continue;
        }

        if (existingIds.has(cu.id)) {
          // Refresh name/email in case they changed it in Clerk
          await db.update(usersTable)
            .set({
              email: primaryEmail.email_address,
              firstName: cu.first_name ?? undefined,
              lastName: cu.last_name ?? undefined,
              profileImageUrl: cu.image_url ?? undefined,
            })
            .where(eq(usersTable.id, cu.id));
          alreadyExisted++;
        } else {
          await db.insert(usersTable).values({
            id: cu.id,
            email: primaryEmail.email_address,
            firstName: cu.first_name ?? null,
            lastName: cu.last_name ?? null,
            profileImageUrl: cu.image_url ?? null,
            createdAt: new Date(cu.created_at),
          }).onConflictDoNothing();
          imported++;
          existingIds.add(cu.id);
        }
      } catch (err) {
        failed++;
        errors.push(`${cu.id}: ${String(err)}`);
        logger.warn({ err, userId: cu.id }, "Failed to upsert Clerk user");
      }
    }

    logger.info({ total: allClerkUsers.length, imported, alreadyExisted, failed }, "Clerk import complete");
    res.json({
      totalClerk: allClerkUsers.length,
      imported,
      alreadyExisted,
      failed,
      errors: errors.slice(0, 5),
      message: `Imported ${imported} new users from Clerk (${alreadyExisted} already existed, ${failed} failed).`,
    });
  } catch (err) {
    const msg = String(err);
    logger.error({ err }, "Clerk import failed");
    res.status(500).json({ error: `Clerk import failed: ${msg.slice(0, 200)}` });
  }
});

router.post("/sync", async (req, res) => {
  if (process.env["DRIP_EMAILS_ENABLED"] !== "true") {
    res.status(400).json({ error: "DRIP_EMAILS_ENABLED is not set to true — enable it first" });
    return;
  }

  try {
    const allUsers = await db.select({ id: usersTable.id, createdAt: usersTable.createdAt }).from(usersTable);

    const enrolledRows = await db
      .select({ userId: emailDripQueueTable.userId })
      .from(emailDripQueueTable);
    const enrolledUserIds = new Set(enrolledRows.map(r => r.userId));

    const unenrolled = allUsers.filter(u => !enrolledUserIds.has(u.id));

    if (unenrolled.length === 0) {
      res.json({ enrolled: 0, skipped: allUsers.length, message: "All users are already enrolled in the drip sequence." });
      return;
    }

    const clerkClient = createClerkClient({ secretKey: process.env["CLERK_SECRET_KEY"] });
    let enrolled = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const user of unenrolled) {
      try {
        const latestReport = await db
          .select({ reportId: resilienceReportsTable.reportId, scoreOverall: resilienceReportsTable.scoreOverall })
          .from(resilienceReportsTable)
          .where(eq(resilienceReportsTable.userId, user.id))
          .orderBy(desc(resilienceReportsTable.createdAt))
          .limit(1);

        if (!latestReport[0]) continue;

        const { reportId, scoreOverall } = latestReport[0];
        const signupDate = user.createdAt;
        const daysSinceSignup = Math.floor((Date.now() - signupDate.getTime()) / (24 * 60 * 60 * 1000));

        const now = new Date();
        const dayOffset = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

        const rows: typeof emailDripQueueTable.$inferInsert[] = [];

        if (daysSinceSignup < 2) {
          rows.push(
            { userId: user.id, reportId, emailType: "day0",  scoreOverall, scheduledFor: signupDate, sentAt: now },
            { userId: user.id, reportId, emailType: "day2",  scoreOverall, scheduledFor: dayOffset(2 - daysSinceSignup) },
            { userId: user.id, reportId, emailType: "day5",  scoreOverall, scheduledFor: dayOffset(5 - daysSinceSignup) },
            { userId: user.id, reportId, emailType: "day9",  scoreOverall, scheduledFor: dayOffset(9 - daysSinceSignup) },
            { userId: user.id, reportId, emailType: "day14", scoreOverall, scheduledFor: dayOffset(14 - daysSinceSignup) },
          );
        } else if (daysSinceSignup < 5) {
          rows.push(
            { userId: user.id, reportId, emailType: "day0",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day2",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day5",  scoreOverall, scheduledFor: dayOffset(5 - daysSinceSignup) },
            { userId: user.id, reportId, emailType: "day9",  scoreOverall, scheduledFor: dayOffset(9 - daysSinceSignup) },
            { userId: user.id, reportId, emailType: "day14", scoreOverall, scheduledFor: dayOffset(14 - daysSinceSignup) },
          );
        } else if (daysSinceSignup < 9) {
          rows.push(
            { userId: user.id, reportId, emailType: "day0",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day2",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day5",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day9",  scoreOverall, scheduledFor: dayOffset(9 - daysSinceSignup) },
            { userId: user.id, reportId, emailType: "day14", scoreOverall, scheduledFor: dayOffset(14 - daysSinceSignup) },
          );
        } else if (daysSinceSignup < 14) {
          rows.push(
            { userId: user.id, reportId, emailType: "day0",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day2",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day5",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day9",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day14", scoreOverall, scheduledFor: dayOffset(14 - daysSinceSignup) },
          );
        } else {
          rows.push(
            { userId: user.id, reportId, emailType: "day0",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day2",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day5",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day9",  scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
            { userId: user.id, reportId, emailType: "day14", scoreOverall, scheduledFor: signupDate, sentAt: now, cancelledAt: now },
          );
        }

        if (rows.length > 0) {
          await db.insert(emailDripQueueTable).values(rows).onConflictDoNothing();
          enrolled++;
        }
      } catch (err) {
        failed++;
        errors.push(`${user.id}: ${String(err)}`);
      }
    }

    logger.info({ enrolled, failed, total: unenrolled.length }, "Drip sync complete");
    res.json({ enrolled, failed, skipped: enrolledUserIds.size, total: allUsers.length, errors: errors.slice(0, 5) });
  } catch (err) {
    logger.error({ err }, "Drip sync failed");
    res.status(500).json({ error: "Drip sync failed" });
  }
});

export default router;
