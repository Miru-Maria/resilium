import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env["SMTP_HOST"];
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: parseInt(process.env["SMTP_PORT"] ?? "587", 10),
    secure: process.env["SMTP_SECURE"] === "true",
    auth: { user, pass },
  });
}

export async function sendGdprRequestNotification(opts: {
  type: "deletion" | "export";
  sessionId: string;
}) {
  const to = process.env["SMTP_TO"] ?? "contact_resilium@pm.me";
  const transport = getTransport();

  const subject = opts.type === "deletion"
    ? `[Resilium] GDPR Deletion Request — ${opts.sessionId.slice(0, 8)}`
    : `[Resilium] GDPR Export Request — ${opts.sessionId.slice(0, 8)}`;

  const body = `
A new GDPR ${opts.type} request was submitted.

Session ID: ${opts.sessionId}
Type: ${opts.type}
Received: ${new Date().toISOString()}

Log in to the admin panel to ${opts.type === "deletion" ? "fulfill the deletion" : "review the export"}.

Note: Deletion requests must be fulfilled within 30 days under GDPR.
`.trim();

  if (!transport) {
    console.warn(
      `[GDPR Email] SMTP not configured — would have sent: ${subject}\n${body}`
    );
    return;
  }

  try {
    await transport.sendMail({ from: process.env["SMTP_USER"], to, subject, text: body });
    console.info(`[GDPR Email] Notification sent to ${to}`);
  } catch (err) {
    console.error("[GDPR Email] Failed to send notification:", err);
  }
}
