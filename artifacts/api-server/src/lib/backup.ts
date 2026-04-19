import { Storage } from "@google-cloud/storage";
import { db, usersTable, resilienceReportsTable, reportFeedbackTable, subscriptionsTable, emailDripQueueTable, adminConfigTable, planViewsTable } from "@workspace/db";
import { logger } from "./logger.js";
import { sendErrorAlert } from "./email.js";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

const MAX_BACKUP_AGE_DAYS = 7;

function getStorageClient(): Storage {
  return new Storage({
    credentials: {
      audience: "replit",
      subject_token_type: "access_token",
      token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
      type: "external_account",
      credential_source: {
        url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
        format: { type: "json", subject_token_field_name: "access_token" },
      },
      universe_domain: "googleapis.com",
    },
    projectId: "",
  } as ConstructorParameters<typeof Storage>[0]);
}

async function dumpAllTables(): Promise<Record<string, unknown[]>> {
  const [users, reports, feedback, subscriptions, dripQueue, adminConfig, planViews] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(resilienceReportsTable),
    db.select().from(reportFeedbackTable),
    db.select().from(subscriptionsTable),
    db.select().from(emailDripQueueTable),
    db.select().from(adminConfigTable),
    db.select().from(planViewsTable),
  ]);
  return {
    users,
    resilience_reports: reports,
    report_feedback: feedback,
    subscriptions,
    email_drip_queue: dripQueue,
    admin_config: adminConfig,
    plan_views: planViews,
  };
}

async function pruneOldBackups(bucket: ReturnType<Storage["bucket"]>): Promise<void> {
  try {
    const [files] = await bucket.getFiles({ prefix: "backups/db-backup-" });
    const cutoff = Date.now() - MAX_BACKUP_AGE_DAYS * 24 * 60 * 60 * 1000;
    const toDelete = files.filter(f => {
      const match = f.name.match(/db-backup-(\d+)\.json$/);
      return match && parseInt(match[1]!, 10) < cutoff;
    });
    await Promise.all(toDelete.map(f => f.delete()));
    if (toDelete.length > 0) {
      logger.info({ count: toDelete.length }, "Backup pruner: deleted old backup files");
    }
  } catch (err) {
    logger.warn({ err }, "Backup pruner: failed to prune old backups (non-fatal)");
  }
}

export interface BackupFileMeta {
  filename: string;
  timestamp: number;
  sizeBytes: number;
  iso: string;
}

export async function listBackups(): Promise<BackupFileMeta[]> {
  const bucketId = process.env["DEFAULT_OBJECT_STORAGE_BUCKET_ID"];
  if (!bucketId) return [];
  const storage = getStorageClient();
  const bucket = storage.bucket(bucketId);
  const [files] = await bucket.getFiles({ prefix: "backups/db-backup-" });
  const results: BackupFileMeta[] = files
    .map(f => {
      const match = f.name.match(/db-backup-(\d+)\.json$/);
      const timestamp = match ? parseInt(match[1]!, 10) : 0;
      return {
        filename: f.name,
        timestamp,
        sizeBytes: parseInt(String(f.metadata?.["size"] ?? "0"), 10),
        iso: new Date(timestamp).toISOString(),
      };
    })
    .filter(f => f.timestamp > 0)
    .sort((a, b) => b.timestamp - a.timestamp);
  return results;
}

export async function runDatabaseBackup(): Promise<void> {
  const bucketId = process.env["DEFAULT_OBJECT_STORAGE_BUCKET_ID"];
  if (!bucketId) {
    logger.warn("DB backup skipped: DEFAULT_OBJECT_STORAGE_BUCKET_ID not set");
    return;
  }

  const timestamp = Date.now();
  const filename = `backups/db-backup-${timestamp}.json`;

  try {
    logger.info("DB backup: starting daily snapshot");

    const dump = await dumpAllTables();
    const meta = {
      timestamp: new Date(timestamp).toISOString(),
      tables: Object.fromEntries(Object.entries(dump).map(([k, v]) => [k, v.length])),
    };
    const payload = JSON.stringify({ meta, data: dump }, null, 2);

    const storage = getStorageClient();
    const bucket = storage.bucket(bucketId);
    const file = bucket.file(filename);

    await file.save(payload, { contentType: "application/json", resumable: false });

    logger.info({ filename, meta }, "DB backup: snapshot uploaded successfully");

    await pruneOldBackups(bucket);
  } catch (err) {
    logger.error({ err, filename }, "DB backup: FAILED");
    try {
      await sendErrorAlert(`Daily DB backup failed at ${new Date(timestamp).toISOString()}: ${err instanceof Error ? err.message : String(err)}`);
    } catch { /* email failure is non-fatal */ }
  }
}
