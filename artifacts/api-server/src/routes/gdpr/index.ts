import { Router, type IRouter } from "express";
import { db, consentRecordsTable, gdprDataRequestsTable, resilienceReportsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendGdprRequestNotification } from "../../lib/email.js";

const router: IRouter = Router();

router.post("/consent", async (req, res) => {
  try {
    const { sessionId, platform, consentVersion = "1.0" } = req.body ?? {};
    if (!sessionId || !platform) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "sessionId and platform are required." });
      return;
    }
    await db
      .insert(consentRecordsTable)
      .values({ sessionId: String(sessionId), platform: String(platform), consentVersion: String(consentVersion) })
      .onConflictDoNothing();
    res.json({ success: true, sessionId });
  } catch (err) {
    req.log.error({ err }, "Error recording consent");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to record consent." });
  }
});

router.get("/export/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "Session ID is required." });
      return;
    }

    const consentRows = await db
      .select()
      .from(consentRecordsTable)
      .where(eq(consentRecordsTable.sessionId, sessionId))
      .limit(1);

    const reportRows = await db
      .select()
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.sessionId, sessionId));

    const dataRequestRows = await db
      .select()
      .from(gdprDataRequestsTable)
      .where(eq(gdprDataRequestsTable.sessionId, sessionId));

    await db.insert(gdprDataRequestsTable).values({
      sessionId,
      type: "export",
      status: "completed",
    });

    res.json({
      sessionId,
      exportedAt: new Date().toISOString(),
      consent: consentRows[0] ?? null,
      reports: reportRows,
      dataRequests: dataRequestRows,
    });
  } catch (err) {
    req.log.error({ err }, "Error exporting GDPR data");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to export data." });
  }
});

router.post("/data-request", async (req, res) => {
  try {
    const { sessionId, type } = req.body ?? {};
    if (!sessionId || !["deletion", "export"].includes(type)) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "sessionId and valid type (deletion|export) are required." });
      return;
    }

    await db.insert(gdprDataRequestsTable).values({
      sessionId: String(sessionId),
      type: String(type),
      status: type === "deletion" ? "pending" : "completed",
    });

    sendGdprRequestNotification({ type: type as "deletion" | "export", sessionId: String(sessionId) }).catch(() => {});

    const message = type === "deletion"
      ? "Deletion request received. Your data will be deleted within 30 days."
      : "Export request received.";

    res.json({
      success: true,
      message,
      requestId: Date.now().toString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error processing GDPR data request");
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to process request." });
  }
});

export default router;
