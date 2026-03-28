import { Router, type IRouter } from "express";
import { db, siteAnnouncementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/announcements", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(siteAnnouncementsTable)
      .where(eq(siteAnnouncementsTable.isActive, true));
    res.json({ announcements: rows.map((r) => ({ id: r.id, message: r.message, type: r.type })) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

export default router;
