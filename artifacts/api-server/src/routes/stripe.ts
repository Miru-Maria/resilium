import Stripe from "stripe";
import { Router } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";
import { getUncachableStripeClient } from "../stripeClient.js";
import { db, usersTable, subscriptionsTable, emailDripQueueTable } from "@workspace/db";
import { eq, and, isNull } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { sendProUpgradeEmail, sendPaymentFailedEmail, sendCancellationEmail, sendPaymentSucceededEmail } from "../lib/email.js";
import { stripeCheckoutLimiter, stripePortalLimiter, stripeDonationLimiter } from "../lib/rate-limiters.js";

const checkoutSchema = z.object({
  billingPeriod: z.enum(["monthly", "annual"]),
});

const router = Router();

// Stripe webhook — must receive raw body (registered before express.json() in app.ts)
router.post("/stripe/webhook", async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature) return res.status(400).json({ error: "Missing stripe-signature" });

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
  const sig = Array.isArray(signature) ? signature[0] : signature;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET is not set");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event: any;
  try {
    const stripe = await getUncachableStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    logger.warn({ err: err.message }, "Stripe webhook verification failed");
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    logger.error({ err }, "Failed to handle Stripe webhook event");
  }

  return res.status(200).json({ received: true });
});

async function handleStripeEvent(event: any) {
  const type: string = event.type;

  // Handle checkout session completed — subscription is created here
  if (type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.mode !== "subscription") return;

    const userId: string | undefined =
      session.metadata?.userId ||
      session.subscription_data?.metadata?.userId;

    const customerId: string = session.customer;
    const subscriptionId: string = session.subscription;

    if (!userId) {
      logger.warn({ sessionId: session.id, customerId }, "checkout.session.completed: no userId in metadata");
      return;
    }

    // Fetch the full subscription to get period end
    const stripe = await getUncachableStripeClient();
    const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;
    const currentPeriodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : undefined;

    await upsertSubscription(userId, subscriptionId, customerId, "active", false, currentPeriodEnd, event);

    // Cancel any pending drip emails — user is now Pro, no need to convert them
    try {
      await db.update(emailDripQueueTable)
        .set({ cancelledAt: new Date() })
        .where(and(
          eq(emailDripQueueTable.userId, userId),
          isNull(emailDripQueueTable.sentAt),
          isNull(emailDripQueueTable.cancelledAt),
        ));
      logger.info({ userId }, "Drip sequence cancelled — user upgraded to Pro");
    } catch (err) {
      logger.warn({ err, userId }, "Failed to cancel drip sequence on Pro upgrade (non-critical)");
    }
    return;
  }

  if (type === "invoice.payment_failed") {
    const invoice = event.data.object;
    const customerId: string = invoice.customer;
    try {
      const stripe = await getUncachableStripeClient();
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return;
      const userId: string | undefined = (customer as any).metadata?.userId;
      if (!userId) return;
      const userRows = await db.select({ email: usersTable.email, firstName: usersTable.firstName })
        .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      const sub = await db.select({ currentPeriodEnd: subscriptionsTable.currentPeriodEnd })
        .from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).limit(1);
      if (userRows[0]?.email) {
        sendPaymentFailedEmail({
          email: userRows[0].email,
          firstName: userRows[0].firstName,
          periodEnd: sub[0]?.currentPeriodEnd ?? null,
          userId,
        }).catch(() => {});
      }
    } catch (err) {
      logger.error({ err }, "Failed to send payment_failed email");
    }
    return;
  }

  if (type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
    // Skip the first payment — the welcome email already covers that
    if (invoice.billing_reason === "subscription_create") return;
    const customerId: string = invoice.customer;
    try {
      const stripe = await getUncachableStripeClient();
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return;
      const userId: string | undefined = (customer as any).metadata?.userId;
      if (!userId) return;
      const userRows = await db.select({ email: usersTable.email, firstName: usersTable.firstName })
        .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (userRows[0]?.email) {
        const nextPeriodEnd = invoice.lines?.data?.[0]?.period?.end
          ? new Date(invoice.lines.data[0].period.end * 1000)
          : null;
        sendPaymentSucceededEmail({
          email: userRows[0].email,
          firstName: userRows[0].firstName,
          amountPaid: invoice.amount_paid ?? 0,
          currency: invoice.currency ?? "usd",
          nextPeriodEnd,
          userId,
        }).catch(() => {});
      }
    } catch (err) {
      logger.error({ err }, "Failed to send payment_succeeded email");
    }
    return;
  }

  if (
    type === "customer.subscription.created" ||
    type === "customer.subscription.updated" ||
    type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object;
    const customerId: string = sub.customer;
    const subId: string = sub.id;
    const status: string = sub.status;
    const cancelAtPeriodEnd: boolean = sub.cancel_at_period_end;
    const currentPeriodEnd: Date | undefined = sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : undefined;

    const metadata = sub.metadata ?? {};
    let userId: string | undefined = metadata.userId;

    if (!userId) {
      const stripe = await getUncachableStripeClient();
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return;
      userId = (customer as any).metadata?.userId;
    }

    if (!userId) {
      logger.warn({ subId, customerId }, "Stripe webhook: no userId in metadata, skipping");
      return;
    }

    await upsertSubscription(userId, subId, customerId, status, cancelAtPeriodEnd, currentPeriodEnd, event);
  }
}

