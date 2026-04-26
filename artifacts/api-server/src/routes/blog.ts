import { Router, type IRouter } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, desc, and, lte } from "drizzle-orm";

const router: IRouter = Router();

router.get("/blog-posts", async (req, res) => {
  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(blogPostsTable)
      .where(
        and(
          eq(blogPostsTable.status, "published"),
          lte(blogPostsTable.publishedAt, now)
        )
      )
      .orderBy(desc(blogPostsTable.publishedAt));
    res.json({ posts: rows });
  } catch (err) {
    req.log.error({ err }, "Error fetching blog posts");
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

router.get("/blog-posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params as { slug: string };
    const now = new Date();
    const [row] = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, slug))
      .limit(1);
    if (!row || row.status !== "published" || row.publishedAt > now) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ post: row });
  } catch (err) {
    req.log.error({ err }, "Error fetching blog post");
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

export default router;
