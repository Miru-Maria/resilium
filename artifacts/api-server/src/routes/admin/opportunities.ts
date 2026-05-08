import { Router, type IRouter } from "express";
import { db, contentOpportunitiesTable } from "@workspace/db";
import { desc, isNull, gte } from "drizzle-orm";
import { requireAdminSession } from "../../middlewares/adminAuth.js";
import { openai } from "@workspace/integrations-openai-ai-server";
import { MINI_MODEL } from "../../lib/models.js";
import { logger } from "../../lib/logger.js";

const router: IRouter = Router();
router.use(requireAdminSession);

const SUBREDDITS = [
  // Core resilience
  "preppers", "survivalism", "povertyfinance", "financialindependence", "FIRE",
  // High-value additions from community research
  "IWantOut",           // people actively considering leaving their country — perfect fit
  "UKPersonalFinance",  // engaged, high-quality financial resilience community
  "PersonalFinanceCanada",
  "solotravel",         // self-reliant, contingency-minded audience
  // Existing
  "personalfinance", "digitalnomad", "expats",
  "anxiety", "jobs", "careerguidance", "laidoff",
];

const SEARCH_TERMS = [
  "prepared", "emergency fund", "financial resilience", "crisis preparedness",
  "job loss", "disaster preparedness", "resilience score",
];

const REDDIT_UA = "Resilium/1.0 (growth-tool; contact@resilium-platform.com)";

// ─── Reddit OAuth token cache ────────────────────────────────────────────────

interface TokenCache { token: string; expiresAt: number }
let _tokenCache: TokenCache | null = null;

async function getRedditToken(): Promise<string | null> {
  const clientId = process.env["REDDIT_CLIENT_ID"];
  const clientSecret = process.env["REDDIT_CLIENT_SECRET"];

  if (!clientId || !clientSecret) return null;

  const now = Date.now();
  if (_tokenCache && _tokenCache.expiresAt > now + 30_000) {
    return _tokenCache.token;
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": REDDIT_UA,
      },
      body: "grant_type=client_credentials",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      logger.warn({ status: res.status }, "Reddit OAuth token request failed");
      return null;
    }
    const data = await res.json() as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;

    _tokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in ?? 3600) * 1000,
    };
    logger.info("Reddit OAuth token acquired");
    return _tokenCache.token;
  } catch (err) {
    logger.warn({ err }, "Reddit OAuth token fetch failed");
    return null;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  subreddit: string;
  ups: number;
  num_comments: number;
  created_utc: number;
}

// ─── Scanner ─────────────────────────────────────────────────────────────────