async function upsertSubscription(
  userId: string,
  stripeSubId: string,
  stripeCustomerId: string,
  rawStatus: string,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: Date | undefined,
  event: any,
) {
  const resolvedStatus =
    cancelAtPeriodEnd ? "cancel_scheduled" :
    rawStatus === "active" ? "active" :
    rawStatus === "trialing" ? "active" :
    rawStatus === "past_due" ? "past_due" :
    "cancelled";

  const existing = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).limit(1);

  if (existing.length > 0) {
    await db.update(subscriptionsTable).set({
      stripeSubscriptionId: stripeSubId,
      stripeCustomerId,
      status: resolvedStatus,
      currentPeriodEnd: currentPeriodEnd ?? existing[0].currentPeriodEnd,
      updatedAt: new Date(),
    }).where(eq(subscriptionsTable.userId, userId));
  } else {
    await db.insert(subscriptionsTable).values({
      userId,
      stripeSubscriptionId: stripeSubId,
      stripeCustomerId,
      status: resolvedStatus,
      currentPeriodEnd,
      planName: "Pro",
    });
  }

  logger.info({ userId, status: resolvedStatus, event: event.type }, "Subscription updated via Stripe webhook");

  if (resolvedStatus === "active" && (event.type === "checkout.session.completed" || event.type === "customer.subscription.created")) {
    try {
      const userRows = await db.select({ email: usersTable.email, firstName: usersTable.firstName })
        .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (userRows[0]?.email) {
        sendProUpgradeEmail({
          email: userRows[0].email,
          firstName: userRows[0].firstName,
          periodEnd: currentPeriodEnd ?? null,
        }).catch(() => {});
      }
    } catch { /* non-fatal */ }
  }

  if (resolvedStatus === "cancelled" && event.type === "customer.subscription.deleted") {
    try {
      const userRows = await db.select({ email: usersTable.email, firstName: usersTable.firstName })
        .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (userRows[0]?.email) {
        sendCancellationEmail({
          email: userRows[0].email,
          firstName: userRows[0].firstName,
          periodEnd: currentPeriodEnd ?? null,
          userId,
        }).catch(() => {});
      }
    } catch { /* non-fatal */ }
  }
}

