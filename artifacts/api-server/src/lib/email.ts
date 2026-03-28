import { Resend } from "resend";

const resend = process.env["RESEND_API_KEY"]
  ? new Resend(process.env["RESEND_API_KEY"])
  : null;

// TODO: update to "Resilium <hello@resilium.app>" once domain is verified in Resend
const FROM = process.env["RESEND_FROM"] ?? "Resilium <onboarding@resend.dev>";
const ADMIN_TO = process.env["ADMIN_EMAIL"] ?? "contact_resilium@pm.me";
const APP_URL = process.env["APP_URL"] ?? "https://resilium.app";

async function send(opts: { to: string; subject: string; html: string; text: string }): Promise<void> {
  if (!resend) {
    console.warn(`[Email] RESEND_API_KEY not set — would have sent "${opts.subject}" to ${opts.to}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
    if (error) console.error("[Email] Resend error:", error);
    else console.info(`[Email] Sent "${opts.subject}" to ${opts.to}`);
  } catch (err) {
    console.error("[Email] Failed to send:", err);
  }
}

// ─── Welcome Email ───────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: { email: string; firstName?: string | null }) {
  if (!opts.email) return;
  const name = opts.firstName ?? "there";
  await send({
    to: opts.email,
    subject: "Welcome to Resilium — your resilience journey starts now",
    text: `Hi ${name},\n\nWelcome to Resilium. You've taken the first step toward understanding and improving your personal resilience.\n\nYour free assessment covers four dimensions: Financial, Physical, Skills, and Mental Resilience. You'll get a score out of 100, plain-English interpretation, and a personalised action plan.\n\nTake your first assessment:\n${APP_URL}\n\nIf you have questions, just reply to this email.\n\n— The Resilium Team`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#E08040;padding:24px 32px;"><h1 style="margin:0;color:#0D1225;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Resilium</h1></td></tr><tr><td style="padding:32px;"><h2 style="margin:0 0 16px;color:#EAD9BE;font-size:20px;font-weight:700;">Welcome, ${name} 👋</h2><p style="margin:0 0 16px;color:#b8a99a;line-height:1.6;">You've taken the first step toward understanding and strengthening your personal resilience — your ability to withstand and recover from life's disruptions.</p><p style="margin:0 0 12px;color:#b8a99a;line-height:1.6;">Your free assessment covers:</p><p style="margin:0 0 4px;color:#EAD9BE;font-size:14px;">💰 Financial Resilience &nbsp;&nbsp; 🏥 Physical Resilience</p><p style="margin:0 0 24px;color:#EAD9BE;font-size:14px;">🛠 Skills Resilience &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🧠 Mental Resilience</p><a href="${APP_URL}" style="display:inline-block;background:#E08040;color:#0D1225;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">Take Your Assessment →</a><p style="margin:32px 0 0;color:#7a6a5a;font-size:13px;line-height:1.6;">Questions? Reply to this email and we'll get back to you.<br>— The Resilium Team</p></td></tr></table></td></tr></table></body></html>`,
  });
}

// ─── Pro Upgrade Email ────────────────────────────────────────────────────────

export async function sendProUpgradeEmail(opts: { email: string; firstName?: string | null; periodEnd?: Date | null }) {
  if (!opts.email) return;
  const name = opts.firstName ?? "there";
  const renewal = opts.periodEnd
    ? opts.periodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "your next billing date";
  await send({
    to: opts.email,
    subject: "You're now Resilium Pro — here's what you unlocked ⚡",
    text: `Hi ${name},\n\nYour Pro subscription is active. Here's what you've unlocked:\n\n• AI Plan — a GPT-powered 90-day action roadmap personalised to your score\n• Scenario Stress-Tests — model job loss, health crisis, relocation, and natural disaster\n• Unlimited saved plans and history\n• Priority re-assessment reminders and trend tracking\n\nYour next billing date is ${renewal}.\n\nGet started: ${APP_URL}\n\n— The Resilium Team`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#E08040;padding:24px 32px;"><h1 style="margin:0;color:#0D1225;font-size:22px;font-weight:800;">Resilium <span style="background:#0D1225;color:#E08040;font-size:11px;padding:2px 8px;border-radius:6px;font-weight:700;margin-left:8px;vertical-align:middle;">PRO</span></h1></td></tr><tr><td style="padding:32px;"><h2 style="margin:0 0 8px;color:#EAD9BE;font-size:20px;font-weight:700;">You're Pro now, ${name} ⚡</h2><p style="margin:0 0 24px;color:#b8a99a;line-height:1.6;">Your subscription is active. Here's everything you've unlocked:</p><table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;"><tr><td style="padding:12px;background:#1a2235;border-radius:8px;"><strong style="color:#E08040;display:block;margin-bottom:4px;">⚡ AI Plan</strong><span style="color:#b8a99a;font-size:13px;">GPT-powered 90-day action roadmap personalised to your score</span></td></tr><tr><td style="height:6px;"></td></tr><tr><td style="padding:12px;background:#1a2235;border-radius:8px;"><strong style="color:#E08040;display:block;margin-bottom:4px;">🔮 Scenario Stress-Tests</strong><span style="color:#b8a99a;font-size:13px;">Model job loss, health crisis, relocation and natural disaster</span></td></tr><tr><td style="height:6px;"></td></tr><tr><td style="padding:12px;background:#1a2235;border-radius:8px;"><strong style="color:#E08040;display:block;margin-bottom:4px;">📋 Unlimited Plans</strong><span style="color:#b8a99a;font-size:13px;">Save and compare unlimited resilience snapshots over time</span></td></tr></table><p style="margin:0 0 24px;color:#b8a99a;font-size:13px;">Your next billing date is <strong style="color:#EAD9BE;">${renewal}</strong>.</p><a href="${APP_URL}" style="display:inline-block;background:#E08040;color:#0D1225;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">Open Resilium →</a><p style="margin:32px 0 0;color:#7a6a5a;font-size:13px;">Questions? Reply to this email.<br>— The Resilium Team</p></td></tr></table></td></tr></table></body></html>`,
  });
}

