import { pgTable, text, serial, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resilienceReportsTable = pgTable("resilience_reports", {
  id: serial("id").primaryKey(),
  reportId: text("report_id").notNull().unique(),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  location: text("location").notNull(),
  incomeStability: text("income_stability").notNull(),
  savingsMonths: real("savings_months").notNull(),
  hasDependents: boolean("has_dependents").notNull(),
  skills: jsonb("skills").notNull(),
  healthStatus: text("health_status").notNull(),
  mobilityLevel: text("mobility_level").notNull(),
  housingType: text("housing_type").notNull(),
  hasEmergencySupplies: boolean("has_emergency_supplies").notNull(),
  psychologicalResilience: real("psychological_resilience").notNull(),
  riskConcerns: jsonb("risk_concerns").notNull(),

  scoreOverall: real("score_overall").notNull(),
  scoreFinancial: real("score_financial").notNull(),
  scoreHealth: real("score_health").notNull(),
  scoreSkills: real("score_skills").notNull(),
  scoreMobility: real("score_mobility").notNull(),
  scorePsychological: real("score_psychological").notNull(),
  scoreResources: real("score_resources").notNull(),

  riskProfileSummary: text("risk_profile_summary").notNull(),
  topVulnerabilities: jsonb("top_vulnerabilities").notNull(),
  actionPlan: jsonb("action_plan").notNull(),
  scenarioSimulations: jsonb("scenario_simulations").notNull(),
  dailyHabits: jsonb("daily_habits").notNull(),
});

export const insertResilienceReportSchema = createInsertSchema(resilienceReportsTable).omit({ id: true });
export type InsertResilienceReport = z.infer<typeof insertResilienceReportSchema>;
export type ResilienceReport = typeof resilienceReportsTable.$inferSelect;
