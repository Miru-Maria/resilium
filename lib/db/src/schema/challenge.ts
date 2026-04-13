import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const challengeStateTable = pgTable("challenge_state", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  dimensionOrder: text("dimension_order").notNull(),
  completedDays: text("completed_days").notNull().default("[]"),
});

export type ChallengeState = typeof challengeStateTable.$inferSelect;
export type InsertChallengeState = typeof challengeStateTable.$inferInsert;
