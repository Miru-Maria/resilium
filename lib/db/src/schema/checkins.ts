import { pgTable, serial, varchar, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const checkinEntriesTable = pgTable("checkin_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  financial: integer("financial").notNull(),
  health: integer("health").notNull(),
  skills: integer("skills").notNull(),
  social: integer("social").notNull(),
  resources: integer("resources").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  unique("checkin_entries_user_date").on(t.userId, t.date),
]);

export type CheckinEntry = typeof checkinEntriesTable.$inferSelect;
export type InsertCheckinEntry = typeof checkinEntriesTable.$inferInsert;
