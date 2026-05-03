import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const contentOpportunitiesTable = pgTable("content_opportunities", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  body: text("body"),
  subreddit: text("subreddit"),
  upvotes: integer("upvotes").default(0),
  commentCount: integer("comment_count").default(0),
  draftReply: text("draft_reply"),
  relevanceScore: integer("relevance_score").default(0),
  emailedAt: timestamp("emailed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ContentOpportunity = typeof contentOpportunitiesTable.$inferSelect;
export type InsertContentOpportunity = typeof contentOpportunitiesTable.$inferInsert;
