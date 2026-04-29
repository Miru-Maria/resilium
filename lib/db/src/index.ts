import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 120_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 15_000,
});

// Swallow idle-client errors emitted when the server terminates a connection
// (e.g. DB restarts, maintenance). node-postgres reconnects automatically;
// without this handler the error becomes an uncaught exception.
pool.on("error", (_err) => {});

export const db = drizzle(pool, { schema });

export * from "./schema";
