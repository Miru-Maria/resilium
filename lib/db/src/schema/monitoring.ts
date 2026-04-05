import { pgTable, text, serial, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const competitorChecksTable = pgTable("competitor_checks", {
  id: serial("id").primaryKey(),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
  competitor: text("competitor").notNull(),
  url: text("url").notNull(),
  statusCode: integer("status_code"),
  contentHash: text("content_hash"),
  previousHash: text("previous_hash"),
  changeDetected: boolean("change_detected").default(false).notNull(),
  changeNotes: text("change_notes"),
  error: text("error"),
});

export type CompetitorCheck = typeof competitorChecksTable.$inferSelect;

export const healthChecksTable = pgTable("health_checks", {
  id: serial("id").primaryKey(),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
  overallStatus: text("overall_status").notNull(),
  passCount: integer("pass_count").notNull().default(0),
  failCount: integer("fail_count").notNull().default(0),
  results: jsonb("results").notNull(),
  triggeredBy: text("triggered_by").default("cron").notNull(),
});

export type HealthCheck = typeof healthChecksTable.$inferSelect;

export const planViewsTable = pgTable("plan_views", {
  id: serial("id").primaryKey(),
  reportId: text("report_id").notNull(),
  userId: text("user_id"),
  sessionId: text("session_id"),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export type PlanView = typeof planViewsTable.$inferSelect;
