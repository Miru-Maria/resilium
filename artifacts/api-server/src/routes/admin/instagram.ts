import { Router, type IRouter } from "express";
import { requireAdminSession } from "../../middlewares/adminAuth.js";
import { logger } from "../../lib/logger.js";

const router: IRouter = Router();
router.use(requireAdminSession);

const IG_API = "https://graph.facebook.com/v19.0";

function getConfig(): { token: string; accountId: string } | null {
  const token = process.env["INSTAGRAM_ACCESS_TOKEN"];
  const accountId = process.env["INSTAGRAM_BUSINESS_ACCOUNT_ID"];
  if (!token || !accountId) return null;
  return { token, accountId };
}

router.get("/status", (_req, res) => {
  const cfg = getConfig();
  res.json({ configured: !!cfg });
});

router.post("/generate-caption", async (req, res) => {
  const { topic, pillar } = req.body as { topic?: string; pillar?: string };
  try {
    const { openai } = await import("@workspace/integrations-openai-ai-server");
    const { MINI_MODEL } = await import("../../lib/models.js");

    const prompt = `Write an engaging Instagram caption for Resilium, a personal resilience platform (resilium-platform.com).

Topic: ${topic ?? "personal resilience and preparedness"}
Pillar: ${pillar ?? "general resilience"}

Requirements:
- 150–250 characters for the main text
- Conversational, empowering, non-salesy tone — sound like a knowledgeable founder sharing genuine insight
- End with a reflective question or a gentle call to action
- Add 5–8 relevant hashtags on a new line
- Do NOT use generic phrases like "embark on a journey" or "unlock your potential"

Return ONLY the caption text (including hashtags), no extra commentary.`;

    const completion = await openai.chat.completions.create({
      model: MINI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 400,
    });

    const caption = completion.choices[0]?.message?.content?.trim() ?? "";
    res.json({ caption });
  } catch (err) {
    logger.error({ err }, "Instagram caption generation failed");
    res.status(500).json({ error: "Caption generation failed" });
  }
});

router.post("/post", async (req, res) => {
  const cfg = getConfig();
  if (!cfg) {
    res.status(503).json({
      error: "Instagram is not configured. Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID to your secrets.",
    });
    return;
  }

  const { caption, imageUrl } = req.body as { caption?: string; imageUrl?: string };
  if (!imageUrl?.trim()) {
    res.status(400).json({ error: "imageUrl is required — Instagram feed posts must include an image." });
    return;
  }

  try {
    const containerParams = new URLSearchParams({
      image_url: imageUrl.trim(),
      caption: caption?.trim() ?? "",
      access_token: cfg.token,
    });
    const containerRes = await fetch(`${IG_API}/${cfg.accountId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: containerParams.toString(),
      signal: AbortSignal.timeout(15000),
    });
    const containerData = await containerRes.json() as { id?: string; error?: { message: string; code: number } };

    if (!containerData.id) {
      logger.error({ containerData }, "Instagram media container creation failed");
      res.status(502).json({ error: containerData.error?.message ?? "Failed to create media container" });
      return;
    }

    // Small delay before publishing (Meta recommends it)
    await new Promise(r => setTimeout(r, 1500));

    const publishParams = new URLSearchParams({
      creation_id: containerData.id,
      access_token: cfg.token,
    });
    const publishRes = await fetch(`${IG_API}/${cfg.accountId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: publishParams.toString(),
      signal: AbortSignal.timeout(15000),
    });
    const publishData = await publishRes.json() as { id?: string; error?: { message: string; code: number } };

    if (!publishData.id) {
      logger.error({ publishData }, "Instagram publish failed");
      res.status(502).json({ error: publishData.error?.message ?? "Failed to publish post" });
      return;
    }

    logger.info({ mediaId: publishData.id }, "Instagram post published successfully");
    res.json({ success: true, mediaId: publishData.id });
  } catch (err) {
    logger.error({ err }, "Instagram post failed");
    res.status(500).json({ error: "Post failed — check server logs." });
  }
});

export default router;
