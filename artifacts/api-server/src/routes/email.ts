import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyUnsubscribeToken } from "../lib/unsubscribe.js";

const router: IRouter = Router();

const APP_URL = process.env["APP_URL"] ?? "https://resilium-platform.com";

router.get("/email/unsubscribe", async (req: Request, res: Response) => {
  const { uid, sig } = req.query as { uid?: string; sig?: string };

  if (!uid || !sig) {
    res.status(400).send(unsubscribePage("Invalid link", "The unsubscribe link is missing required parameters. Please contact hello@resilium-platform.com to be removed.", false));
    return;
  }

  if (!verifyUnsubscribeToken(uid, sig)) {
    res.status(400).send(unsubscribePage("Invalid link", "This unsubscribe link is invalid or has expired. Please contact hello@resilium-platform.com to be removed.", false));
    return;
  }

  try {
    await db
      .update(usersTable)
      .set({ emailOptOut: true, emailOptOutAt: new Date() })
      .where(eq(usersTable.id, uid));

    res.send(unsubscribePage("You've been unsubscribed", "You will no longer receive weekly check-ins or reminders from Resilium. You can re-enable emails at any time from your account settings.", true));
  } catch {
    res.status(500).send(unsubscribePage("Something went wrong", "We couldn't process your request. Please contact hello@resilium-platform.com to be removed.", false));
  }
});

router.post("/email/resubscribe", async (req: Request, res: Response) => {
  const { uid, sig } = req.body as { uid?: string; sig?: string };

  if (!uid || !sig || !verifyUnsubscribeToken(uid, sig)) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  try {
    await db
      .update(usersTable)
      .set({ emailOptOut: false, emailOptOutAt: null })
      .where(eq(usersTable.id, uid));

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to resubscribe" });
  }
});

function unsubscribePage(title: string, message: string, success: boolean): string {
  const icon = success ? "✓" : "✗";
  const color = success ? "#22d3ee" : "#ef4444";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Resilium</title></head><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;display:flex;align-items:center;justify-content:center;min-height:100vh;"><div style="max-width:480px;width:100%;padding:40px 24px;text-align:center;"><div style="width:64px;height:64px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 24px;color:${color}">${icon}</div><h1 style="color:#E08040;font-size:22px;font-weight:800;margin:0 0 12px;">Resilium</h1><h2 style="color:#EAD9BE;font-size:18px;font-weight:600;margin:0 0 16px;">${title}</h2><p style="color:#b8a99a;font-size:15px;line-height:1.6;margin:0 0 32px;">${message}</p><a href="${APP_URL}" style="display:inline-block;background:#E08040;color:#0D1225;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Back to Resilium</a></div></body></html>`;
}

export default router;
