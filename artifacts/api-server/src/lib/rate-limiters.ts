import rateLimit from "express-rate-limit";
import { getAuth } from "@clerk/express";
import type { Request } from "express";

function userKey(req: Request): string {
  const auth = getAuth(req);
  const uid = (auth?.sessionClaims?.userId as string | undefined) || auth?.userId;
  return uid ?? "anonymous";
}

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: "RATE_LIMITED", message: "Too many requests. Please slow down." },
  skip: (req) => req.path === "/stripe/webhook",
});

const userKeyValidate = { xForwardedForHeader: false } as const;

export const stripeCheckoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  validate: userKeyValidate,
  keyGenerator: userKey,
  message: { error: "RATE_LIMITED", message: "Too many checkout attempts. Please wait before trying again." },
});

export const stripePortalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: userKeyValidate,
  keyGenerator: userKey,
  message: { error: "RATE_LIMITED", message: "Too many portal requests. Please wait before trying again." },
});

export const emailUnsubscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: "RATE_LIMITED", message: "Too many unsubscribe requests. Please try again later." },
});

export const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: userKeyValidate,
  keyGenerator: userKey,
  message: { error: "RATE_LIMITED", message: "Too many feedback submissions. Please try again later." },
});

export const checkinLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: userKeyValidate,
  keyGenerator: userKey,
  message: { error: "RATE_LIMITED", message: "Too many check-ins. Please try again later." },
});

export const challengeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  validate: userKeyValidate,
  keyGenerator: userKey,
  message: { error: "RATE_LIMITED", message: "Too many challenge actions. Please try again later." },
});

export const stripeDonationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: "RATE_LIMITED", message: "Too many donation attempts. Please try again later." },
});
