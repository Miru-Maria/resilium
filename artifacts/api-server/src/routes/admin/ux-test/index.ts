import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { db, uxTestRunsTable, uxTestResultsTable, resilienceReportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { PERSONAS } from "./personas.js";
import { runUxTestSimulation, type ProgressEvent } from "./simulation.js";
import { verifyAdminToken } from "../../../middlewares/adminAuth.js";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response): boolean {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token && verifyAdminToken(token)) return true;
  res.status(401).json({ error: "Unauthorized" });
  return false;
}

router.get("/personas", (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  res.json({
    personas: PERSONAS.map((p) => ({
      key: p.key,
      name: p.name,
      description: p.description,
    })),
  });
});

const activeStreams = new Map<string, Response[]>();

router.post("/run", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const body = req.body as { personaKeys?: string[] };
  const personaKeys = body.personaKeys ?? PERSONAS.map((p) => p.key);

  const selectedPersonas = PERSONAS.filter((p) => personaKeys.includes(p.key));
  if (selectedPersonas.length === 0) {
    res.status(400).json({ error: "No valid personas selected" });
    return;
  }

  const runId = randomUUID();

  await db.insert(uxTestRunsTable).values({
    runId,
    personaCount: selectedPersonas.length,
    status: "running",
    startedAt: new Date(),
  });

  for (const persona of selectedPersonas) {
    await db.insert(uxTestResultsTable).values({
      runId,
      personaKey: persona.key,
      personaName: persona.name,
      assessmentData: persona.assessmentData,
      status: "pending",
    });
  }

  const sendToStreams = (event: ProgressEvent) => {
    const clients = activeStreams.get(runId) ?? [];
    const data = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of clients) {
      client.write(data);
    }
  };

  runUxTestSimulation(runId, selectedPersonas, sendToStreams).catch((err: unknown) => {
    const errorMsg = err instanceof Error ? err.message : String(err);
    sendToStreams({ type: "run_failed", error: errorMsg, runId });
  });

  res.json({ runId });
});

router.get("/runs", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const runs = await db
    .select()
    .from(uxTestRunsTable)
    .orderBy(desc(uxTestRunsTable.startedAt))
    .limit(50);

  res.json({
    runs: runs.map((r) => ({
      runId: r.runId,
      startedAt: r.startedAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
      personaCount: r.personaCount,
      status: r.status,
    })),
  });
});

router.get("/runs/:runId", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const { runId } = req.params;

  const runs = await db
    .select()
    .from(uxTestRunsTable)
    .where(eq(uxTestRunsTable.runId, runId))
    .limit(1);

  const run = runs[0];
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }

  const results = await db
    .select()
    .from(uxTestResultsTable)
    .where(eq(uxTestResultsTable.runId, runId));

  const personaMap = new Map(PERSONAS.map((p) => [p.key, p]));

  res.json({
    runId: run.runId,
    startedAt: run.startedAt.toISOString(),
    completedAt: run.completedAt?.toISOString() ?? null,
    personaCount: run.personaCount,
    status: run.status,
    crossPersonaSummary: run.crossPersonaSummary ?? null,
    results: results.map((r) => {
      const persona = personaMap.get(r.personaKey);
      return {
        personaKey: r.personaKey,
        personaName: r.personaName,
        personaDescription: persona?.description ?? "",
        assessmentData: r.assessmentData,
        scores: r.scores,
        aiQualityRating: r.aiQualityRating,
        aiQualityNotes: r.aiQualityNotes,
        observations: r.observations,
        status: r.status,
        error: r.error,
        completedAt: r.completedAt?.toISOString() ?? null,
      };
    }),
  });
});

router.delete("/runs/:runId", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const { runId } = req.params;

  const existing = await db
    .select()
    .from(uxTestRunsTable)
    .where(eq(uxTestRunsTable.runId, runId))
    .limit(1);

  if (!existing[0]) {
    res.status(404).json({ error: "Run not found" });
    return;
  }

  await db.delete(uxTestResultsTable).where(eq(uxTestResultsTable.runId, runId));
  await db.delete(uxTestRunsTable).where(eq(uxTestRunsTable.runId, runId));
  // Clean up any test reports that were created for this run but not yet purged
  await db.delete(resilienceReportsTable).where(eq(resilienceReportsTable.sessionId, `ux-test-${runId}`));

  // Close any active SSE streams for this run
  const clients = activeStreams.get(runId) ?? [];
  for (const client of clients) {
    try { client.end(); } catch { /* ignore */ }
  }
  activeStreams.delete(runId);

  res.json({ success: true });
});

router.post("/runs/:runId/cancel", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const { runId } = req.params;

  await db
    .update(uxTestRunsTable)
    .set({ status: "failed", completedAt: new Date() })
    .where(eq(uxTestRunsTable.runId, runId));

  await db
    .update(uxTestResultsTable)
    .set({ status: "failed", error: "Cancelled by admin", completedAt: new Date() })
    .where(eq(uxTestResultsTable.runId, runId));

  // Clean up any test reports created before the cancel
  await db.delete(resilienceReportsTable).where(eq(resilienceReportsTable.sessionId, `ux-test-${runId}`));

  const clients = activeStreams.get(runId) ?? [];
  for (const client of clients) {
    try { client.write(`data: ${JSON.stringify({ type: "run_failed", error: "Cancelled", runId })}\n\n`); client.end(); } catch { /* ignore */ }
  }
  activeStreams.delete(runId);

  res.json({ success: true });
});

router.get("/runs/:runId/stream", (req: Request, res: Response) => {
  // SSE can't send custom headers, so we accept token as query param too
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const queryToken = req.query["token"] as string | undefined;
  const token = bearerToken ?? queryToken ?? null;

  if (!token || !verifyAdminToken(token)) {
    res.status(401).end();
    return;
  }

  const { runId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const clients = activeStreams.get(runId) ?? [];
  clients.push(res);
  activeStreams.set(runId, clients);

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    const remaining = (activeStreams.get(runId) ?? []).filter((c) => c !== res);
    if (remaining.length === 0) {
      activeStreams.delete(runId);
    } else {
      activeStreams.set(runId, remaining);
    }
  });
});

export default router;
