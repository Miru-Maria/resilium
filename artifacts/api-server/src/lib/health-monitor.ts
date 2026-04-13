import { db, healthChecksTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { logger } from "./logger.js";
import { sendHealthCheckSummary } from "./email.js";

const APP_URL = process.env["APP_URL"] ?? "https://resilium-platform.com";
const API_URL = process.env["API_URL"] ?? APP_URL;

interface CheckResult {
  name: string;
  url: string;
  status: "pass" | "fail";
  statusCode?: number;
  responseTimeMs?: number;
  error?: string;
}

const CHECKS: Array<{ name: string; path: string; expectedStatus?: number }> = [
  { name: "Landing page", path: "/" },
  { name: "Consent / Assessment start", path: "/consent" },
  { name: "Demo page", path: "/demo" },
  { name: "Pricing page", path: "/pricing" },
  { name: "About page", path: "/about" },
  { name: "API — reports list", path: "/api/reports", expectedStatus: 401 },
  { name: "API — admin session check", path: "/api/admin/session", expectedStatus: 200 },
];

async function checkRoute(name: string, url: string, expectedStatus = 200): Promise<CheckResult> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ResilientHealthBot/1.0" },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    const ms = Date.now() - start;
    const ok = res.status === expectedStatus || (expectedStatus === 200 && res.status < 400);
    return {
      name,
      url,
      status: ok ? "pass" : "fail",
      statusCode: res.status,
      responseTimeMs: ms,
      ...(!ok && { error: `Expected ${expectedStatus}, got ${res.status}` }),
    };
  } catch (err) {
    return {
      name,
      url,
      status: "fail",
      responseTimeMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function runHealthChecks(triggeredBy = "cron"): Promise<{
  overallStatus: "pass" | "fail";
  passCount: number;
  failCount: number;
  results: CheckResult[];
}> {
  const results: CheckResult[] = [];

  for (const check of CHECKS) {
    const url = check.path.startsWith("/api")
      ? `${API_URL}${check.path}`
      : `${APP_URL}${check.path}`;
    const r = await checkRoute(check.name, url, check.expectedStatus ?? 200);
    results.push(r);
    logger.info({ name: r.name, status: r.status, code: r.statusCode, ms: r.responseTimeMs }, "Health check");
  }

  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const overallStatus = failCount === 0 ? "pass" : "fail";

  await db.insert(healthChecksTable).values({
    overallStatus,
    passCount,
    failCount,
    results: results as unknown as Record<string, unknown>[],
    triggeredBy,
  });

  await sendHealthCheckSummary({ overallStatus, passCount, failCount, results, triggeredBy }).catch((e: unknown) =>
    logger.error({ e }, "Failed to send health check email")
  );

  return { overallStatus, passCount, failCount, results };
}

export async function getHealthCheckHistory(limit = 20): Promise<typeof healthChecksTable.$inferSelect[]> {
  return db
    .select()
    .from(healthChecksTable)
    .orderBy(desc(healthChecksTable.checkedAt))
    .limit(limit);
}
