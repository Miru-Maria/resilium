import { Router, type IRouter } from "express";
import { db, broadcastCampaignsTable, usersTable, subscriptionsTable, resilienceReportsTable } from "@workspace/db";
import { eq, desc, and, lte } from "drizzle-orm";
import { createClerkClient } from "@clerk/express";
import { requireAdminSession } from "../../middlewares/adminAuth.js";
import { logger } from "../../lib/logger.js";
import { sendBroadcastEmail } from "../../lib/email.js";

const router: IRouter = Router();
router.use(requireAdminSession);

async function getSegmentUserIds(segment: string): Promise<{ id: string }[]> {
  if (segment === "all") {
    return db.select({ id: usersTable.id }).from(usersTable);
  }
  if (segment === "pro") {
    const subs = await db
      .select({ userId: subscriptionsTable.userId })
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.status, "active"));
    return subs.map(s => ({ id: s.userId }));
  }
  if (segment === "free") {
    const proSubs = await db
      .select({ userId: subscriptionsTable.userId })
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.status, "active"));
    const proIds = new Set(proSubs.map(s => s.userId));
    const all = await db.select({ id: usersTable.id }).from(usersTable);
    return all.filter(u => !proIds.has(u.id));
  }
  if (segment === "free_assessed_14d") {
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const proSubs = await db
      .select({ userId: subscriptionsTable.userId })
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.status, "active"));
    const proIds = new Set(proSubs.map(s => s.userId));

    const assessed = await db
      .select({ userId: resilienceReportsTable.userId })
      .from(resilienceReportsTable)
      .where(lte(resilienceReportsTable.createdAt, cutoff))
      .groupBy(resilienceReportsTable.userId);

    return assessed
      .filter(r => !proIds.has(r.userId))
      .map(r => ({ id: r.userId }));
  }
  return [];
}

router.get("/", async (_req, res) => {
  try {
    const campaigns = await db
      .select()
      .from(broadcastCampaignsTable)
      .orderBy(desc(broadcastCampaignsTable.createdAt))
      .limit(50);
    res.json({ campaigns: campaigns.map(c => ({ ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(), sentAt: c.sentAt?.toISOString() ?? null })) });
  } catch (err) {
    logger.error({ err }, "Error fetching broadcasts");
    res.status(500).json({ error: "Failed to fetch broadcasts" });
  }
});

router.post("/preview-count", async (req, res) => {
  try {
    const { segment } = req.body as { segment?: string };
    if (!segment) { res.status(400).json({ error: "segment required" }); return; }
    const users = await getSegmentUserIds(segment);
    res.json({ count: users.length });
  } catch (err) {
    logger.error({ err }, "Error counting segment");
    res.status(500).json({ error: "Failed to count segment" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, subject, body, segment, sendNow } = req.body as {
      name?: string; subject?: string; body?: string; segment?: string; sendNow?: boolean;
    };

    if (!name || !subject || !body || !segment) {
      res.status(400).json({ error: "name, subject, body, and segment are required" });
      return;
    }

    const validSegments = ["all", "pro", "free", "free_assessed_14d"];
    if (!validSegments.includes(segment)) {
      res.status(400).json({ error: `segment must be one of: ${validSegments.join(", ")}` });
      return;
    }

    const [campaign] = await db.insert(broadcastCampaignsTable).values({
      name, subject, body, segment,
      status: sendNow ? "sending" : "draft",
    }).returning();

    if (!campaign) { res.status(500).json({ error: "Failed to create campaign" }); return; }

    if (!sendNow) {
      res.status(201).json({ campaign: { ...campaign, createdAt: campaign.createdAt.toISOString(), updatedAt: campaign.updatedAt.toISOString(), sentAt: null } });
      return;
    }

    res.status(201).json({ campaign: { ...campaign, createdAt: campaign.createdAt.toISOString(), updatedAt: campaign.updatedAt.toISOString(), sentAt: null }, sending: true });

    setImmediate(async () => {
      try {
        const clerkClient = createClerkClient({ secretKey: process.env["CLERK_SECRET_KEY"] });
        const segmentUsers = await getSegmentUserIds(segment);

        const optedOut = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.emailOptOut, true));
        const optedOutIds = new Set(optedOut.map(u => u.id));

        let sent = 0;
        let failed = 0;

        for (const user of segmentUsers) {
          if (optedOutIds.has(user.id)) continue;
          try {
            const clerkUser = await clerkClient.users.getUser(user.id);
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            if (!email) continue;
            await sendBroadcastEmail({
              to: email,
              subject,
              body,
              firstName: clerkUser.firstName,
              userId: user.id,
            });
            sent++;
            await new Promise(r => setTimeout(r, 80));
          } catch (err) {
            failed++;
            logger.error({ err, userId: user.id }, "Broadcast send failed for user");
          }
        }

        await db.update(broadcastCampaignsTable)
          .set({ status: "sent", sentCount: sent, failedCount: failed, sentAt: new Date(), updatedAt: new Date() })
          .where(eq(broadcastCampaignsTable.id, campaign.id));

        logger.info({ campaignId: campaign.id, sent, failed }, "Broadcast campaign sent");
      } catch (err) {
        logger.error({ err, campaignId: campaign.id }, "Broadcast campaign failed");
        await db.update(broadcastCampaignsTable)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(broadcastCampaignsTable.id, campaign.id));
      }
    });
  } catch (err) {
    logger.error({ err }, "Error creating broadcast");
    res.status(500).json({ error: "Failed to create broadcast" });
  }
});

router.post("/:id/send", async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [campaign] = await db.select().from(broadcastCampaignsTable).where(eq(broadcastCampaignsTable.id, id)).limit(1);
    if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }
    if (campaign.status === "sent") { res.status(400).json({ error: "Campaign already sent" }); return; }

    await db.update(broadcastCampaignsTable).set({ status: "sending", updatedAt: new Date() }).where(eq(broadcastCampaignsTable.id, id));
    res.json({ success: true, message: "Campaign is now sending..." });

    setImmediate(async () => {
      try {
        const clerkClient = createClerkClient({ secretKey: process.env["CLERK_SECRET_KEY"] });
        const segmentUsers = await getSegmentUserIds(campaign.segment);
        const optedOut = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.emailOptOut, true));
        const optedOutIds = new Set(optedOut.map(u => u.id));

        let sent = 0;
        let failed = 0;

        for (const user of segmentUsers) {
          if (optedOutIds.has(user.id)) continue;
          try {
            const clerkUser = await clerkClient.users.getUser(user.id);
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            if (!email) continue;
            await sendBroadcastEmail({ to: email, subject: campaign.subject, body: campaign.body, firstName: clerkUser.firstName, userId: user.id });
            sent++;
            await new Promise(r => setTimeout(r, 80));
          } catch {
            failed++;
          }
        }

        await db.update(broadcastCampaignsTable)
          .set({ status: "sent", sentCount: sent, failedCount: failed, sentAt: new Date(), updatedAt: new Date() })
          .where(eq(broadcastCampaignsTable.id, id));
        logger.info({ campaignId: id, sent, failed }, "Broadcast sent");
      } catch (err) {
        logger.error({ err, campaignId: id }, "Broadcast send failed");
        await db.update(broadcastCampaignsTable).set({ status: "failed", updatedAt: new Date() }).where(eq(broadcastCampaignsTable.id, id));
      }
    });
  } catch (err) {
    logger.error({ err }, "Error sending broadcast");
    res.status(500).json({ error: "Failed to send broadcast" });
  }
});

export default router;
