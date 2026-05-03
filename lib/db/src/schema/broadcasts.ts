import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const broadcastCampaignsTable = pgTable("broadcast_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  segment: text("segment").notNull(),
  status: text("status").notNull().default("draft"),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BroadcastCampaign = typeof broadcastCampaignsTable.$inferSelect;
