import { Router, type IRouter, type Request, type Response } from "express";
import { db, assessmentDraftsTable } from "@workspace/db";
import { eq, and, or, isNull } from "drizzle-orm";

const router: IRouter = Router();

function getDraftWhere(req: Request) {
  const userId = req.isAuthenticated() ? req.user.id : null;
  const sessionId = (req.body?.sessionId as string | undefined) || (req.query["sessionId"] as string | undefined);

  if (userId) return eq(assessmentDraftsTable.userId, userId);
  if (sessionId) return and(isNull(assessmentDraftsTable.userId), eq(assessmentDraftsTable.sessionId, sessionId));
  return null;
}

router.get("/assessment", async (req: Request, res: Response) => {
  try {
    const userId = req.isAuthenticated() ? req.user.id : null;
    const sessionId = req.query["sessionId"] as string | undefined;

    if (!userId && !sessionId) {
      res.json({ draft: null });
      return;
    }

    const condition = userId
      ? eq(assessmentDraftsTable.userId, userId)
      : and(isNull(assessmentDraftsTable.userId), eq(assessmentDraftsTable.sessionId, sessionId!));

    const rows = await db.select().from(assessmentDraftsTable).where(condition).limit(1);
    res.json({ draft: rows[0] ?? null });
  } catch (err) {
    req.log.error({ err }, "Error fetching assessment draft");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch draft." });
  }
});

router.put("/assessment", async (req: Request, res: Response) => {
  try {
    const { draftData, currentStep, currentMrStep, language, sessionId } = req.body as {
      draftData: unknown;
      currentStep?: number;
      currentMrStep?: number;
      language?: string;
      sessionId?: string;
    };

    if (!draftData || typeof draftData !== "object") {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "draftData is required." });
      return;
    }

    const userId = req.isAuthenticated() ? req.user.id : null;

    if (!userId && !sessionId) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "sessionId required for anonymous drafts." });
      return;
    }

    const values = {
      userId,
      sessionId: userId ? null : (sessionId ?? null),
      draftData,
      currentStep: currentStep ?? 1,
      currentMrStep: currentMrStep ?? 0,
      language: language ?? "en",
      updatedAt: new Date(),
    };

    if (userId) {
      const existing = await db.select({ id: assessmentDraftsTable.id })
        .from(assessmentDraftsTable)
        .where(eq(assessmentDraftsTable.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        await db.update(assessmentDraftsTable).set(values).where(eq(assessmentDraftsTable.userId, userId));
      } else {
        await db.insert(assessmentDraftsTable).values(values);
      }
    } else {
      const existing = await db.select({ id: assessmentDraftsTable.id })
        .from(assessmentDraftsTable)
        .where(and(isNull(assessmentDraftsTable.userId), eq(assessmentDraftsTable.sessionId, sessionId!)))
        .limit(1);

      if (existing.length > 0) {
        await db.update(assessmentDraftsTable).set(values)
          .where(and(isNull(assessmentDraftsTable.userId), eq(assessmentDraftsTable.sessionId, sessionId!)));
      } else {
        await db.insert(assessmentDraftsTable).values(values);
      }
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error saving assessment draft");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to save draft." });
  }
});

router.delete("/assessment", async (req: Request, res: Response) => {
  try {
    const userId = req.isAuthenticated() ? req.user.id : null;
    const sessionId = req.query["sessionId"] as string | undefined;

    if (userId) {
      await db.delete(assessmentDraftsTable).where(eq(assessmentDraftsTable.userId, userId));
    } else if (sessionId) {
      await db.delete(assessmentDraftsTable)
        .where(and(isNull(assessmentDraftsTable.userId), eq(assessmentDraftsTable.sessionId, sessionId)));
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting assessment draft");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete draft." });
  }
});

export default router;
