import { Router } from "express";
import { db, subscriptionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHmac } from "crypto";
import { logger } from "../lib/logger";

const router = Router();

function verifyPaddleSignature(rawBody: string, signatureHeader: string | undefined, secret: string): boolean {
  if (!signatureHeader) return false;
  const parts: Record<string, string> = {};
  signatureHeader.split(";").forEach((part) => {
    const [k, v] = part.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  });
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;
  const signed = `${ts}:${rawBody}`;
  const expected = createHmac("sha256", secret).update(signed).digest("hex");
  return expected === h1;
}

router.post(
  "/paddle/webhook",
  (req, _res, next) => {
    let rawBody = "";
    req.on("data", (chunk: Buffer) => { rawBody += chunk.toString("utf8"); });
    req.on("end", () => { (req as any).rawBody = rawBody; next(); });
  },
  async (req, res) => {
    const webhookSecret = process.env["PADDLE_WEBHOOK_SECRET"];
    const rawBody = (req as any).rawBody ?? "";

    if (webhookSecret) {
      const sig = req.headers["paddle-signature"] as string | undefined;
      if (!verifyPaddleSignature(rawBody, sig, webhookSecret)) {
        logger.warn("Paddle webhook signature verification failed");
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const eventType: string = event?.event_type ?? "";
    const data = event?.data ?? {};

    logger.info({ eventType }, "Paddle webhook received");

    const customData = data?.custom_data ?? {};
    const userId: string | undefined = customData?.userId;
    const paddleSubId: string | undefined = data?.id;
    const paddleCustomerId: string | undefined = data?.customer_id;
    const status: string = data?.status ?? "active";
    const scheduledChange = data?.scheduled_change;
    const nextBilledAt: string | undefined = data?.next_billed_at;
    const currentPeriodEnd = nextBilledAt ? new Date(nextBilledAt) : undefined;

    if (!userId || !paddleSubId) {
      logger.warn({ eventType, userId, paddleSubId }, "Paddle webhook missing userId or subscriptionId");
      return res.status(200).json({ received: true });
    }

    const resolvedStatus =
      scheduledChange?.action === "cancel" ? "cancel_scheduled" :
      status === "active" ? "active" :
      status === "trialing" ? "active" :
      status === "past_due" ? "past_due" :
      "cancelled";

    try {
      const existing = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).limit(1);

      if (existing.length > 0) {
        await db
          .update(subscriptionsTable)
          .set({
            paddleSubscriptionId: paddleSubId,
            paddleCustomerId: paddleCustomerId ?? existing[0].paddleCustomerId,
            status: resolvedStatus,
            currentPeriodEnd: currentPeriodEnd ?? existing[0].currentPeriodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscriptionsTable.userId, userId));
      } else {
        await db.insert(subscriptionsTable).values({
          userId,
          paddleSubscriptionId: paddleSubId,
          paddleCustomerId,
          status: resolvedStatus,
          currentPeriodEnd,
          planName: "Pro",
        });
      }

      logger.info({ userId, status: resolvedStatus, eventType }, "Subscription updated");
    } catch (err) {
      logger.error({ err }, "Failed to update subscription");
      return res.status(500).json({ error: "DB error" });
    }

    return res.status(200).json({ received: true });
  }
);

export default router;
