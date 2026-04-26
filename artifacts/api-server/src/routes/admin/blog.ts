import { Router, type IRouter } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdminSession } from "../../middlewares/adminAuth.js";

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

    const updates: Record<string, unknown> = { updatedAt: new Date() };
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

    const [row] = await db.update(blogPostsTable).set(updates as any).where(eq(blogPostsTable.id, id)).returning();
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

export default router;
