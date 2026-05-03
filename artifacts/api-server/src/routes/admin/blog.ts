import { Router, type IRouter } from "express";
import { db, blogPostsTable, blogKeywordsTable } from "@workspace/db";
import { eq, desc, isNull, asc } from "drizzle-orm";
import { requireAdminSession } from "../../middlewares/adminAuth.js";
import { openai } from "@workspace/integrations-openai-ai-server";
import { MINI_MODEL } from "../../lib/models.js";
import { logger } from "../../lib/logger.js";

const router: IRouter = Router();
router.use(requireAdminSession);

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.publishedAt));
    res.json({ posts: rows });
  } catch (err) {
    req.log.error({ err }, "Error fetching blog posts");
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [row] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ post: row });
  } catch (err) {
    req.log.error({ err }, "Error fetching blog post");
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      slug, title, description, pillar, pillarLabel, targetKeyword,
      readingTimeMin, body, ogImage, status, publishedAt,
    } = req.body ?? {};

    if (!slug || !title || !description || !pillar || !pillarLabel || !body) {
      res.status(400).json({ error: "slug, title, description, pillar, pillarLabel, and body are required" });
      return;
    }
    if (!Array.isArray(body)) {
      res.status(400).json({ error: "body must be an array of strings" });
      return;
    }

    const [row] = await db.insert(blogPostsTable).values({
      slug: String(slug).trim(),
      title: String(title).trim(),
      description: String(description).trim(),
      pillar: String(pillar).trim(),
      pillarLabel: String(pillarLabel).trim(),
      targetKeyword: String(targetKeyword ?? "").trim(),
      readingTimeMin: typeof readingTimeMin === "number" ? readingTimeMin : 5,
      body,
      ogImage: ogImage ? String(ogImage).trim() : null,
      status: status === "draft" ? "draft" : "published",
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
    }).returning();
    res.status(201).json({ post: row });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      res.status(409).json({ error: "A post with this slug already exists" });
      return;
    }
    req.log.error({ err }, "Error creating blog post");
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const {
      slug, title, description, pillar, pillarLabel, targetKeyword,
      readingTimeMin, body, ogImage, status, publishedAt,
    } = req.body ?? {};

    type BlogUpdate = Partial<typeof blogPostsTable.$inferInsert>;
    const updates: BlogUpdate = { updatedAt: new Date() };
    if (slug) updates.slug = String(slug).trim();
    if (title) updates.title = String(title).trim();
    if (description) updates.description = String(description).trim();
    if (pillar) updates.pillar = String(pillar).trim();
    if (pillarLabel) updates.pillarLabel = String(pillarLabel).trim();
    if (targetKeyword !== undefined) updates.targetKeyword = String(targetKeyword).trim();
    if (typeof readingTimeMin === "number") updates.readingTimeMin = readingTimeMin;
    if (Array.isArray(body)) updates.body = body;
    if (ogImage !== undefined) updates.ogImage = ogImage ? String(ogImage).trim() : null;
    if (status === "draft" || status === "published") updates.status = status;
    if (publishedAt) updates.publishedAt = new Date(publishedAt);

    const [row] = await db.update(blogPostsTable).set(updates).where(eq(blogPostsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ post: row });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      res.status(409).json({ error: "A post with this slug already exists" });
      return;
    }
    req.log.error({ err }, "Error updating blog post");
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting blog post");
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

// ─── Keyword queue CRUD routes ────────────────────────────────────────────────

router.get("/keywords", async (_req, res) => {
  try {
    const rows = await db.select().from(blogKeywordsTable).orderBy(asc(blogKeywordsTable.priority), asc(blogKeywordsTable.createdAt));
    res.json({ keywords: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch keywords" });
  }
});

router.post("/keywords", async (req, res) => {
  try {
    const { keyword, pillar, pillarLabel, priority } = req.body as {
      keyword?: string; pillar?: string; pillarLabel?: string; priority?: number;
    };
    if (!keyword?.trim()) { res.status(400).json({ error: "keyword is required" }); return; }
    const [row] = await db.insert(blogKeywordsTable).values({
      keyword: keyword.trim(),
      pillar: pillar?.trim() ?? "financial",
      pillarLabel: pillarLabel?.trim() ?? "Financial Resilience",
      priority: typeof priority === "number" ? priority : 5,
    }).returning();
    res.status(201).json({ keyword: row });
  } catch (err) {
    res.status(500).json({ error: "Failed to add keyword" });
  }
});

router.delete("/keywords/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db.delete(blogKeywordsTable).where(eq(blogKeywordsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete keyword" });
  }
});

// ─── Keyword pool (fallback when DB queue is empty) ───────────────────────────

