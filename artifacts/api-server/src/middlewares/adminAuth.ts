import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RECOVERY_TTL_MS = 15 * 60 * 1000;

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

// ── Password hashing (scrypt, Node built-in) ─────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return new Promise((resolve) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) { resolve(false); return; }
      try {
        resolve(crypto.timingSafeEqual(Buffer.from(hash, "hex"), key));
      } catch {
        resolve(false);
      }
    });
  });
}

// ── Recovery tokens (in-memory, 15-minute TTL) ────────────────────────────────

interface RecoveryToken { code: string; expiresAt: number; used: boolean; }
const recoveryTokens: RecoveryToken[] = [];

export function generateRecoveryCode(): string {
  const now = Date.now();
  recoveryTokens.splice(0, recoveryTokens.length, ...recoveryTokens.filter(t => t.expiresAt > now));
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  recoveryTokens.push({ code, expiresAt: now + RECOVERY_TTL_MS, used: false });
  return code;
}

export function consumeRecoveryCode(code: string): boolean {
  const now = Date.now();
  const idx = recoveryTokens.findIndex(t => t.code === code.toUpperCase() && t.expiresAt > now && !t.used);
  if (idx === -1) return false;
  recoveryTokens[idx].used = true;
  return true;
}
