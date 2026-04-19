import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const emailDripQueueTable = pgTable("email_drip_queue", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  reportId: varchar("report_id", { length: 64 }).notNull(),
  emailType: varchar("email_type", { length: 10 }).notNull(),
  scoreOverall: integer("score_overall").notNull(),
  weakestDimension: varchar("weakest_dimension", { length: 30 }),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmailDripQueueRow = typeof emailDripQueueTable.$inferSelect;
