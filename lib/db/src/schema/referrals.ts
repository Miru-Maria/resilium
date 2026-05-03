import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const referralCodesTable = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralUsesTable = pgTable("referral_uses", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull(),
  referrerId: varchar("referrer_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  referredId: varchar("referred_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ReferralCode = typeof referralCodesTable.$inferSelect;
export type ReferralUse = typeof referralUsesTable.$inferSelect;
