import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function signToken(payload: string): string {
  const secret = process.env["SESSION_SECRET"] ?? "";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function generateAdminToken(): string {
  const expiry = Date.now() + TOKEN_TTL_MS;
  const payload = `admin:${expiry}`;
  const sig = signToken(payload);
  return `${expiry}.${sig}`;
}

export function verifyAdminToken(token: string): boolean {
  try {
    const [expiryStr, sig] = token.split(".");
    if (!expiryStr || !sig) return false;
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) return false;
    const payload = `admin:${expiry}`;
    const expected = signToken(payload);
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function requireAdminSession(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (verifyAdminToken(token)) {
      next();
      return;
    }
  }
  res.status(401).json({ error: "UNAUTHORIZED", message: "Admin authentication required." });
}
