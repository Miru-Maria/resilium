import { Router, type IRouter } from "express";
import { db, gdprDataRequestsTable, gdprAdminActionsTable, consentRecordsTable, resilienceReportsTable } from "@workspace/db";
import { eq, desc, asc } from "drizzle-orm";
import { requireAdminSession } from "../../middlewares/adminAuth.js";

const router: IRouter = Router();

router.use(requireAdminSession);

router.get("/requests", async (req, res) => {
  try {
    const requests = await db
      .select()
      .from(gdprDataRequestsTable)
      .orderBy(desc(gdprDataRequestsTable.requestedAt));

    res.json({
      requests: requests.map((r) => ({
        id: r.id,
        sessionId: r.sessionId,
        type: r.type,
        status: r.status,
        requestedAt: r.requestedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching GDPR requests");
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

router.post("/requests/:id/fulfill", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid request ID" });
      return;
    }

    const rows = await db
      .select()
      .from(gdprDataRequestsTable)
      .where(eq(gdprDataRequestsTable.id, id))
      .limit(1);

    const request = rows[0];
    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (request.status === "fulfilled") {
      res.status(400).json({ error: "Request already fulfilled" });
      return;
    }

    if (request.type === "deletion") {
      await db
        .delete(resilienceReportsTable)
        .where(eq(resilienceReportsTable.sessionId, request.sessionId));

      await db
        .delete(consentRecordsTable)
        .where(eq(consentRecordsTable.sessionId, request.sessionId));
    }

    await db
      .update(gdprDataRequestsTable)
      .set({ status: "fulfilled" })
      .where(eq(gdprDataRequestsTable.id, id));

    await db.insert(gdprAdminActionsTable).values({
      requestId: id,
      action: request.type === "deletion" ? "fulfilled_deletion" : "fulfilled_export",
      sessionId: request.sessionId,
      notes: `Request fulfilled by admin`,
    });

    res.json({ success: true, id });
  } catch (err) {
    req.log.error({ err }, "Error fulfilling GDPR request");
    res.status(500).json({ error: "Failed to fulfill request" });
  }
});

router.get("/requests/:id/export", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid request ID" });
      return;
    }

    const rows = await db
      .select()
      .from(gdprDataRequestsTable)
      .where(eq(gdprDataRequestsTable.id, id))
      .limit(1);

    const request = rows[0];
    if (!request || request.type !== "export") {
      res.status(404).json({ error: "Export request not found" });
      return;
    }

    const sessionId = request.sessionId;

    const consentRows = await db
      .select()
      .from(consentRecordsTable)
      .where(eq(consentRecordsTable.sessionId, sessionId))
      .limit(1);

    const reportRows = await db
      .select()
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.sessionId, sessionId));

    const exportData = {
      sessionId,
      exportedAt: new Date().toISOString(),
      consent: consentRows[0] ?? null,
      reports: reportRows,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="gdpr-export-${sessionId.slice(0, 8)}.json"`,
    );
    res.json(exportData);
  } catch (err) {
    req.log.error({ err }, "Error downloading GDPR export");
    res.status(500).json({ error: "Failed to download export" });
  }
});

router.get("/consent-log", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "50"), 10)));
    const offset = (page - 1) * pageSize;

    const records = await db
      .select()
      .from(consentRecordsTable)
      .orderBy(desc(consentRecordsTable.consentedAt))
      .limit(pageSize)
      .offset(offset);

    const totalRows = await db.select().from(consentRecordsTable);
    const total = totalRows.length;

    res.json({
      records: records.map((r) => ({
        id: r.id,
        sessionId: r.sessionId,
        platform: r.platform,
        consentVersion: r.consentVersion,
        consentedAt: r.consentedAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching consent log");
    res.status(500).json({ error: "Failed to fetch consent log" });
  }
});

export default router;
