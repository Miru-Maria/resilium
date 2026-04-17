import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./auth";

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  // Stripe fields (active payment provider)
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  // Legacy Paddle fields (kept for historical data)
  paddleSubscriptionId: text("paddle_subscription_id"),
  paddleCustomerId: text("paddle_customer_id"),
  status: text("status").notNull().default("inactive"),
  planName: text("plan_name").default("Pro"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({ id: true });
export type InsertSubscription = Omit<typeof subscriptionsTable.$inferInsert, "id">;
export type Subscription = typeof subscriptionsTable.$inferSelect;
