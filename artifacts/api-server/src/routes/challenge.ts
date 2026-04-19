import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db, challengeStateTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { challengeLimiter } from "../lib/rate-limiters";

const router = Router();

router.get("/api/challenge", requireAuth(), async (req, res): Promise<void> => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const [row] = await db
      .select()
      .from(challengeStateTable)
      .where(eq(challengeStateTable.userId, userId))
      .limit(1);

    if (!row) { res.status(404).json({ error: "No challenge started" }); return; }

    res.json({
      startedAt: row.startedAt.toISOString(),
      dimensionOrder: JSON.parse(row.dimensionOrder),
      completedDays: JSON.parse(row.completedDays),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching challenge");
    res.status(500).json({ error: "Failed to fetch challenge" });
  }
});

router.post("/api/challenge/start", challengeLimiter, requireAuth(), async (req, res): Promise<void> => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const { dimensionOrder } = req.body as { dimensionOrder: string[] };
    if (!Array.isArray(dimensionOrder) || dimensionOrder.length !== 6) {
      res.status(400).json({ error: "Invalid dimension order" }); return;
    }

    const [existing] = await db
      .select()
      .from(challengeStateTable)
      .where(eq(challengeStateTable.userId, userId))
      .limit(1);

    if (existing) {
      res.json({
        startedAt: existing.startedAt.toISOString(),
        dimensionOrder: JSON.parse(existing.dimensionOrder),
        completedDays: JSON.parse(existing.completedDays),
      });
      return;
    }

    const [row] = await db
      .insert(challengeStateTable)
      .values({
        userId,
        dimensionOrder: JSON.stringify(dimensionOrder),
        completedDays: "[]",
      })
      .returning();

    res.status(201).json({
      startedAt: row.startedAt.toISOString(),
      dimensionOrder: JSON.parse(row.dimensionOrder),
      completedDays: JSON.parse(row.completedDays),
    });
  } catch (err) {
    req.log.error({ err }, "Error starting challenge");
    res.status(500).json({ error: "Failed to start challenge" });
  }
});

router.post("/api/challenge/complete/:day", challengeLimiter, requireAuth(), async (req, res): Promise<void> => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const day = Number(req.params["day"]);
    if (!Number.isInteger(day) || day < 1 || day > 30) {
      res.status(400).json({ error: "Invalid day number" }); return;
    }

    const [row] = await db
      .select()
      .from(challengeStateTable)
      .where(eq(challengeStateTable.userId, userId))
      .limit(1);

    if (!row) { res.status(404).json({ error: "No challenge started" }); return; }

    const completedDays: number[] = JSON.parse(row.completedDays);
    if (!completedDays.includes(day)) {
      completedDays.push(day);
      completedDays.sort((a, b) => a - b);
    }

    const [updated] = await db
      .update(challengeStateTable)
      .set({ completedDays: JSON.stringify(completedDays) })
      .where(eq(challengeStateTable.userId, userId))
      .returning();

    res.json({
      startedAt: updated.startedAt.toISOString(),
      dimensionOrder: JSON.parse(updated.dimensionOrder),
      completedDays: JSON.parse(updated.completedDays),
    });
  } catch (err) {
    req.log.error({ err }, "Error completing challenge day");
    res.status(500).json({ error: "Failed to complete day" });
  }
});

router.delete("/api/challenge/complete/:day", challengeLimiter, requireAuth(), async (req, res): Promise<void> => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const day = Number(req.params["day"]);
    if (!Number.isInteger(day) || day < 1 || day > 30) {
      res.status(400).json({ error: "Invalid day number" }); return;
    }

    const [row] = await db
      .select()
      .from(challengeStateTable)
      .where(eq(challengeStateTable.userId, userId))
      .limit(1);

    if (!row) { res.status(404).json({ error: "No challenge started" }); return; }

    const completedDays: number[] = JSON.parse(row.completedDays);
    const filtered = completedDays.filter((d) => d !== day);

    const [updated] = await db
      .update(challengeStateTable)
      .set({ completedDays: JSON.stringify(filtered) })
      .where(eq(challengeStateTable.userId, userId))
      .returning();

    res.json({
      startedAt: updated.startedAt.toISOString(),
      dimensionOrder: JSON.parse(updated.dimensionOrder),
      completedDays: JSON.parse(updated.completedDays),
    });
  } catch (err) {
    req.log.error({ err }, "Error uncompleting challenge day");
    res.status(500).json({ error: "Failed to uncomplete day" });
  }
});

export default router;