export async function runOpportunityScanner(): Promise<{ found: number; saved: number; emailed: boolean }> {
  const token = await getRedditToken();
  const isAuthed = !!token;

  const authHeaders: Record<string, string> = {
    "User-Agent": REDDIT_UA,
    ...(isAuthed ? { Authorization: `Bearer ${token}` } : {}),
  };
  const baseUrl = isAuthed
    ? "https://oauth.reddit.com"
    : "https://www.reddit.com";

  if (!isAuthed) {
    logger.warn("Reddit scanner running unauthenticated — set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET for reliable access");
  }

  const seen = new Set<string>();
  const candidates: RedditPost[] = [];

  for (const sub of SUBREDDITS) {
    for (const term of SEARCH_TERMS) {
      try {
        await new Promise(r => setTimeout(r, isAuthed ? 400 : 1000));
        const url = `${baseUrl}/r/${sub}/search.json?q=${encodeURIComponent(term)}&sort=new&restrict_sr=on&t=week&limit=10`;
        const res = await fetch(url, {
          headers: authHeaders,
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) {
          logger.warn({ status: res.status, sub, term }, "Reddit fetch non-OK");
          continue;
        }
        const json = await res.json() as { data?: { children?: { data: RedditPost }[] } };
        const posts = json.data?.children ?? [];
        for (const { data: p } of posts) {
          const fullUrl = `https://www.reddit.com${p.permalink}`;
          if (!seen.has(fullUrl) && p.title && p.ups >= 1) {
            seen.add(fullUrl);
            candidates.push({ ...p, url: fullUrl });
          }
        }
      } catch (err) {
        logger.warn({ err, sub, term }, "Reddit fetch failed");
      }
    }
  }

  if (candidates.length === 0) {
    logger.info("Opportunity scanner: no Reddit candidates found");
    return { found: 0, saved: 0, emailed: false };
  }

  const top = candidates.sort((a, b) => b.ups - a.ups).slice(0, 20);

  const prompt = `You are a growth advisor for Resilium, a personal resilience platform (resilium-platform.com). It helps people score their preparedness across 6 dimensions: Financial, Health, Skills, Mobility, Emergency Resources, Mental Resilience.

For each Reddit post below, do two things:
1. Score relevance 1-10 (10 = perfect fit for a helpful Resilium reply)
2. Write a genuine, helpful reply that adds real value. The reply should NOT be promotional — it should answer the question or add insight, then ONLY at the end mention Resilium if highly relevant. Keep replies under 200 words. Sound like a knowledgeable person, not a marketer.

Posts (JSON array):
${JSON.stringify(top.map(p => ({ id: p.id, title: p.title, body: p.selftext?.slice(0, 300), subreddit: p.subreddit, url: p.url })))}

Return ONLY valid JSON array:
[{ "id": "...", "relevanceScore": 8, "draftReply": "..." }, ...]`;

  let scored: { id: string; relevanceScore: number; draftReply: string }[] = [];
  try {
    const completion = await openai.chat.completions.create({
      model: MINI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { opportunities?: typeof scored } | typeof scored;
    scored = Array.isArray(parsed) ? parsed : (parsed as { opportunities?: typeof scored }).opportunities ?? [];
  } catch (err) {
    logger.error({ err }, "OpenAI scoring failed in opportunity scanner");
    return { found: candidates.length, saved: 0, emailed: false };
  }

  const relevant = scored.filter(s => s.relevanceScore >= 6);
  let saved = 0;

  for (const s of relevant) {
    const post = top.find(p => p.id === s.id);
    if (!post) continue;
    try {
      await db.insert(contentOpportunitiesTable).values({
        source: "reddit",
        url: post.url,
        title: post.title,
        body: post.selftext?.slice(0, 500) || null,
        subreddit: post.subreddit,
        upvotes: post.ups,
        commentCount: post.num_comments,
        draftReply: s.draftReply,
        relevanceScore: s.relevanceScore,
      }).onConflictDoNothing();
      saved++;
    } catch { /* duplicate URL — skip */ }
  }

  logger.info({ found: candidates.length, relevant: relevant.length, saved, authed: isAuthed }, "Opportunity scanner complete");
  return { found: candidates.length, saved, emailed: false };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const rows = await db
      .select()
      .from(contentOpportunitiesTable)
      .where(gte(contentOpportunitiesTable.createdAt, thirtyDaysAgo))
      .orderBy(desc(contentOpportunitiesTable.relevanceScore), desc(contentOpportunitiesTable.createdAt))
      .limit(50);
    res.json({ opportunities: rows });
  } catch (err) {
    req.log.error({ err }, "Error fetching opportunities");
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

router.get("/unsent", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(contentOpportunitiesTable)
      .where(isNull(contentOpportunitiesTable.emailedAt))
      .orderBy(desc(contentOpportunitiesTable.relevanceScore))
      .limit(10);
    res.json({ opportunities: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unsent opportunities" });
  }
});

router.post("/scan", async (req, res) => {
  try {
    logger.info("Manual opportunity scan triggered via admin");
    const result = await runOpportunityScanner();
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Manual opportunity scan failed");
    res.status(500).json({ error: "Scan failed" });
  }
});

export default router;
