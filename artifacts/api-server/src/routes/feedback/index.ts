import { Router, type IRouter } from "express";
import { db, reportFeedbackTable, resilienceReportsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const { reportId, rating, comment } = req.body as Record<string, unknown>;

    if (typeof reportId !== "string" || !reportId) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "reportId is required." });
      return;
    }

    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "rating must be an integer between 1 and 5." });
      return;
    }

    if (comment !== undefined && (typeof comment !== "string" || comment.length > 2000)) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "comment must be a string under 2000 chars." });
      return;
    }

    const existing = await db
      .select({ id: resilienceReportsTable.id })
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.reportId, reportId))
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "NOT_FOUND", message: "Report not found." });
      return;
    }

    await db.insert(reportFeedbackTable).values({
      reportId,
      rating,
      comment: typeof comment === "string" ? comment : null,
    });

    res.status(201).json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error submitting feedback");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to submit feedback." });
  }
});

export default router;
