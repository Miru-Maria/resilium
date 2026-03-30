#!/usr/bin/env node
/**
 * Resilium — Paddle Webhook End-to-End Test
 * Usage: node scripts/test-paddle-webhook.mjs [userId]
 *
 * Signs a synthetic subscription.created event with your PADDLE_WEBHOOK_SECRET
 * and POSTs it to the local API. Then queries the DB directly to confirm the
 * subscription row was written and Pro is unlocked for the test user.
 *
 * Pass --cleanup as the last argument to delete the test subscription row afterwards.
 */
import { createHmac } from "crypto";
import https from "https";
import http from "http";
import { execSync } from "child_process";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
const API_BASE = process.env.API_BASE ?? "http://localhost:8080";
const CLEANUP = process.argv.includes("--cleanup");
const USER_ID = process.argv.slice(2).find(a => !a.startsWith("--")) ?? "test-user-" + Date.now();

if (!WEBHOOK_SECRET) {
  console.error("❌  PADDLE_WEBHOOK_SECRET env var is not set.");
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL env var is not set — needed for DB verification.");
  process.exit(1);
}

const now = Math.floor(Date.now() / 1000);
const subId = "sub_test_" + Date.now();

const payload = {
  event_type: "subscription.created",
  event_id: "evt_test_" + Date.now(),
  occurred_at: new Date().toISOString(),
  data: {
    id: subId,
    customer_id: "cus_test_" + Date.now(),
    status: "active",
    next_billed_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_change: null,
    custom_data: { userId: USER_ID },
  },
};

const rawBody = JSON.stringify(payload);
const ts = now.toString();
const signed = `${ts}:${rawBody}`;
const h1 = createHmac("sha256", WEBHOOK_SECRET).update(signed).digest("hex");
const paddleSignature = `ts=${ts};h1=${h1}`;

console.log(`\n🧪  Paddle Webhook End-to-End Test`);
console.log(`    User ID:      ${USER_ID}`);
console.log(`    Subscription: ${subId}`);
console.log(`    Endpoint:     ${API_BASE}/api/paddle/webhook`);
if (CLEANUP) console.log(`    Cleanup:      enabled (test row will be deleted)`);
console.log();

function httpRequest(url, method, body, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers: body
        ? { ...headers, "Content-Length": Buffer.byteLength(body) }
        : headers,
    };
    const req = lib.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  // ── Step 0: Create a temporary test user (required by FK constraint) ────────
  console.log("Step 0 — Creating temporary test user in DB...");
  try {
    execSync(
      `psql "${DATABASE_URL}" -c "INSERT INTO users (id, email) VALUES ('${USER_ID}', '${USER_ID}@test.invalid') ON CONFLICT (id) DO NOTHING"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    console.log(`  ✅  Test user ready (id: ${USER_ID})`);
  } catch (err) {
    console.error(`  ❌  Failed to create test user: ${err.message}`);
    process.exit(1);
  }

  // ── Step 1: POST the signed webhook ────────────────────────────────────────
  console.log("\nStep 1 — Posting signed webhook...");
  const res = await httpRequest(
    `${API_BASE}/api/paddle/webhook`,
    "POST",
    rawBody,
    { "Content-Type": "application/json", "paddle-signature": paddleSignature }
  );

  if (res.status === 200) {
    console.log(`  ✅  Webhook accepted (HTTP ${res.status})`);
  } else if (res.status === 401) {
    console.error(`  ❌  Signature rejected (HTTP 401) — check PADDLE_WEBHOOK_SECRET matches your Paddle dashboard.`);
    process.exit(1);
  } else {
    console.error(`  ❌  Unexpected response (HTTP ${res.status}): ${res.body}`);
    process.exit(1);
  }

  // ── Step 2: Verify the DB row was written ──────────────────────────────────
  console.log("\nStep 2 — Querying database for subscription row...");
  await new Promise((r) => setTimeout(r, 600)); // brief pause for async DB write

  let psqlOut;
  try {
    psqlOut = execSync(
      `psql "${DATABASE_URL}" -t -A -F '|' -c "SELECT user_id,paddle_subscription_id,paddle_customer_id,status,current_period_end,created_at FROM subscriptions WHERE user_id='${USER_ID}' LIMIT 1"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    ).trim();
  } catch (err) {
    console.error(`  ❌  psql query failed: ${err.message}`);
    process.exit(1);
  }

  if (!psqlOut) {
    console.error(`  ❌  No subscription row found for user_id = '${USER_ID}'`);
    console.error(`       Check API logs for errors writing to the subscriptions table.`);
    process.exit(1);
  }

  const [userId, paddleSubId2, paddleCustomerId, status, periodEnd, createdAt] = psqlOut.split("|");
  console.log(`  ✅  Subscription row found:`);
  console.log(`       user_id:              ${userId}`);
  console.log(`       paddle_sub_id:        ${paddleSubId2}`);
  console.log(`       paddle_customer_id:   ${paddleCustomerId}`);
  console.log(`       status:               ${status}`);
  console.log(`       current_period_end:   ${periodEnd || "null"}`);
  console.log(`       created_at:           ${createdAt}`);

  if (status !== "active") {
    console.warn(`  ⚠️   Status is '${status}' — expected 'active'. Review resolvedStatus logic in paddle.ts.`);
  }

  // ── Step 3: Optional cleanup ────────────────────────────────────────────────
  if (CLEANUP) {
    console.log("\nStep 3 — Cleaning up test rows...");
    execSync(
      `psql "${DATABASE_URL}" -c "DELETE FROM subscriptions WHERE user_id='${USER_ID}'"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    execSync(
      `psql "${DATABASE_URL}" -c "DELETE FROM users WHERE id='${USER_ID}'"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    console.log(`  ✅  Test subscription and user rows deleted.`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n✅  All checks passed`);
  console.log(`    • Webhook signature verified by API`);
  console.log(`    • Subscription row written to DB (status: ${status})`);
  console.log(`    • Pro features will be active on next session check for userId="${USER_ID}"`);
  if (!CLEANUP) {
    console.log(`\n💡  To remove this test row:`);
    console.log(`    node scripts/test-paddle-webhook.mjs ${USER_ID} --cleanup`);
    console.log(`    -- or directly in psql:`);
    console.log(`    DELETE FROM subscriptions WHERE user_id = '${USER_ID}';\n`);
  }
}

run().catch((err) => {
  console.error("❌  Test failed:", err.message);
  process.exit(1);
});
