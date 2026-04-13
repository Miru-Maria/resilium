import app from "./app";
import { logger } from "./lib/logger";
import { db, resilienceReportsTable } from "@workspace/db";
import { isNull, lt, and } from "drizzle-orm";

async function cleanupAnonymousReports() {
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await db.delete(resilienceReportsTable).where(
      and(isNull(resilienceReportsTable.userId), lt(resilienceReportsTable.createdAt, cutoff))
    );
    logger.info("Anonymous report cleanup complete");
  } catch (err) {
    logger.error({ err }, "Failed to clean up anonymous reports");
  }
}

cleanupAnonymousReports();
setInterval(cleanupAnonymousReports, 24 * 60 * 60 * 1000);

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
