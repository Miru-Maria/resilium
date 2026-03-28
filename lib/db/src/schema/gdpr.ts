import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const consentRecordsTable = pgTable("consent_records", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  platform: text("platform").notNull(),
  consentVersion: text("consent_version").notNull().default("1.0"),
  consentedAt: timestamp("consented_at").defaultNow().notNull(),
});

export const insertConsentRecordSchema = createInsertSchema(consentRecordsTable).omit({ id: true });
export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;
export type ConsentRecord = typeof consentRecordsTable.$inferSelect;

export const gdprDataRequestsTable = pgTable("gdpr_data_requests", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
});

export const insertGdprDataRequestSchema = createInsertSchema(gdprDataRequestsTable).omit({ id: true });
export type InsertGdprDataRequest = z.infer<typeof insertGdprDataRequestSchema>;
export type GdprDataRequest = typeof gdprDataRequestsTable.$inferSelect;

export const gdprAdminActionsTable = pgTable("gdpr_admin_actions", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  action: text("action").notNull(),
  sessionId: text("session_id").notNull(),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const insertGdprAdminActionSchema = createInsertSchema(gdprAdminActionsTable).omit({ id: true });
export type InsertGdprAdminAction = z.infer<typeof insertGdprAdminActionSchema>;
export type GdprAdminAction = typeof gdprAdminActionsTable.$inferSelect;
