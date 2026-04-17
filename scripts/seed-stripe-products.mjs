/**
 * Seed Stripe products and prices for Resilium Pro
 * Run once: node scripts/seed-stripe-products.mjs
 *
 * Prices:
 *   Pro Monthly: $9.00/month
 *   Pro Annual:  $79.00/year (~$6.58/mo, saves $29)
 */

async function getStripeSecretKey() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error("Missing Replit env vars. Run inside the Replit environment.");
  }

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", "stripe");
  url.searchParams.set("environment", "development");

  const resp = await fetch(url.toString(), {
    headers: { Accept: "application/json", "X-Replit-Token": xReplitToken },
  });

  if (!resp.ok) throw new Error(`Failed to fetch Stripe credentials: ${resp.status}`);

  const data = await resp.json();
  const secret = data.items?.[0]?.settings?.secret;
  if (!secret) throw new Error("Stripe secret key not found in integration settings");
  return secret;
}

async function run() {
  const secretKey = await getStripeSecretKey();
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secretKey, { apiVersion: "2025-08-27.basil" });

  console.log("Checking for existing Resilium Pro product...");
  const existing = await stripe.products.search({ query: "name:'Resilium Pro' AND active:'true'" });

  let product;
  if (existing.data.length > 0) {
    product = existing.data[0];
    console.log(`✓ Product already exists: ${product.id}`);
  } else {
    product = await stripe.products.create({
      name: "Resilium Pro",
      description: "Unlimited resilience assessments, trend tracking, scenario stress-testing, and AI Companion.",
    });
    console.log(`✓ Created product: ${product.id}`);
  }

  // Check prices
  const prices = await stripe.prices.list({ product: product.id, active: true });
  const hasMonthly = prices.data.some(p => p.recurring?.interval === "month");
  const hasAnnual = prices.data.some(p => p.recurring?.interval === "year");

  if (!hasMonthly) {
    const monthly = await stripe.prices.create({
      product: product.id,
      unit_amount: 900,
      currency: "usd",
      recurring: { interval: "month" },
    });
    console.log(`✓ Created monthly price: ${monthly.id} ($9.00/mo)`);
  } else {
    const monthly = prices.data.find(p => p.recurring?.interval === "month");
    console.log(`✓ Monthly price already exists: ${monthly.id}`);
  }

  if (!hasAnnual) {
    const annual = await stripe.prices.create({
      product: product.id,
      unit_amount: 7900,
      currency: "usd",
      recurring: { interval: "year" },
    });
    console.log(`✓ Created annual price: ${annual.id} ($79.00/yr)`);
  } else {
    const annual = prices.data.find(p => p.recurring?.interval === "year");
    console.log(`✓ Annual price already exists: ${annual.id}`);
  }

  console.log("\nDone! Stripe prices will be used by the checkout route automatically.");
  console.log("No env vars needed — prices are looked up from Stripe's API at checkout time.");
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
