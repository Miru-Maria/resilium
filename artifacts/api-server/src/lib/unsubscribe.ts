import { createHmac } from "crypto";

const SECRET = process.env["CLERK_SECRET_KEY"] ?? "fallback-dev-secret";
const APP_URL = process.env["APP_URL"] ?? "https://resilium-platform.com";

export function generateUnsubscribeToken(userId: string): string {
  return createHmac("sha256", SECRET).update(userId).digest("hex");
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = generateUnsubscribeToken(userId);
  // Constant-time comparison
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

export function buildUnsubscribeUrl(userId: string): string {
  const token = generateUnsubscribeToken(userId);
  return `${APP_URL}/api/email/unsubscribe?uid=${encodeURIComponent(userId)}&sig=${token}`;
}

export function buildListUnsubscribeHeader(userId: string): string {
  return `<${buildUnsubscribeUrl(userId)}>, <mailto:hello@resilium-platform.com?subject=Unsubscribe>`;
}