// Create a Stripe Checkout session
router.post("/stripe/checkout", stripeCheckoutLimiter, async (req, res) => {
  const auth = getAuth(req);
  const userId = (auth?.sessionClaims?.userId as string | undefined) || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "VALIDATION_ERROR", message: "billingPeriod must be 'monthly' or 'annual'" });
  }

  const { billingPeriod } = parsed.data;
  const isAnnual = billingPeriod === "annual";

  try {
    const stripe = await getUncachableStripeClient();

    // Lookup the Resilium Pro price from Stripe dynamically
    const products = await stripe.products.search({ query: "name:'Resilium Pro' AND active:'true'" });
    if (products.data.length === 0) {
      return res.status(500).json({ error: "Resilium Pro product not found in Stripe. Please run the seed script." });
    }
    const product = products.data[0];

    const prices = await stripe.prices.list({ product: product.id, active: true });
    const interval = isAnnual ? "year" : "month";
    const price = prices.data.find(p => p.recurring?.interval === interval);
    if (!price) {
      return res.status(500).json({ error: `No ${interval}ly price found for Resilium Pro.` });
    }

    // Get or create customer — handles stale test-mode IDs
    const userRows = await db.select({ email: usersTable.email, firstName: usersTable.firstName })
      .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const email = userRows[0]?.email ?? undefined;

    const existing = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).limit(1);
    let customerId = existing[0]?.stripeCustomerId ?? undefined;

    if (customerId) {
      // Verify the stored customer actually exists in the current Stripe environment
      try {
        await stripe.customers.retrieve(customerId);
      } catch (custErr: any) {
        if (custErr?.code === "resource_missing") {
          logger.warn({ userId, customerId }, "Stored Stripe customer not found (stale test-mode ID?), creating a new one");
          customerId = undefined;
          // Clear the stale subscription row so we start fresh
          await db.delete(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));
        } else {
          throw custErr;
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const baseUrl = process.env.REPLIT_DEPLOYMENT === "1"
      ? "https://resilium-platform.com"
      : `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "subscription",
      metadata: { userId },
      subscription_data: { metadata: { userId } },
      success_url: `${baseUrl}/pricing?success=1`,
      cancel_url: `${baseUrl}/pricing`,
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    logger.error({ err }, "Failed to create Stripe checkout session");
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Customer portal (manage subscription)
router.post("/stripe/portal", stripePortalLimiter, async (req, res) => {
  const auth = getAuth(req);
  const userId = (auth?.sessionClaims?.userId as string | undefined) || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  try {
    const stripe = await getUncachableStripeClient();
    const existing = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).limit(1);
    const customerId = existing[0]?.stripeCustomerId;
    if (!customerId) return res.status(404).json({ error: "No subscription found" });

    // Verify the customer still exists in this Stripe environment
    try {
      await stripe.customers.retrieve(customerId);
    } catch (custErr: any) {
      if (custErr?.code === "resource_missing") {
        logger.warn({ userId, customerId }, "Stale Stripe customer ID in portal request — clearing subscription row");
        await db.delete(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));
        return res.status(404).json({ error: "No active subscription found. Please subscribe first." });
      }
      throw custErr;
    }

    const baseUrl = process.env.REPLIT_DEPLOYMENT === "1"
      ? "https://resilium-platform.com"
      : `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/profile`,
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    logger.error({ err }, "Failed to create Stripe portal session");
    return res.status(500).json({ error: "Failed to create portal session" });
  }
});

// One-time donation checkout (no auth required)
const donationSchema = z.object({
  amount: z.number().int().min(100).max(100000).optional().default(500), // cents, default $5
  returnPath: z.string().optional().default("/"),
});

router.post("/stripe/donate", stripeDonationLimiter, async (req, res) => {
  const parsed = donationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "VALIDATION_ERROR", message: "Invalid donation parameters." });
  }

  const { amount, returnPath } = parsed.data;

  try {
    const stripe = await getUncachableStripeClient();

    const baseUrl = process.env.REPLIT_DEPLOYMENT === "1"
      ? "https://resilium-platform.com"
      : `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;

    const returnUrl = `${baseUrl}${returnPath.startsWith("/") ? returnPath : "/" + returnPath}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: "Support Resilium",
              description: "A one-time contribution to support the Resilium project. Thank you — it means a lot.",
            },
          },
        },
      ],
      success_url: `${returnUrl}?donated=1`,
      cancel_url: returnUrl,
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    logger.error({ err }, "Failed to create Stripe donation session");
    return res.status(500).json({ error: "Failed to create donation session" });
  }
});

export default router;
