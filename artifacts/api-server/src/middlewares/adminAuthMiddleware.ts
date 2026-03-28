import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";

const ADMIN_COOKIE = "admin_sid";

const validSessions = new Set<string>();

export function isValidAdminSession(req: Request): boolean {
  const token = req.cookies?.[ADMIN_COOKIE];
  return typeof token === "string" && validSessions.has(token);
}

export function createAdminSession(): string {
  const token = crypto.randomBytes(32).toString("hex");
  validSessions.add(token);
  setTimeout(() => validSessions.delete(token), 24 * 60 * 60 * 1000);
  return token;
}

export function destroyAdminSession(req: Request): void {
  const token = req.cookies?.[ADMIN_COOKIE];
  if (token) validSessions.delete(token);
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isValidAdminSession(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export { ADMIN_COOKIE };
