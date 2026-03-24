import { pgTable, text, serial, real, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";

export const resilienceReportsTable = pgTable("resilience_reports", {
  id: serial("id").primaryKey(),
  reportId: text("report_id").notNull().unique(),
  sessionId: text("session_id"),
  userId: varchar("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
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

  // Mental resilience sub-scores (1-5 scale normalized to 0-100)
  mrStressTolerance: real("mr_stress_tolerance"),
  mrAdaptability: real("mr_adaptability"),
  mrLearningAgility: real("mr_learning_agility"),
  mrChangeManagement: real("mr_change_management"),
  mrEmotionalRegulation: real("mr_emotional_regulation"),
  mrSocialSupport: real("mr_social_support"),
  mrComposite: real("mr_composite"),
  // growth | compensation | null
  mrPathway: text("mr_pathway"),

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
  checklistsByArea: jsonb("checklists_by_area"),
});

export const insertResilienceReportSchema = createInsertSchema(resilienceReportsTable).omit({ id: true });
export type InsertResilienceReport = z.infer<typeof insertResilienceReportSchema>;
export type ResilienceReport = typeof resilienceReportsTable.$inferSelect;

export const checklistProgressTable = pgTable("checklist_progress", {
  id: serial("id").primaryKey(),
  reportId: text("report_id").notNull(),
  area: text("area").notNull(),
  itemId: text("item_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

export const insertChecklistProgressSchema = createInsertSchema(checklistProgressTable).omit({ id: true });
export type InsertChecklistProgress = z.infer<typeof insertChecklistProgressSchema>;
export type ChecklistProgress = typeof checklistProgressTable.$inferSelect;

export const progressSnapshotsTable = pgTable("progress_snapshots", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  reportId: text("report_id").notNull(),
  snapshotAt: timestamp("snapshot_at").defaultNow().notNull(),
  scoreOverall: real("score_overall").notNull(),
  scoreFinancial: real("score_financial").notNull(),
  scoreHealth: real("score_health").notNull(),
  scoreSkills: real("score_skills").notNull(),
  scoreMobility: real("score_mobility").notNull(),
  scorePsychological: real("score_psychological").notNull(),
  scoreResources: real("score_resources").notNull(),
  mrComposite: real("mr_composite"),
});

export const insertProgressSnapshotSchema = createInsertSchema(progressSnapshotsTable).omit({ id: true });
export type InsertProgressSnapshot = z.infer<typeof insertProgressSnapshotSchema>;
export type ProgressSnapshot = typeof progressSnapshotsTable.$inferSelect;
