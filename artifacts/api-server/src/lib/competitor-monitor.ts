import { createHash } from "crypto";
import { db, competitorChecksTable } from "@workspace/db";
import { desc, eq, and } from "drizzle-orm";
import { logger } from "./logger.js";
import { sendCompetitorAlert } from "./email.js";

const COMPETITORS = [
  { name: "ReadyScore", url: "https://readyscore.com" },
  { name: "Coached.com", url: "https://coached.com/tools/personal-resilience-scale" },
  { name: "BetterUp", url: "https://betterup.com" },
];

function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
}

function hashContent(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

async function fetchCompetitor(url: string): Promise<{ statusCode: number; hash: string; text: string } | { error: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ResilientBot/1.0; monitoring)" },
      signal: AbortSignal.timeout(15000),
    });
    const html = await res.text();
    const text = extractText(html);
    return { statusCode: res.status, hash: hashContent(text), text: text.slice(0, 500) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function runCompetitorChecks(triggeredBy = "cron"): Promise<{
  ran: number;
  changed: number;
  errors: number;
  details: Array<{ competitor: string; changeDetected: boolean; error?: string }>;
}> {
  const results: Array<{ competitor: string; changeDetected: boolean; error?: string }> = [];
  const alerts: Array<{ competitor: string; url: string; note: string }> = [];

  for (const comp of COMPETITORS) {
    try {
      const fetched = await fetchCompetitor(comp.url);

      if ("error" in fetched) {
        await db.insert(competitorChecksTable).values({
          competitor: comp.name,
          url: comp.url,
          changeDetected: false,
          error: fetched.error,
        });
        results.push({ competitor: comp.name, changeDetected: false, error: fetched.error });
        logger.warn({ competitor: comp.name, error: fetched.error }, "Competitor fetch failed");
        continue;
      }

      const [lastCheck] = await db
        .select()
        .from(competitorChecksTable)
        .where(and(eq(competitorChecksTable.competitor, comp.name), eq(competitorChecksTable.changeDetected, false)))
        .orderBy(desc(competitorChecksTable.checkedAt))
        .limit(1);

      const previousHash = lastCheck?.contentHash ?? null;
      const changeDetected = previousHash !== null && previousHash !== fetched.hash;

      let changeNotes: string | null = null;
      if (changeDetected) {
        changeNotes = `Content hash changed: ${previousHash} → ${fetched.hash}. Preview: "${fetched.text.slice(0, 200)}..."`;
        alerts.push({ competitor: comp.name, url: comp.url, note: changeNotes });
      }

      await db.insert(competitorChecksTable).values({
        competitor: comp.name,
        url: comp.url,
        statusCode: fetched.statusCode,
        contentHash: fetched.hash,
        previousHash,
        changeDetected,
        changeNotes,
      });

      results.push({ competitor: comp.name, changeDetected });
      logger.info({ competitor: comp.name, changeDetected, hash: fetched.hash }, "Competitor check complete");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ competitor: comp.name, changeDetected: false, error: msg });
      logger.error({ competitor: comp.name, err }, "Competitor check error");
    }
  }

  if (alerts.length > 0) {
    await sendCompetitorAlert(alerts).catch((e: unknown) =>
      logger.error({ e }, "Failed to send competitor alert email")
    );
  }

  return {
    ran: results.length,
    changed: results.filter((r) => r.changeDetected).length,
    errors: results.filter((r) => !!r.error).length,
    details: results,
  };
}

export async function getCompetitorCheckHistory(limit = 50): Promise<typeof competitorChecksTable.$inferSelect[]> {
  return db
    .select()
    .from(competitorChecksTable)
    .orderBy(desc(competitorChecksTable.checkedAt))
    .limit(limit);
}
