import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";

const router = Router();

const bodySchema = z.object({
  token: z.string().min(1).max(1000),
  platform: z.enum(["ios", "android", "web"]).default("ios"),
});

router.post("/push-tokens", async (req, res) => {
  const userId = (req as any).user?.id;

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const { token, platform } = parsed.data;

  if (!userId) {
    return res.json({ stored: false, reason: "anonymous" });
  }

  try {
    await db
      .update(usersTable)
      .set({
        pushToken: token,
        pushTokenPlatform: platform,
        pushTokenUpdatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));

    logger.info({ userId, platform }, "Push token registered");
    return res.json({ stored: true });
  } catch (err) {
    logger.error({ err }, "Failed to store push token");
    return res.status(500).json({ error: "Failed to store token" });
  }
});

router.delete("/push-tokens", async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await db
      .update(usersTable)
      .set({ pushToken: null, pushTokenPlatform: null, pushTokenUpdatedAt: new Date() })
      .where(eq(usersTable.id, userId));
    return res.json({ cleared: true });
  } catch (err) {
    logger.error({ err }, "Failed to clear push token");
    return res.status(500).json({ error: "Failed to clear token" });
  }
});

export default router;
