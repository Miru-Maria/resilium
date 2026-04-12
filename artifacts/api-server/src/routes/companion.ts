import { Router, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { db, conversations, messages, subscriptionsTable, resilienceReportsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger.js";

const router = Router();

function getUserId(req: Request): string | null {
  const auth = getAuth(req);
  return (auth?.sessionClaims?.userId as string | undefined) || auth?.userId || null;
}

async function checkIsPro(userId: string): Promise<boolean> {
  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .limit(1);
  if (!sub) return false;
  const isPro = sub.status === "active" || sub.status === "cancel_scheduled";
  const isExpired = sub.currentPeriodEnd ? sub.currentPeriodEnd < new Date() : false;
  return isPro && !isExpired;
}

async function getOrCreateConversation(userId: string): Promise<number> {
  const [existing] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .limit(1);
  if (existing) return existing.id;
  const [created] = await db
    .insert(conversations)
    .values({ userId, title: "My Resilience Companion" })
    .returning();
  return created.id;
}

const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  keyGenerator: (req) => {
    const auth = getAuth(req as Request);
    return (auth?.sessionClaims?.userId as string | undefined) || auth?.userId || "anon";
  },
  message: { error: "RATE_LIMITED", message: "Too many messages. Please wait a moment." },
});

router.get("/companion/history", async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const isPro = await checkIsPro(userId);
    if (!isPro) return res.status(403).json({ error: "Pro subscription required" });

    const conversationId = await getOrCreateConversation(userId);

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(50);

    return res.json({
      conversationId,
      messages: history.reverse().map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch companion history");
    return res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.post("/companion/chat", chatRateLimit, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { message } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required" });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: "Message too long (max 2000 characters)" });
  }

  try {
    const isPro = await checkIsPro(userId);
    if (!isPro) return res.status(403).json({ error: "Pro subscription required" });

    const conversationId = await getOrCreateConversation(userId);

    const [latestReport] = await db
      .select({
        location: resilienceReportsTable.location,
        scoreOverall: resilienceReportsTable.scoreOverall,
        scoreFinancial: resilienceReportsTable.scoreFinancial,
        scoreHealth: resilienceReportsTable.scoreHealth,
        scoreSkills: resilienceReportsTable.scoreSkills,
        scoreMobility: resilienceReportsTable.scoreMobility,
        scorePsychological: resilienceReportsTable.scorePsychological,
        scoreResources: resilienceReportsTable.scoreResources,
        riskConcerns: resilienceReportsTable.riskConcerns,
        incomeStability: resilienceReportsTable.incomeStability,
        savingsMonths: resilienceReportsTable.savingsMonths,
        healthStatus: resilienceReportsTable.healthStatus,
        primaryGoal: resilienceReportsTable.primaryGoal,
      })
      .from(resilienceReportsTable)
      .where(eq(resilienceReportsTable.userId, userId))
      .orderBy(desc(resilienceReportsTable.createdAt))
      .limit(1);

    let userContext = "This user has not yet completed a Resilium assessment.";
    if (latestReport) {
      const riskList = Array.isArray(latestReport.riskConcerns)
        ? (latestReport.riskConcerns as string[]).join(", ")
        : String(latestReport.riskConcerns || "unknown");

      userContext = `The user's latest Resilium resilience assessment shows:
- Location: ${latestReport.location}
- Overall Resilience Score: ${Math.round(latestReport.scoreOverall)}/100
- Financial: ${Math.round(latestReport.scoreFinancial ?? 0)}/100
- Health: ${Math.round(latestReport.scoreHealth ?? 0)}/100
- Skills: ${Math.round(latestReport.scoreSkills ?? 0)}/100
- Mobility: ${Math.round(latestReport.scoreMobility ?? 0)}/100
- Psychological: ${Math.round(latestReport.scorePsychological ?? 0)}/100
- Emergency Resources: ${Math.round(latestReport.scoreResources ?? 0)}/100
- Income stability: ${latestReport.incomeStability}
- Savings runway: ${latestReport.savingsMonths} months
- Health status: ${latestReport.healthStatus}
- Primary risk concerns: ${riskList}
${latestReport.primaryGoal ? `- Primary goal: ${latestReport.primaryGoal}` : ""}

Use this data to provide specific, personalized guidance. Reference their actual scores when relevant.`;
    }

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(20);

    const priorMessages = history.reverse().map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    await db.insert(messages).values({
      conversationId,
      role: "user",
      content: message.trim(),
    });

    const systemPrompt = `You are the Resilium AI Companion — a warm, expert resilience coach embedded in the Resilium personal resilience platform. Your role is to provide personalized guidance, practical advice, and genuine motivation to help users prepare for and survive any crisis.

${userContext}

Your approach:
- Be specific and practical — never generic. Use the user's actual scores and situation.
- Cover four domains: planning (what to do), resources (what to acquire/build), help (who and where to turn to), and motivation (keeping going when it's hard).
- Be honest without being alarmist. Name gaps clearly but frame them as solvable.
- Reference real resources, organizations, and strategies appropriate to the user's location and situation.
- Keep responses focused and actionable — aim for 150–300 words unless the question requires more depth.
- You can discuss crisis scenarios, emotional resilience, practical skills, financial preparedness, community building, and survival psychology.
- You are not a therapist or financial advisor — recommend professional help when the situation clearly calls for it.
- American English spelling.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...priorMessages,
        { role: "user", content: message.trim() },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const aiContent = completion.choices[0]?.message?.content ?? "I'm sorry, I wasn't able to generate a response. Please try again.";

    await db.insert(messages).values({
      conversationId,
      role: "assistant",
      content: aiContent,
    });

    return res.json({
      message: {
        role: "assistant",
        content: aiContent,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    logger.error({ err }, "Companion chat error");
    return res.status(500).json({ error: "Failed to process message" });
  }
});

export default router;
