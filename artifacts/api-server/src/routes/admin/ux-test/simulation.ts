import { randomUUID } from "crypto";
import { db, resilienceReportsTable, uxTestResultsTable, uxTestRunsTable } from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";
import { calculateScores } from "../../resilience/scoring.js";
import { generateResilienceReport } from "../../resilience/ai.js";
import { openai } from "@workspace/integrations-openai-ai-server";
import type { Persona } from "./personas.js";

export type ProgressEvent = {
  type: "persona_started" | "persona_completed" | "persona_failed" | "run_completed" | "run_failed";
  personaKey?: string;
  personaName?: string;
  error?: string;
  aiQualityRating?: number;
  runId?: string;
};

type ProgressCallback = (event: ProgressEvent) => void;

async function evaluateReportQuality(
  personaDescription: string,
  personaData: Persona["assessmentData"],
  reportContent: {
    riskProfileSummary: string;
    topVulnerabilities: string[];
    actionPlan: { shortTerm: unknown[]; midTerm: unknown[]; longTerm: unknown[] };
  }
): Promise<{ rating: number; notes: string; observations: string[] }> {
  const prompt = `You are a UX evaluator assessing whether an AI-generated resilience report is relevant, clear, and appropriate for a specific user persona.

PERSONA: ${personaDescription}
USER PROFILE:
- Location: ${personaData.location}
- Income stability: ${personaData.incomeStability}
- Savings: ${personaData.savingsMonths} months
- Dependents: ${personaData.hasDependents}
- Skills: ${personaData.skills.join(", ")}
- Health: ${personaData.healthStatus}
- Mobility: ${personaData.mobilityLevel}
- Housing: ${personaData.housingType}
- Emergency supplies: ${personaData.hasEmergencySupplies}
- Psychological resilience: ${personaData.psychologicalResilience}/10
- Risk concerns: ${personaData.riskConcerns.join(", ")}

GENERATED REPORT:
Risk Profile Summary: ${reportContent.riskProfileSummary}
Top Vulnerabilities: ${reportContent.topVulnerabilities.join("; ")}
Short-term actions: ${(reportContent.actionPlan.shortTerm as { title: string }[]).map((a) => a.title).join("; ")}

Evaluate the report on a 1-5 scale (5=excellent, 1=poor) considering:
1. Relevance: Does the advice match the persona's actual situation?
2. Clarity: Is language appropriate and accessible?
3. Actionability: Are the recommendations realistic for this persona?
4. Empathy: Does it acknowledge the persona's specific constraints?

Respond with JSON: {"rating": <1-5>, "notes": "<2-3 sentence evaluation>", "observations": ["<observation 1>", "<observation 2>", "<observation 3>"]}

Return ONLY the JSON.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    max_completion_tokens: 512,
    messages: [
      { role: "system", content: "You are a UX evaluation expert. Always respond with valid JSON only." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No evaluation response from AI");
  return JSON.parse(content) as { rating: number; notes: string; observations: string[] };
}

async function generateCrossPersonaSummary(
  results: Array<{
    personaName: string;
    personaKey: string;
    aiQualityRating: number | null;
    aiQualityNotes: string | null;
    observations: unknown;
    scores: unknown;
  }>
): Promise<string> {
  const summaryInput = results
    .filter((r) => r.aiQualityRating != null)
    .map((r) => {
      const obs = Array.isArray(r.observations) ? (r.observations as string[]).join("; ") : "";
      return `${r.personaName}: Rating ${r.aiQualityRating}/5 — ${r.aiQualityNotes ?? ""} Observations: ${obs}`;
    })
    .join("\n\n");

  const prompt = `You are a UX research synthesizer. You've run AI-simulated UX tests on a resilience assessment tool with multiple personas. Here are the results:

${summaryInput}

Generate a cross-persona synthesis report with:
1. Common patterns (what issues appeared across multiple personas)
2. Persona-specific gaps (which personas were most/least well-served)
3. Top 3-5 recommended improvements with clear rationale
4. Overall UX health assessment

Format this as a clear, structured analysis that a product team can act on. Use markdown formatting with headers and bullet points. Include a "## Recommended Actions" section at the end with specific, actionable items numbered 1-N.

Limit to 600 words.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    max_completion_tokens: 1024,
    messages: [
      { role: "system", content: "You are a UX research expert synthesizing test results." },
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0]?.message?.content ?? "Unable to generate cross-persona summary.";
}

