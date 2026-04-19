import { Resend } from "resend";
import { buildListUnsubscribeHeader, buildUnsubscribeUrl } from "./unsubscribe.js";

const resend = process.env["RESEND_API_KEY"]
  ? new Resend(process.env["RESEND_API_KEY"])
  : null;

const FROM = process.env["RESEND_FROM"] ?? "Resilium <hello@resilium-platform.com>";
const ADMIN_TO = process.env["ADMIN_EMAIL"] ?? "contact_resilium@pm.me";
const APP_URL = process.env["APP_URL"] ?? "https://resilium-platform.com";

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}): Promise<void> {
  if (!resend) {
    console.warn(`[Email] RESEND_API_KEY not set — would have sent "${opts.subject}" to ${opts.to}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      headers: opts.headers,
    });
    if (error) console.error("[Email] Resend error:", error);
    else console.info(`[Email] Sent "${opts.subject}" to ${opts.to}`);
  } catch (err) {
    console.error("[Email] Failed to send:", err);
  }
}

function unsubscribeFooterHtml(userId: string): string {
  const url = buildUnsubscribeUrl(userId);
  return `<p style="margin:24px 0 0;color:#5a4a3a;font-size:11px;line-height:1.6;text-align:center;">You're receiving this because you have a Resilium account.<br><a href="${url}" style="color:#7a6a5a;text-decoration:underline;">Unsubscribe from emails</a> · <a href="${APP_URL}/privacy" style="color:#7a6a5a;text-decoration:underline;">Privacy Policy</a></p>`;
}

function unsubscribeFooterText(userId: string): string {
  const url = buildUnsubscribeUrl(userId);
  return `\n\nTo unsubscribe from all Resilium emails, visit:\n${url}`;
}

// ─── Welcome Email ───────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: { email: string; firstName?: string | null; userId?: string }) {
  if (!opts.email) return;
  const name = opts.firstName ?? "there";
  const unsubHtml = opts.userId ? unsubscribeFooterHtml(opts.userId) : "";
  const unsubText = opts.userId ? unsubscribeFooterText(opts.userId) : "";
  const listHeader = opts.userId ? { "List-Unsubscribe": buildListUnsubscribeHeader(opts.userId), "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined;
  await send({
    to: opts.email,
    subject: "Welcome to Resilium — your resilience journey starts now",
    text: `Hi ${name},\n\nWelcome to Resilium. You've taken the first step toward understanding and improving your personal resilience.\n\nYour free assessment covers seven dimensions: Financial, Health, Skills, Mobility, Emergency Resources, Mental Resilience, and Social Capital. You'll get a score out of 100, plain-English interpretation, and a personalized action plan.\n\nTake your first assessment:\n${APP_URL}\n\nIf anything feels off, just reply to this email.\n\n— Cristiana at Resilium${unsubText}`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#E08040;padding:24px 32px;"><h1 style="margin:0;color:#0D1225;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Resilium</h1></td></tr><tr><td style="padding:32px;"><h2 style="margin:0 0 16px;color:#EAD9BE;font-size:20px;font-weight:700;">Welcome, ${name} 👋</h2><p style="margin:0 0 16px;color:#b8a99a;line-height:1.6;">You've taken the first step toward understanding and strengthening your personal resilience — your ability to withstand and recover from life's disruptions.</p><p style="margin:0 0 12px;color:#b8a99a;line-height:1.6;">Your free assessment covers seven dimensions:</p><p style="margin:0 0 4px;color:#EAD9BE;font-size:14px;">💰 Financial &nbsp;&nbsp; 🏥 Health &nbsp;&nbsp; 🛠 Skills &nbsp;&nbsp; 🚗 Mobility</p><p style="margin:0 0 24px;color:#EAD9BE;font-size:14px;">🏠 Housing &nbsp;&nbsp; 🧠 Mental Resilience &nbsp;&nbsp; 🤝 Social Capital</p><a href="${APP_URL}" style="display:inline-block;background:#E08040;color:#0D1225;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">Take Your Assessment →</a><p style="margin:32px 0 0;color:#7a6a5a;font-size:13px;line-height:1.6;">If anything feels off, just reply to this email.<br>— Cristiana at Resilium</p>${unsubHtml}</td></tr></table></td></tr></table></body></html>`,
    headers: listHeader,
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
    text: `Hi ${name},\n\nYour Pro subscription is active. Here's what you've unlocked:\n\n• AI Plan — a GPT-powered 90-day action roadmap personalized to your score\n• Scenario Stress-Tests — model job loss, health crisis, relocation, and natural disaster\n• Unlimited saved plans and history\n• Priority re-assessment reminders and trend tracking\n\nYour next billing date is ${renewal}.\n\nGet started: ${APP_URL}\n\n— Cristiana at Resilium`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#E08040;padding:24px 32px;"><h1 style="margin:0;color:#0D1225;font-size:22px;font-weight:800;">Resilium <span style="background:#0D1225;color:#E08040;font-size:11px;padding:2px 8px;border-radius:6px;font-weight:700;margin-left:8px;vertical-align:middle;">PRO</span></h1></td></tr><tr><td style="padding:32px;"><h2 style="margin:0 0 8px;color:#EAD9BE;font-size:20px;font-weight:700;">You're Pro now, ${name} ⚡</h2><p style="margin:0 0 24px;color:#b8a99a;line-height:1.6;">Your subscription is active. Here's everything you've unlocked:</p><table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;"><tr><td style="padding:12px;background:#1a2235;border-radius:8px;"><strong style="color:#E08040;display:block;margin-bottom:4px;">⚡ AI Plan</strong><span style="color:#b8a99a;font-size:13px;">GPT-powered 90-day action roadmap personalized to your score</span></td></tr><tr><td style="height:6px;"></td></tr><tr><td style="padding:12px;background:#1a2235;border-radius:8px;"><strong style="color:#E08040;display:block;margin-bottom:4px;">🔮 Scenario Stress-Tests</strong><span style="color:#b8a99a;font-size:13px;">Model job loss, health crisis, relocation and natural disaster</span></td></tr><tr><td style="height:6px;"></td></tr><tr><td style="padding:12px;background:#1a2235;border-radius:8px;"><strong style="color:#E08040;display:block;margin-bottom:4px;">📋 Unlimited Plans</strong><span style="color:#b8a99a;font-size:13px;">Save and compare unlimited resilience snapshots over time</span></td></tr></table><p style="margin:0 0 24px;color:#b8a99a;font-size:13px;">Your next billing date is <strong style="color:#EAD9BE;">${renewal}</strong>.</p><a href="${APP_URL}" style="display:inline-block;background:#E08040;color:#0D1225;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">Open Resilium →</a><p style="margin:32px 0 0;color:#7a6a5a;font-size:13px;">Questions? Reply to this email.<br>— Cristiana at Resilium</p></td></tr></table></td></tr></table></body></html>`,
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
  coachingClicks?: number;
}) {
  const statusIcon = stats.errorCount > 10 ? "🔴" : stats.errorCount > 3 ? "🟡" : "🟢";
  const coachingLine = stats.coachingClicks != null ? `\n\n🔗 Coaching\n  • Coaching clicks this week: ${stats.coachingClicks}` : "";
  const text = `Resilium — Weekly Admin Digest\nGenerated: ${new Date().toUTCString()}\n\n📊 Reports\n  • Total all time: ${stats.totalReports}\n  • New this week:  ${stats.newReportsThisWeek}\n  • Avg score:      ${stats.avgScore}/100\n\n💳 Subscriptions\n  • New Pro this week: ${stats.newProSubscribers}\n\n⭐ Feedback\n  • Total ratings: ${stats.totalFeedback}\n  • Avg rating:    ${stats.avgRating}/5${coachingLine}\n\n${statusIcon} Health\n  • 5xx errors this week: ${stats.errorCount}\n  ${stats.errorCount > 10 ? "⚠️  Error rate elevated — investigate API logs." : "All clear."}\n\nView dashboard: ${APP_URL}/admin`;
  await send({
    to: ADMIN_TO,
    subject: `${statusIcon} Resilium Weekly — ${stats.newReportsThisWeek} new reports, ${stats.newProSubscribers} new Pro`,
    text,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#1a2235;border-bottom:1px solid #2a3245;padding:20px 32px;"><h1 style="margin:0;color:#E08040;font-size:18px;font-weight:800;display:inline;">Resilium Admin</h1><span style="color:#7a6a5a;font-size:12px;margin-left:12px;">Weekly Digest · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></td></tr><tr><td style="padding:32px;"><table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;"><tr><td style="text-align:center;padding:0 6px;"><div style="background:#1a2235;border-radius:10px;padding:16px 8px;"><span style="color:#E08040;font-size:24px;font-weight:800;">${stats.newReportsThisWeek}</span><br><span style="color:#7a6a5a;font-size:11px;margin-top:4px;display:block;">New Reports</span></div></td><td style="text-align:center;padding:0 6px;"><div style="background:#1a2235;border-radius:10px;padding:16px 8px;"><span style="color:#6366f1;font-size:24px;font-weight:800;">${stats.newProSubscribers}</span><br><span style="color:#7a6a5a;font-size:11px;margin-top:4px;display:block;">New Pro</span></div></td><td style="text-align:center;padding:0 6px;"><div style="background:#1a2235;border-radius:10px;padding:16px 8px;"><span style="color:#22d3ee;font-size:24px;font-weight:800;">${stats.avgScore}/100</span><br><span style="color:#7a6a5a;font-size:11px;margin-top:4px;display:block;">Avg Score</span></div></td><td style="text-align:center;padding:0 6px;"><div style="background:#1a2235;border-radius:10px;padding:16px 8px;"><span style="color:#f59e0b;font-size:24px;font-weight:800;">${stats.avgRating}/5</span><br><span style="color:#7a6a5a;font-size:11px;margin-top:4px;display:block;">Avg Rating</span></div></td></tr></table><div style="padding:14px 16px;background:${stats.errorCount > 10 ? "#3a1515" : "#1a2235"};border-radius:10px;border:1px solid ${stats.errorCount > 10 ? "#D74242" : "#2a3245"};margin-bottom:24px;font-size:14px;">${statusIcon} <strong>API Health:</strong> ${stats.errorCount} server errors this week${stats.errorCount > 10 ? " — elevated, investigate logs" : " — all clear"}</div><a href="${APP_URL}/admin" style="display:inline-block;background:#E08040;color:#0D1225;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">Open Admin Dashboard →</a></td></tr></table></td></tr></table></body></html>`,
  });
}

// ─── Re-assessment Reminder ───────────────────────────────────────────────────

export async function sendReassessmentReminder(opts: { email: string; firstName?: string | null; lastScore: number; daysSince: number; userId?: string }) {
  if (!opts.email) return;
  const name = opts.firstName ?? "there";
  const scoreLabel = opts.lastScore >= 70 ? "strong" : opts.lastScore >= 40 ? "fair" : "low";
  const unsubHtml = opts.userId ? unsubscribeFooterHtml(opts.userId) : "";
  const unsubText = opts.userId ? unsubscribeFooterText(opts.userId) : "\n\nIf you'd prefer not to receive these reminders, just reply and I'll remove you.";
  const listHeader = opts.userId ? { "List-Unsubscribe": buildListUnsubscribeHeader(opts.userId), "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined;
  await send({
    to: opts.email,
    subject: `${name}, it's been ${opts.daysSince} days — time to check your resilience score`,
    text: `Hi ${name},\n\nIt's been about ${opts.daysSince} days since your last Resilium assessment. A lot can change in a month — your financial runway, health habits, skills, and circumstances.\n\nYour last overall score was ${opts.lastScore}/100 (${scoreLabel}). A new assessment takes under 5 minutes and will reflect where you actually stand today.\n\nRetake your assessment: ${APP_URL}/assess\n\n— Cristiana at Resilium${unsubText}`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#E08040;padding:24px 32px;"><h1 style="margin:0;color:#0D1225;font-size:22px;font-weight:800;">Resilium</h1></td></tr><tr><td style="padding:32px;"><h2 style="margin:0 0 16px;color:#EAD9BE;font-size:20px;font-weight:700;">Time to check in, ${name}</h2><p style="margin:0 0 16px;color:#b8a99a;line-height:1.6;">It's been about <strong style="color:#EAD9BE;">${opts.daysSince} days</strong> since your last assessment. A lot can change in a month — your finances, circumstances, and readiness evolve constantly.</p><div style="background:#1a2235;border-radius:10px;padding:16px 20px;margin:0 0 24px;display:inline-block;"><span style="color:#8A7A6A;font-size:12px;display:block;margin-bottom:4px;">Your last overall score</span><span style="color:#E08040;font-size:32px;font-weight:800;">${opts.lastScore}/100</span><span style="color:#8A7A6A;font-size:13px;margin-left:8px;">${scoreLabel}</span></div><p style="margin:0 0 24px;color:#b8a99a;line-height:1.6;">A new assessment takes under 5 minutes and will show exactly where you stand today.</p><a href="${APP_URL}/assess" style="display:inline-block;background:#E08040;color:#0D1225;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">Retake Your Assessment →</a><p style="margin:32px 0 0;color:#7a6a5a;font-size:12px;line-height:1.6;">— Cristiana at Resilium</p>${unsubHtml}</td></tr></table></td></tr></table></body></html>`,
    headers: listHeader,
  });
}

// ─── Weekly User Digest ───────────────────────────────────────────────────────

export async function sendUserWeeklyDigest(opts: {
  email: string;
  firstName?: string | null;
  lastScore: number;
  reportId: string;
  userId?: string;
}) {
  if (!opts.email) return;
  const name = opts.firstName ?? "there";
  const scoreLabel = opts.lastScore >= 70 ? "strong" : opts.lastScore >= 40 ? "fair" : "developing";
  const scoreColor = opts.lastScore >= 70 ? "#22d3ee" : opts.lastScore >= 40 ? "#f59e0b" : "#ef4444";
  const planUrl = `${APP_URL}/plan/${opts.reportId}`;
  const encouragements = [
    "Resilience is built one action at a time. Even one small win this week moves the needle.",
    "The best time to prepare was yesterday. The next best time is right now.",
    "Every task you complete is a gap you've closed — permanently.",
    "Your future self is counting on the decisions you make this week.",
    "Preparedness isn't paranoia — it's wisdom. Keep building.",
  ];
  const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
  const unsubHtml = opts.userId ? unsubscribeFooterHtml(opts.userId) : "";
  const unsubText = opts.userId ? unsubscribeFooterText(opts.userId) : "\n\nTo unsubscribe from weekly check-ins, just reply to this email.";
  const listHeader = opts.userId ? { "List-Unsubscribe": buildListUnsubscribeHeader(opts.userId), "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined;

  const text = `Hi ${name},\n\nHere's your weekly Resilium check-in.\n\nCurrent resilience score: ${opts.lastScore}/100 (${scoreLabel})\n\n"${encouragement}"\n\nOpen your action plan and complete one task this week — small actions compound:\n${planUrl}\n\n— Cristiana at Resilium${unsubText}`;

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#E08040;padding:20px 32px;display:flex;align-items:center;justify-content:space-between;"><h1 style="margin:0;color:#0D1225;font-size:20px;font-weight:800;display:inline;">Resilium</h1><span style="color:rgba(13,18,37,0.65);font-size:12px;margin-left:12px;">Weekly Check-In · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></td></tr><tr><td style="padding:32px;"><h2 style="margin:0 0 6px;color:#EAD9BE;font-size:18px;font-weight:700;">Hey ${name} 👋</h2><p style="margin:0 0 24px;color:#b8a99a;font-size:14px;line-height:1.6;">Your weekly resilience update is here.</p><div style="background:#1a2235;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;border:1px solid #2a3245;"><span style="color:#8A7A6A;font-size:11px;display:block;margin-bottom:8px;text-transform:uppercase;letter-spacing:1.5px;">Resilience Score</span><span style="color:${scoreColor};font-size:48px;font-weight:800;line-height:1;">${opts.lastScore}</span><span style="color:#8A7A6A;font-size:22px;font-weight:400;">/100</span><span style="display:block;color:#8A7A6A;font-size:13px;margin-top:6px;font-weight:500;">${scoreLabel}</span></div><p style="margin:0 0 20px;color:#8A7A6A;font-size:13px;font-style:italic;line-height:1.7;padding:0 4px;">"${encouragement}"</p><p style="margin:0 0 24px;color:#b8a99a;font-size:14px;line-height:1.6;">Open your action plan and tick off one task this week. Every completed action is a gap permanently closed.</p><a href="${planUrl}" style="display:block;background:#E08040;color:#0D1225;font-weight:700;font-size:15px;padding:15px 28px;border-radius:10px;text-decoration:none;text-align:center;letter-spacing:-0.2px;">Open My Action Plan →</a><p style="margin:28px 0 0;color:#4a3a2a;font-size:12px;line-height:1.6;text-align:center;">To unsubscribe, reply to this email.<br>— Cristiana at Resilium</p></td></tr></table></td></tr></table></body></html>`;

  const htmlWithUnsub = html.replace("</body>", `${unsubHtml}</body>`);
  await send({ to: opts.email, subject: `Your weekly resilience check-in, ${name}`, html: htmlWithUnsub, text, headers: listHeader });
}

// ─── Payment Failed Email ─────────────────────────────────────────────────────

export async function sendPaymentFailedEmail(opts: { email: string; firstName?: string | null; periodEnd?: Date | null; userId?: string }) {
  if (!opts.email) return;
  const name = opts.firstName ?? "there";
  const accessUntil = opts.periodEnd
    ? opts.periodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  const accessLine = accessUntil ? `\n\nYou still have Pro access until ${accessUntil}. If payment is not updated before then, your account will move to the free plan.` : "";
  const unsubHtml = opts.userId ? unsubscribeFooterHtml(opts.userId) : "";
  const unsubText = opts.userId ? unsubscribeFooterText(opts.userId) : "";
  const listHeader = opts.userId ? { "List-Unsubscribe": buildListUnsubscribeHeader(opts.userId), "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined;
  await send({
    to: opts.email,
    subject: "Action needed — Resilium payment failed",
    text: `Hi ${name},\n\nWe weren't able to process your Resilium Pro payment. This can happen if your card expired, was replaced, or had insufficient funds.${accessLine}\n\nTo keep your Pro access, please update your payment method:\n${APP_URL}/profile\n\nIf you think this is a mistake, contact your bank or reply to this email and I'll help.\n\n— Cristiana at Resilium${unsubText}`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#c0392b;padding:24px 32px;"><h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Resilium — Action Needed</h1></td></tr><tr><td style="padding:32px;"><h2 style="margin:0 0 16px;color:#EAD9BE;font-size:20px;font-weight:700;">Payment failed, ${name}</h2><p style="margin:0 0 16px;color:#b8a99a;line-height:1.6;">We weren't able to process your Resilium Pro payment. This usually happens when a card has expired, been replaced, or has insufficient funds.</p>${accessUntil ? `<div style="background:#2a1a1a;border:1px solid #5a2a2a;border-radius:10px;padding:16px 20px;margin:0 0 24px;"><p style="margin:0;color:#f87171;font-size:14px;font-weight:600;">⏳ Pro access until ${accessUntil}</p><p style="margin:8px 0 0;color:#b8a99a;font-size:13px;line-height:1.5;">If payment is not updated before this date, your account will move to the free plan and your scenario stress-tests, AI companion, and unlimited history will be paused.</p></div>` : ""}<a href="${APP_URL}/profile" style="display:inline-block;background:#E08040;color:#0D1225;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:24px;">Update Payment Method →</a><p style="margin:0;color:#7a6a5a;font-size:13px;line-height:1.6;">If you believe this is a mistake, contact your bank or simply reply to this email and I'll sort it out.<br><br>— Cristiana at Resilium</p>${unsubHtml}</td></tr></table></td></tr></table></body></html>`,
    headers: listHeader,
  });
}

// ─── Cancellation Confirmation Email ──────────────────────────────────────────

export async function sendCancellationEmail(opts: { email: string; firstName?: string | null; periodEnd?: Date | null; userId?: string }) {
  if (!opts.email) return;
  const name = opts.firstName ?? "there";
  const accessUntil = opts.periodEnd
    ? opts.periodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  const accessLine = accessUntil
    ? `You keep full Pro access until ${accessUntil} — nothing changes before then.`
    : "Your Pro access will remain active through the end of your current billing period.";
  const unsubHtml = opts.userId ? unsubscribeFooterHtml(opts.userId) : "";
  const unsubText = opts.userId ? unsubscribeFooterText(opts.userId) : "";
  const listHeader = opts.userId ? { "List-Unsubscribe": buildListUnsubscribeHeader(opts.userId), "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined;
  await send({
    to: opts.email,
    subject: "Your Resilium Pro subscription has been cancelled",
    text: `Hi ${name},\n\nYour Resilium Pro subscription has been cancelled. ${accessLine}\n\nAfter that, your account moves to the free plan — your reports, scores, and history are never deleted.\n\nIf you change your mind, you can resubscribe at any time from your profile:\n${APP_URL}/pricing\n\nThank you for being a Resilium Pro member.\n\n— Cristiana at Resilium${unsubText}`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#E08040;padding:24px 32px;"><h1 style="margin:0;color:#0D1225;font-size:22px;font-weight:800;">Resilium</h1></td></tr><tr><td style="padding:32px;"><h2 style="margin:0 0 16px;color:#EAD9BE;font-size:20px;font-weight:700;">Subscription cancelled, ${name}</h2><p style="margin:0 0 16px;color:#b8a99a;line-height:1.6;">Your Resilium Pro subscription has been cancelled. ${accessLine}</p><div style="background:#1a2235;border-radius:10px;padding:16px 20px;margin:0 0 24px;border:1px solid #2a3245;"><p style="margin:0 0 8px;color:#EAD9BE;font-size:14px;font-weight:600;">What happens next</p><p style="margin:0 0 6px;color:#b8a99a;font-size:13px;line-height:1.5;">✓ Your reports, scores, and plan history are never deleted</p><p style="margin:0 0 6px;color:#b8a99a;font-size:13px;line-height:1.5;">✓ You keep 3 lifetime assessments on the free plan</p><p style="margin:0;color:#b8a99a;font-size:13px;line-height:1.5;">✓ You can resubscribe at any time — your data will be exactly where you left it</p></div><a href="${APP_URL}/pricing" style="display:inline-block;background:#1a2235;color:#E08040;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;border:1px solid #E08040;margin-bottom:24px;">Resubscribe anytime →</a><p style="margin:0;color:#7a6a5a;font-size:13px;line-height:1.6;">Thank you for being a Resilium Pro member. If you have feedback on what could have been better, I'd genuinely love to hear it — just reply to this email.<br><br>— Cristiana at Resilium</p>${unsubHtml}</td></tr></table></td></tr></table></body></html>`,
    headers: listHeader,
  });
}

// ─── Error Alert ──────────────────────────────────────────────────────────────

export async function sendErrorAlert(opts: { errorCount: number; recentErrors: string[] }) {
  const subject = `🔴 Resilium — ${opts.errorCount} server errors in the last 10 minutes`;
  const text = `Error rate alert triggered.\n\nErrors in last 10 min: ${opts.errorCount}\n\nRecent errors:\n${opts.recentErrors.slice(0, 5).join("\n")}\n\nInvestigate: ${APP_URL}/admin`;
  await send({ to: ADMIN_TO, subject, text, html: `<pre style="font-family:monospace;font-size:13px;padding:24px;">${text}</pre>` });
}

// ─── Wednesday E2E Assessment Test Report ─────────────────────────────────────

export interface E2eCheckResult {
  name: string;
  passed: boolean;
  detail?: string;
  durationMs?: number;
}

export async function sendE2eAssessmentReport(opts: {
  passed: boolean;
  checks: E2eCheckResult[];
  totalMs: number;
  reportId?: string;
}) {
  const icon = opts.passed ? "✅" : "❌";
  const subject = `${icon} Resilium E2E Assessment — ${opts.passed ? "All checks passed" : "Failures detected"}`;
  const lines = opts.checks.map(c =>
    `${c.passed ? "✅" : "❌"} ${c.name}${c.durationMs != null ? ` (${c.durationMs}ms)` : ""}${c.detail ? `\n   ${c.detail}` : ""}`
  );
  const text = [
    `Resilium Wednesday E2E Assessment Test`,
    `Generated: ${new Date().toUTCString()}`,
    `Overall: ${opts.passed ? "PASSED" : "FAILED"} in ${opts.totalMs}ms`,
    opts.reportId ? `Test report ID: ${opts.reportId}` : "",
    ``,
    `Results:`,
    ...lines,
    ``,
    `Admin: ${APP_URL}/admin`,
  ].filter(l => l !== undefined).join("\n");
  const rowsHtml = opts.checks.map(c => `
    <tr>
      <td style="padding:10px 12px;color:${c.passed ? "#22c55e" : "#ef4444"};font-size:18px;width:28px;">${c.passed ? "✅" : "❌"}</td>
      <td style="padding:10px 12px;color:#EAD9BE;font-size:14px;">${c.name}</td>
      <td style="padding:10px 12px;color:#7a6a5a;font-size:13px;text-align:right;">${c.durationMs != null ? `${c.durationMs}ms` : "—"}</td>
    </tr>
    ${c.detail ? `<tr><td></td><td colspan="2" style="padding:0 12px 10px;color:#b8a99a;font-size:12px;">${c.detail}</td></tr>` : ""}
  `).join("");
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:${opts.passed ? "#166534" : "#7f1d1d"};padding:20px 32px;"><h1 style="margin:0;color:#fff;font-size:18px;font-weight:800;">${icon} E2E Assessment Test · ${opts.passed ? "Passed" : "Failed"}</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">${new Date().toUTCString()} · ${opts.totalMs}ms total</p></td></tr><tr><td style="padding:24px 32px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#1a2235;border-radius:10px;">${rowsHtml}</table>${opts.reportId ? `<p style="margin:16px 0 0;color:#7a6a5a;font-size:12px;">Test report: ${APP_URL}/results/${opts.reportId}</p>` : ""}<p style="margin:20px 0 0;"><a href="${APP_URL}/admin" style="color:#E08040;font-size:13px;">Open Admin Panel →</a></p></td></tr></table></td></tr></table></body></html>`;
  await send({ to: ADMIN_TO, subject, text, html });
}

// ─── Sunday Site Audit Report ─────────────────────────────────────────────────

export async function sendSiteAuditReport(opts: {
  passed: boolean;
  checks: E2eCheckResult[];
  totalMs: number;
}) {
  const passing = opts.checks.filter(c => c.passed).length;
  const icon = opts.passed ? "✅" : "⚠️";
  const subject = `${icon} Resilium Site Audit — ${passing}/${opts.checks.length} checks passing`;
  const lines = opts.checks.map(c =>
    `${c.passed ? "✅" : "❌"} ${c.name}${c.durationMs != null ? ` (${c.durationMs}ms)` : ""}${c.detail ? `\n   ${c.detail}` : ""}`
  );
  const text = [
    `Resilium Sunday Site-Wide Functionality Audit`,
    `Generated: ${new Date().toUTCString()}`,
    `Overall: ${passing}/${opts.checks.length} checks passing in ${opts.totalMs}ms`,
    ``,
    `Results:`,
    ...lines,
    ``,
    `Admin: ${APP_URL}/admin`,
  ].join("\n");
  const rowsHtml = opts.checks.map(c => `
    <tr>
      <td style="padding:10px 12px;color:${c.passed ? "#22c55e" : "#ef4444"};font-size:18px;width:28px;">${c.passed ? "✅" : "❌"}</td>
      <td style="padding:10px 12px;color:#EAD9BE;font-size:14px;">${c.name}</td>
      <td style="padding:10px 12px;color:#7a6a5a;font-size:13px;text-align:right;">${c.durationMs != null ? `${c.durationMs}ms` : "—"}</td>
    </tr>
    ${c.detail ? `<tr><td></td><td colspan="2" style="padding:0 12px 10px;color:#b8a99a;font-size:12px;">${c.detail}</td></tr>` : ""}
  `).join("");
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:${opts.passed ? "#166534" : "#7f1d1d"};padding:20px 32px;"><h1 style="margin:0;color:#fff;font-size:18px;font-weight:800;">${icon} Site Audit · ${passing}/${opts.checks.length} Passing</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">${new Date().toUTCString()} · ${opts.totalMs}ms total</p></td></tr><tr><td style="padding:24px 32px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#1a2235;border-radius:10px;">${rowsHtml}</table><p style="margin:20px 0 0;"><a href="${APP_URL}/admin" style="color:#E08040;font-size:13px;">Open Admin Panel →</a></p></td></tr></table></td></tr></table></body></html>`;
  await send({ to: ADMIN_TO, subject, text, html });
}

// ─── Competitor Alert ─────────────────────────────────────────────────────────
export async function sendCompetitorAlert(
  alerts: Array<{ competitor: string; url: string; note: string }>,
): Promise<void> {
  const subject = `🔍 Resilium Competitor Monitor — ${alerts.length} change${alerts.length !== 1 ? "s" : ""} detected`;
  const lines = alerts.map(a => `• ${a.competitor} (${a.url})\n  ${a.note}`);
  const text = [`Competitor changes detected at ${new Date().toUTCString()}`, "", ...lines, "", `Admin: ${APP_URL}/admin`].join("\n");
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:#7c2d12;padding:20px 32px;"><h1 style="margin:0;color:#fff;font-size:18px;font-weight:800;">🔍 Competitor Monitor Alert</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">${new Date().toUTCString()}</p></td></tr><tr><td style="padding:24px 32px;">${alerts.map(a => `<div style="margin-bottom:16px;padding:12px 16px;background:#1a2235;border-radius:8px;"><strong style="color:#E08040;">${a.competitor}</strong><br><a href="${a.url}" style="color:#7a6a5a;font-size:12px;">${a.url}</a><p style="margin:6px 0 0;font-size:13px;">${a.note}</p></div>`).join("")}<p style="margin:20px 0 0;"><a href="${APP_URL}/admin" style="color:#E08040;font-size:13px;">Open Admin Panel →</a></p></td></tr></table></td></tr></table></body></html>`;
  await send({ to: ADMIN_TO, subject, text, html });
}

// ─── Health Check Summary ─────────────────────────────────────────────────────
export async function sendHealthCheckSummary(opts: {
  overallStatus: "pass" | "fail";
  passCount: number;
  failCount: number;
  results: unknown[];
  triggeredBy: string;
}): Promise<void> {
  const icon = opts.overallStatus === "pass" ? "✅" : "⚠️";
  const subject = `${icon} Resilium Health Check — ${opts.passCount}/${opts.passCount + opts.failCount} passing (${opts.triggeredBy})`;
  const text = [
    `Resilium Health Check — ${new Date().toUTCString()}`,
    `Triggered by: ${opts.triggeredBy}`,
    `Overall: ${opts.overallStatus.toUpperCase()} | Pass: ${opts.passCount} | Fail: ${opts.failCount}`,
  ].join("\n");
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1225;font-family:'Helvetica Neue',Arial,sans-serif;color:#EAD9BE;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table width="560" cellpadding="0" cellspacing="0" style="background:#131929;border-radius:16px;overflow:hidden;"><tr><td style="background:${opts.overallStatus === "pass" ? "#166534" : "#7f1d1d"};padding:20px 32px;"><h1 style="margin:0;color:#fff;font-size:18px;font-weight:800;">${icon} Health Check · ${opts.passCount}/${opts.passCount + opts.failCount} Passing</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">${new Date().toUTCString()} · Triggered by: ${opts.triggeredBy}</p></td></tr><tr><td style="padding:24px 32px;"><p style="margin:0;"><a href="${APP_URL}/admin" style="color:#E08040;font-size:13px;">Open Admin Panel →</a></p></td></tr></table></td></tr></table></body></html>`;
  await send({ to: ADMIN_TO, subject, text, html });
}
