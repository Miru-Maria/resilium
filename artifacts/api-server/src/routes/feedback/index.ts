import { Router, type IRouter } from "express";
import { db, reportFeedbackTable, resilienceReportsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

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

    const commentStr = typeof comment === "string" ? comment.trim() : null;

    const BLOCKED_WORDS = ["spam", "fuck", "shit", "ass", "bitch", "cunt", "dick", "bastard", "idiot", "stupid", "scam", "fake", "fraud"];
    const autoPublish =
      rating >= 4 &&
      commentStr !== null &&
      commentStr.length >= 20 &&
      !BLOCKED_WORDS.some(w => commentStr.toLowerCase().includes(w));

    await db.insert(reportFeedbackTable).values({
      reportId,
      rating,
      comment: commentStr,
      isPublished: autoPublish,
    });

    res.status(201).json({ success: true, autoPublished: autoPublish });
  } catch (err) {
    req.log.error({ err }, "Error submitting feedback");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to submit feedback." });
  }
});

router.get("/testimonials", async (req, res) => {
  try {
    const testimonials = await db
      .select({
        id: reportFeedbackTable.id,
        rating: reportFeedbackTable.rating,
        comment: reportFeedbackTable.comment,
        createdAt: reportFeedbackTable.createdAt,
      })
      .from(reportFeedbackTable)
      .where(
        and(
          eq(reportFeedbackTable.isPublished, true),
        )
      )
      .orderBy(desc(reportFeedbackTable.createdAt))
      .limit(12);

    res.json({ testimonials: testimonials.filter(t => t.rating >= 4 && t.comment && t.comment.trim().length > 0) });
  } catch (err) {
    req.log.error({ err }, "Error fetching testimonials");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch testimonials." });
  }
});

export default router;
