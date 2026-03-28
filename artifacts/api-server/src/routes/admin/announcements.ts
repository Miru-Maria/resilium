import { Router, type IRouter } from "express";
import { db, siteAnnouncementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdminSession } from "../../middlewares/adminAuth.js";

const router: IRouter = Router();
router.use(requireAdminSession);

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(siteAnnouncementsTable)
      .orderBy(desc(siteAnnouncementsTable.createdAt));
    res.json({ announcements: rows });
  } catch (err) {
    req.log.error({ err }, "Error fetching announcements");
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { message, type = "info" } = req.body ?? {};
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "message is required" });
      return;
    }
    const validTypes = ["info", "warning", "success"];
    const safeType = validTypes.includes(type) ? type : "info";
    const [row] = await db
      .insert(siteAnnouncementsTable)
      .values({ message: message.trim(), type: safeType, isActive: true })
      .returning();
    res.status(201).json({ announcement: row });
  } catch (err) {
    req.log.error({ err }, "Error creating announcement");
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const { isActive, message, type } = req.body ?? {};
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof isActive === "boolean") updates.isActive = isActive;
    if (typeof message === "string" && message.trim()) updates.message = message.trim();
    if (["info", "warning", "success"].includes(type)) updates.type = type;
    const [row] = await db
      .update(siteAnnouncementsTable)
      .set(updates as any)
      .where(eq(siteAnnouncementsTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ announcement: row });
  } catch (err) {
    req.log.error({ err }, "Error updating announcement");
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db.delete(siteAnnouncementsTable).where(eq(siteAnnouncementsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting announcement");
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

export default router;