export async function runUxTestSimulation(
  runId: string,
  personas: Persona[],
  onProgress: ProgressCallback
): Promise<void> {
  const createdReportIds: string[] = [];

  try {
    for (const persona of personas) {
      onProgress({ type: "persona_started", personaKey: persona.key, personaName: persona.name });

      await db
        .update(uxTestResultsTable)
        .set({ status: "running" })
        .where(
          and(
            eq(uxTestResultsTable.runId, runId),
            eq(uxTestResultsTable.personaKey, persona.key)
          )
        );

      try {
        const input = persona.assessmentData;
        const scoreResult = calculateScores({
          location: input.location,
          incomeStability: input.incomeStability,
          savingsMonths: input.savingsMonths,
          hasDependents: input.hasDependents,
          skills: input.skills,
          healthStatus: input.healthStatus,
          mobilityLevel: input.mobilityLevel,
          housingType: input.housingType,
          hasEmergencySupplies: input.hasEmergencySupplies,
          psychologicalResilience: input.psychologicalResilience,
          riskConcerns: input.riskConcerns,
          mentalResilienceAnswers: input.mentalResilienceAnswers,
        });

        const { mentalResilienceSubScores, ...scores } = scoreResult;

        const reportContent = await generateResilienceReport(
          {
            location: input.location,
            incomeStability: input.incomeStability,
            savingsMonths: input.savingsMonths,
            hasDependents: input.hasDependents,
            skills: input.skills,
            healthStatus: input.healthStatus,
            mobilityLevel: input.mobilityLevel,
            housingType: input.housingType,
            hasEmergencySupplies: input.hasEmergencySupplies,
            psychologicalResilience: input.psychologicalResilience,
            riskConcerns: input.riskConcerns,
          },
          scores,
          mentalResilienceSubScores
        );

        const reportId = randomUUID();
        createdReportIds.push(reportId);

        await db.insert(resilienceReportsTable).values({
          reportId,
          sessionId: `ux-test-${runId}`,
          userId: null,
          location: input.location,
          incomeStability: input.incomeStability,
          savingsMonths: input.savingsMonths,
          hasDependents: input.hasDependents,
          skills: input.skills,
          healthStatus: input.healthStatus,
          mobilityLevel: input.mobilityLevel,
          housingType: input.housingType,
          hasEmergencySupplies: input.hasEmergencySupplies,
          psychologicalResilience: input.psychologicalResilience,
          riskConcerns: input.riskConcerns,
          mrStressTolerance: mentalResilienceSubScores?.stressTolerance ?? null,
          mrAdaptability: mentalResilienceSubScores?.adaptability ?? null,
          mrLearningAgility: mentalResilienceSubScores?.learningAgility ?? null,
          mrChangeManagement: mentalResilienceSubScores?.changeManagement ?? null,
          mrEmotionalRegulation: mentalResilienceSubScores?.emotionalRegulation ?? null,
          mrSocialSupport: mentalResilienceSubScores?.socialSupport ?? null,
          mrComposite: mentalResilienceSubScores?.composite ?? null,
          mrPathway: mentalResilienceSubScores?.pathway ?? null,
          scoreOverall: scores.overall,
          scoreFinancial: scores.financial,
          scoreHealth: scores.health,
          scoreSkills: scores.skills,
          scoreMobility: scores.mobility,
          scorePsychological: scores.psychological,
          scoreResources: scores.resources,
          riskProfileSummary: reportContent.riskProfileSummary,
          topVulnerabilities: reportContent.topVulnerabilities,
          actionPlan: reportContent.actionPlan,
          scenarioSimulations: reportContent.scenarioSimulations,
          dailyHabits: reportContent.dailyHabits,
          checklistsByArea: reportContent.checklistsByArea ?? null,
          createdAt: new Date(),
        });

        const evaluation = await evaluateReportQuality(
          persona.description,
          persona.assessmentData,
          reportContent
        );

        await db
          .update(uxTestResultsTable)
          .set({
            status: "completed",
            reportId,
            scores: scores as Record<string, number>,
            aiQualityRating: evaluation.rating,
            aiQualityNotes: evaluation.notes,
            observations: evaluation.observations,
            completedAt: new Date(),
          })
          .where(
            and(
              eq(uxTestResultsTable.runId, runId),
              eq(uxTestResultsTable.personaKey, persona.key)
            )
          );

        onProgress({
          type: "persona_completed",
          personaKey: persona.key,
          personaName: persona.name,
          aiQualityRating: evaluation.rating,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await db
          .update(uxTestResultsTable)
          .set({ status: "failed", error: errorMsg, completedAt: new Date() })
          .where(
            and(
              eq(uxTestResultsTable.runId, runId),
              eq(uxTestResultsTable.personaKey, persona.key)
            )
          );
        onProgress({ type: "persona_failed", personaKey: persona.key, personaName: persona.name, error: errorMsg });
      }
    }

    const allResults = await db
      .select()
      .from(uxTestResultsTable)
      .where(eq(uxTestResultsTable.runId, runId));

    const crossPersonaSummary = await generateCrossPersonaSummary(
      allResults.map((r) => ({
        personaName: r.personaName,
        personaKey: r.personaKey,
        aiQualityRating: r.aiQualityRating,
        aiQualityNotes: r.aiQualityNotes,
        observations: r.observations,
        scores: r.scores,
      }))
    );

    if (createdReportIds.length > 0) {
      await db
        .delete(resilienceReportsTable)
        .where(inArray(resilienceReportsTable.reportId, createdReportIds));
    }

    await db
      .update(uxTestRunsTable)
      .set({ status: "completed", completedAt: new Date(), crossPersonaSummary })
      .where(eq(uxTestRunsTable.runId, runId));

    onProgress({ type: "run_completed", runId });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // Clean up any reports created before the failure so they don't pollute the main reports table
    if (createdReportIds.length > 0) {
      try {
        await db
          .delete(resilienceReportsTable)
          .where(inArray(resilienceReportsTable.reportId, createdReportIds));
      } catch {
        // Best-effort cleanup — don't mask the original error
      }
    }

    await db
      .update(uxTestRunsTable)
      .set({ status: "failed", completedAt: new Date() })
      .where(eq(uxTestRunsTable.runId, runId));
    onProgress({ type: "run_failed", error: errorMsg, runId });
  }
}
