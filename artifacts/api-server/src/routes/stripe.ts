import { Router } from "express";
import { getAuth } from "@clerk/express";
import { getUncachableStripeClient, getStripeSync } from "../stripeClient.js";
import { db, usersTable, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { sendProUpgradeEmail } from "../lib/email.js";

const router = Router();

// Stripe webhook — must receive raw body (registered before express.json() in app.ts)
router.post("/stripe/webhook", async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature) return res.status(400).json({ error: "Missing stripe-signature" });

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
  const sig = Array.isArray(signature) ? signature[0] : signature;

  let event: any;
  try {
    const stripeSync = await getStripeSync();
    await stripeSync.processWebhook(rawBody, sig);

    // Also parse event manually to update our subscriptions table
    const stripe = await getUncachableStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, sig, await getWebhookSecret());
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

async function getWebhookSecret(): Promise<string> {
  // stripe-replit-sync manages the webhook endpoint automatically
  // Use the managed webhook secret from environment or fall back to integration
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) throw new Error("Missing Replit env vars");

  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", "stripe");
  url.searchParams.set("environment", targetEnvironment);

  const resp = await fetch(url.toString(), {
    headers: { Accept: "application/json", "X-Replit-Token": xReplitToken },
    signal: AbortSignal.timeout(10_000),
  });

  const data = await resp.json() as any;
  const secret = data.items?.[0]?.settings?.webhook_secret;
  if (!secret) throw new Error("No webhook secret available from Stripe integration");
  return secret;
}

async function handleStripeEvent(event: any) {
  const type: string = event.type;

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

    // Find userId from stripe.customers metadata via the synced stripe schema
    // We pass userId as metadata when creating checkout sessions
    const metadata = sub.metadata ?? {};
    const userId: string | undefined = metadata.userId;

    if (!userId) {
      // Try to find user by stripe customer id
      const stripe = await getUncachableStripeClient();
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return;
      const metaUserId = (customer as any).metadata?.userId;
      if (!metaUserId) {
        logger.warn({ subId, customerId }, "Stripe webhook: no userId in metadata, skipping");
        return;
      }
      await upsertSubscription(metaUserId, subId, customerId, status, cancelAtPeriodEnd, currentPeriodEnd, event);
    } else {
      await upsertSubscription(userId, subId, customerId, status, cancelAtPeriodEnd, currentPeriodEnd, event);
    }
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

  if (resolvedStatus === "active" && (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated")) {
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
}

// Create a Stripe Checkout session
router.post("/stripe/checkout", async (req, res) => {
  const auth = getAuth(req);
  const userId = (auth?.sessionClaims?.userId as string | undefined) || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  const { billingPeriod } = req.body as { billingPeriod?: string };
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

    // Get or create customer
    const userRows = await db.select({ email: usersTable.email, firstName: usersTable.firstName })
      .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const email = userRows[0]?.email ?? undefined;

    const existing = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).limit(1);
    let customerId = existing[0]?.stripeCustomerId ?? undefined;

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
router.post("/stripe/portal", async (req, res) => {
  const auth = getAuth(req);
  const userId = (auth?.sessionClaims?.userId as string | undefined) || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });

  try {
    const stripe = await getUncachableStripeClient();
    const existing = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).limit(1);
    const customerId = existing[0]?.stripeCustomerId;
    if (!customerId) return res.status(404).json({ error: "No subscription found" });

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

export default router;
