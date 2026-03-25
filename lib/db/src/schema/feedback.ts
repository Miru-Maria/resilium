import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportFeedbackTable = pgTable("report_feedback", {
  id: serial("id").primaryKey(),
  reportId: text("report_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportFeedbackSchema = createInsertSchema(reportFeedbackTable).omit({ id: true, createdAt: true }).extend({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export type InsertReportFeedback = z.infer<typeof insertReportFeedbackSchema>;
export type ReportFeedback = typeof reportFeedbackTable.$inferSelect;
