import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const blogKeywordsTable = pgTable("blog_keywords", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  pillar: text("pillar").notNull().default("financial"),
  pillarLabel: text("pillar_label").notNull().default("Financial Resilience"),
  priority: integer("priority").notNull().default(5),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type BlogKeyword = typeof blogKeywordsTable.$inferSelect;
export type InsertBlogKeyword = typeof blogKeywordsTable.$inferInsert;
