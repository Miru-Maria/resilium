import { Router, type IRouter } from "express";
import { getAuth, createClerkClient } from "@clerk/express";
import { db, referralCodesTable, referralUsesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { randomBytes } from "crypto";

const router: IRouter = Router();

const APP_URL = process.env["APP_URL"] ?? "https://resilium-platform.com";

function generateCode(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

router.get("/my-code", async (req, res) => {
  try {
    const auth = getAuth(req);
    const userId = (auth?.sessionClaims?.userId as string | undefined) || auth?.userId;
    if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

    const existing = await db
      .select()
      .from(referralCodesTable)
      .where(eq(referralCodesTable.userId, userId))
      .limit(1);

    if (existing[0]) {
      const code = existing[0].code;
      res.json({ code, referralUrl: `${APP_URL}?ref=${code}` });
      return;
    }

    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      try {
        await db.insert(referralCodesTable).values({ userId, code });
        break;
      } catch {
        code = generateCode();
        attempts++;
      }
    }

    res.json({ code, referralUrl: `${APP_URL}?ref=${code}` });
  } catch (err) {
    logger.error({ err }, "Error getting referral code");
    res.status(500).json({ error: "Failed to get referral code" });
  }
});

router.post("/claim", async (req, res) => {
  try {
    const auth = getAuth(req);
    const referredUserId = (auth?.sessionClaims?.userId as string | undefined) || auth?.userId;
    if (!referredUserId) { res.status(401).json({ error: "Not authenticated" }); return; }

    const { code } = req.body as { code?: string };
    if (!code) { res.status(400).json({ error: "code required" }); return; }

    const referralCode = await db
      .select()
      .from(referralCodesTable)
      .where(eq(referralCodesTable.code, code.toUpperCase().trim()))
      .limit(1);

    if (!referralCode[0]) {
      res.status(404).json({ error: "Invalid referral code" });
      return;
    }

    if (referralCode[0].userId === referredUserId) {
      res.status(400).json({ error: "Cannot refer yourself" });
      return;
    }

    const alreadyClaimed = await db
      .select()
      .from(referralUsesTable)
      .where(eq(referralUsesTable.referredId, referredUserId))
      .limit(1);

    if (alreadyClaimed[0]) {
      res.json({ success: true, alreadyClaimed: true });
      return;
    }

    await db.insert(referralUsesTable).values({
      code: code.toUpperCase().trim(),
      referrerId: referralCode[0].userId,
      referredId: referredUserId,
    }).onConflictDoNothing();

    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Error claiming referral");
    res.status(500).json({ error: "Failed to claim referral" });
  }
});

export default router;