// ─── GDPR Notification ────────────────────────────────────────────────────────

export async function sendGdprRequestNotification(opts: { type: "deletion" | "export"; sessionId: string }) {
  const subject = opts.type === "deletion"
    ? `[Resilium] GDPR Deletion Request — ${opts.sessionId.slice(0, 8)}`
    : `[Resilium] GDPR Export Request — ${opts.sessionId.slice(0, 8)}`;
  const text = `A new GDPR ${opts.type} request was submitted.\n\nSession ID: ${opts.sessionId}\nType: ${opts.type}\nReceived: ${new Date().toISOString()}\n\nLog in to the admin panel to ${opts.type === "deletion" ? "fulfill the deletion" : "review the export"}.\n\nNote: Deletion requests must be fulfilled within 30 days under GDPR.`;
  await send({ to: ADMIN_TO, subject, text, html: `<pre style="font-family:monospace;font-size:13px;padding:24px;">${text}</pre>` });
}

// ─── Weekly Admin Digest ──────────────────────────────────────────────────────

export async function sendAdminDigest(stats: {
  totalReports: number;
  newReportsThisWeek: number;
  avgScore: number;
  newProSubscribers: number;
  totalFeedback: number;
  avgRating: number;
  errorCount: number;
}) {
  const statusIcon = stats.errorCount > 10 ? "🔴" : stats.errorCount > 3 ? "🟡" : "🟢";
  const text = `Resilium — Weekly Admin Digest\nGenerated: ${new Date().toUTCString()}\n\n📊 Reports\n  • Total all time: ${stats.totalReports}\n  • New this week:  ${stats.newReportsThisWeek}\n  • Avg score:      ${stats.avgScore}/100\n\n💳 Subscriptions\n  • New Pro this week: ${stats.newProSubscribers}\n\n⭐ Feedback\n  • Total ratings: ${stats.totalFeedback}\n  • Avg rating:    ${stats.avgRating}/5\n\n${statusIcon} Health\n  • 5xx errors this week: ${stats.errorCount}\n  ${stats.errorCount > 10 ? "⚠️  Error rate elevated — investigate API logs." : "All clear."}\n\nView dashboard: ${APP_URL}/admin`;
  await send({
    to: ADMIN_TO,
    subject: `${statusIcon} Resilium Weekly — ${stats.newReportsThisWeek} new reports, ${stats.newProSubscribers} new Pro`,
    text,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#1a2235;border-bottom:1px solid #2a3245;padding:20px 32px;"><h1 style="margin:0;color:#E08040;font-size:18px;font-weight:800;display:inline;">Resilium Admin</h1><span style="color:#7a6a5a;font-size:12px;margin-left:12px;">Weekly Digest · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></td></tr><tr><td style="padding:32px;"><table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;"><tr><td style="text-align:center;padding:0 6px;"><div style="background:#1a2235;border-radius:10px;padding:16px 8px;"><span style="color:#E08040;font-size:24px;font-weight:800;">${stats.newReportsThisWeek}</span><br><span style="color:#7a6a5a;font-size:11px;margin-top:4px;display:block;">New Reports</span></div></td><td style="text-align:center;padding:0 6px;"><div style="background:#1a2235;border-radius:10px;padding:16px 8px;"><span style="color:#6366f1;font-size:24px;font-weight:800;">${stats.newProSubscribers}</span><br><span style="color:#7a6a5a;font-size:11px;margin-top:4px;display:block;">New Pro</span></div></td><td style="text-align:center;padding:0 6px;"><div style="background:#1a2235;border-radius:10px;padding:16px 8px;"><span style="color:#22d3ee;font-size:24px;font-weight:800;">${stats.avgScore}/100</span><br><span style="color:#7a6a5a;font-size:11px;margin-top:4px;display:block;">Avg Score</span></div></td><td style="text-align:center;padding:0 6px;"><div style="background:#1a2235;border-radius:10px;padding:16px 8px;"><span style="color:#f59e0b;font-size:24px;font-weight:800;">${stats.avgRating}/5</span><br><span style="color:#7a6a5a;font-size:11px;margin-top:4px;display:block;">Avg Rating</span></div></td></tr></table><div style="padding:14px 16px;background:${stats.errorCount > 10 ? "#3a1515" : "#1a2235"};border-radius:10px;border:1px solid ${stats.errorCount > 10 ? "#D74242" : "#2a3245"};margin-bottom:24px;font-size:14px;">${statusIcon} <strong>API Health:</strong> ${stats.errorCount} server errors this week${stats.errorCount > 10 ? " — elevated, investigate logs" : " — all clear"}</div><a href="${APP_URL}/admin" style="display:inline-block;background:#E08040;color:#0D1225;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">Open Admin Dashboard →</a></td></tr></table></td></tr></table></body></html>`,
  });
}

// ─── Error Alert ──────────────────────────────────────────────────────────────

export async function sendErrorAlert(opts: { errorCount: number; recentErrors: string[] }) {
  const subject = `🔴 Resilium — ${opts.errorCount} server errors in the last 10 minutes`;
  const text = `Error rate alert triggered.\n\nErrors in last 10 min: ${opts.errorCount}\n\nRecent errors:\n${opts.recentErrors.slice(0, 5).join("\n")}\n\nInvestigate: ${APP_URL}/admin`;
  await send({ to: ADMIN_TO, subject, text, html: `<pre style="font-family:monospace;font-size:13px;padding:24px;">${text}</pre>` });
}
