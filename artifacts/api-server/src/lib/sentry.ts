import * as Sentry from "@sentry/node";

const dsn = process.env["SENTRY_DSN"];

export function initSentry(): void {
  if (!dsn) {
    console.info("[Sentry] SENTRY_DSN not set — error monitoring disabled. Add the SENTRY_DSN secret to enable.");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env["NODE_ENV"] ?? "development",
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });

  console.info("[Sentry] Initialized successfully.");
}

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (!dsn) return;
  Sentry.captureException(err, context ? { extra: context } : undefined);
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "error"): void {
  if (!dsn) return;
  Sentry.captureMessage(message, level);
}

// Sentry v7 Express error handler middleware
export const sentryErrorHandler = dsn ? Sentry.Handlers.errorHandler() : null;

export { Sentry };
