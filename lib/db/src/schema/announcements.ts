import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteAnnouncementsTable = pgTable("site_announcements", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteAnnouncementSchema = createInsertSchema(siteAnnouncementsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSiteAnnouncement = z.infer<typeof insertSiteAnnouncementSchema>;
export type SiteAnnouncement = typeof siteAnnouncementsTable.$inferSelect;