const KEYWORD_POOL = [
  { keyword: "emergency fund how much", pillar: "financial", pillarLabel: "Financial Resilience" },
  { keyword: "personal resilience score", pillar: "financial", pillarLabel: "Financial Resilience" },
  { keyword: "how to prepare for job loss", pillar: "skills", pillarLabel: "Skills & Career" },
  { keyword: "remote work skills 2025", pillar: "skills", pillarLabel: "Skills & Career" },
  { keyword: "relocation checklist", pillar: "mobility", pillarLabel: "Mobility & Relocation" },
  { keyword: "disaster preparedness kit", pillar: "resources", pillarLabel: "Emergency Resources" },
  { keyword: "mental resilience strategies", pillar: "psychological", pillarLabel: "Mental Resilience" },
  { keyword: "building social capital", pillar: "social-capital", pillarLabel: "Social Capital" },
  { keyword: "income diversification strategies", pillar: "financial", pillarLabel: "Financial Resilience" },
  { keyword: "health insurance gap coverage", pillar: "health", pillarLabel: "Health Resilience" },
  { keyword: "geopolitical risk personal finance", pillar: "financial", pillarLabel: "Financial Resilience" },
  { keyword: "stress tolerance techniques", pillar: "psychological", pillarLabel: "Mental Resilience" },
  { keyword: "financial independence roadmap", pillar: "financial", pillarLabel: "Financial Resilience" },
  { keyword: "emergency housing options", pillar: "mobility", pillarLabel: "Mobility & Relocation" },
  { keyword: "how to build community resilience", pillar: "social-capital", pillarLabel: "Social Capital" },
];

export async function pickNextKeyword(): Promise<{ keyword: string; pillar: string; pillarLabel: string; id?: number } | null> {
  try {
    const [row] = await db
      .select()
      .from(blogKeywordsTable)
      .where(isNull(blogKeywordsTable.usedAt))
      .orderBy(asc(blogKeywordsTable.priority), asc(blogKeywordsTable.createdAt))
      .limit(1);
    if (row) return { keyword: row.keyword, pillar: row.pillar, pillarLabel: row.pillarLabel, id: row.id };
  } catch { /* fall through to pool */ }
  return null;
}

export async function markKeywordUsed(id: number): Promise<void> {
  try {
    await db.update(blogKeywordsTable).set({ usedAt: new Date() }).where(eq(blogKeywordsTable.id, id));
  } catch { /* non-fatal */ }
}

export async function generateBlogPost(keyword?: string, pillar?: string, pillarLabel?: string): Promise<{
  slug: string; title: string; description: string; pillar: string; pillarLabel: string;
  targetKeyword: string; readingTimeMin: number; body: string[];
}> {
  const pool = keyword
    ? [{ keyword, pillar: pillar ?? "financial", pillarLabel: pillarLabel ?? "Financial Resilience" }]
    : KEYWORD_POOL;
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const pick = pool[weekNumber % pool.length]!;

  const prompt = `You are an expert content writer for Resilium, a personal resilience platform. Write a high-quality, SEO-optimized blog post targeting the keyword "${pick.keyword}".

Return ONLY valid JSON (no markdown, no code blocks) in this exact structure:
{
  "title": "...",
  "description": "...(155 chars max, for meta description)...",
  "slug": "...(url-friendly, hyphenated, no special chars)...",
  "readingTimeMin": 6,
  "body": ["paragraph 1", "paragraph 2", "paragraph 3", "paragraph 4", "paragraph 5", "paragraph 6", "paragraph 7"]
}

Requirements:
- Title: compelling, includes keyword naturally, under 60 chars
- Description: exactly 120-155 chars, includes keyword
- Body: 7 paragraphs of 80-130 words each, no markdown, plain prose
- Naturally weave in Resilium's 7 dimensions: Financial, Health, Skills, Mobility, Emergency Resources, Mental Resilience, Social Capital
- Tone: calm, authoritative, practical — like a knowledgeable friend, not a listicle
- Include 1-2 concrete actionable tips
- The slug must be unique and not contain the year`;

  const completion = await openai.chat.completions.create({
    model: MINI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { title?: string; description?: string; slug?: string; readingTimeMin?: number; body?: string[] };

  if (!parsed.title || !parsed.description || !parsed.slug || !Array.isArray(parsed.body)) {
    throw new Error("AI response missing required fields");
  }

  return {
    slug: parsed.slug,
    title: parsed.title,
    description: parsed.description,
    pillar: pick.pillar,
    pillarLabel: pick.pillarLabel,
    targetKeyword: pick.keyword,
    readingTimeMin: typeof parsed.readingTimeMin === "number" ? parsed.readingTimeMin : 6,
    body: parsed.body,
  };
}

router.post("/generate", async (req, res) => {
  try {
    const { keyword, pillar, pillarLabel, publish } = req.body as {
      keyword?: string; pillar?: string; pillarLabel?: string; publish?: boolean;
    };

    logger.info({ keyword }, "Generating AI blog post");
    const post = await generateBlogPost(keyword, pillar, pillarLabel);

    const [row] = await db.insert(blogPostsTable).values({
      ...post,
      status: publish ? "published" : "draft",
      publishedAt: publish ? new Date() : new Date(),
    }).returning();

    res.status(201).json({ post: row, generated: true });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      res.status(409).json({ error: "A post with this slug already exists — try again to get a different one" });
      return;
    }
    req.log.error({ err }, "Error generating blog post");
    res.status(500).json({ error: "Failed to generate blog post" });
  }
});

export default router;
