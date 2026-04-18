import { Router, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { db, checkinEntriesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { checkinLimiter } from "../lib/rate-limiters.js";

const router = Router();

function getUserId(req: Request): string | null {
  const auth = getAuth(req);
  return (auth?.sessionClaims?.userId as string | undefined) || auth?.userId || null;
}

function clampScore(v: unknown): number {
  const n = Number(v);
  if (isNaN(n)) return 3;
  return Math.max(1, Math.min(5, Math.round(n)));
}

router.get("/checkins", async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const rows = await db
      .select()
      .from(checkinEntriesTable)
      .where(eq(checkinEntriesTable.userId, userId))
      .orderBy(desc(checkinEntriesTable.date))
      .limit(30);

    const checkins = rows.map(r => ({
      date: r.date,
      scores: {
        financial: r.financial,
        health: r.health,
        skills: r.skills,
        social: r.social,
        resources: r.resources,
      },
    }));

    return res.json({ checkins });
  } catch (err) {
    logger.error({ err }, "Failed to fetch checkins");
    return res.status(500).json({ error: "Failed to fetch checkins" });
  }
});

router.post("/checkins", checkinLimiter, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { date, scores } = req.body;

  if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Invalid date — expected YYYY-MM-DD" });
  }
  if (!scores || typeof scores !== "object") {
    return res.status(400).json({ error: "Scores object is required" });
  }

  const financial = clampScore(scores.financial);
  const health = clampScore(scores.health);
  const skills = clampScore(scores.skills);
  const social = clampScore(scores.social);
  const resources = clampScore(scores.resources);

  try {
    const [upserted] = await db
      .insert(checkinEntriesTable)
      .values({ userId, date, financial, health, skills, social, resources })
      .onConflictDoUpdate({
        target: [checkinEntriesTable.userId, checkinEntriesTable.date],
        set: {
          financial,
          health,
          skills,
          social,
          resources,
          updatedAt: new Date(),
        },
      })
      .returning();

    return res.status(200).json({
      checkin: {
        date: upserted.date,
        scores: {
          financial: upserted.financial,
          health: upserted.health,
          skills: upserted.skills,
          social: upserted.social,
          resources: upserted.resources,
        },
      },
    });
  } catch (err) {
    logger.error({ err }, "Failed to upsert checkin");
    return res.status(500).json({ error: "Failed to save checkin" });
  }
});

export default router;
