import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://261a00a113f21fcf4d0bacd1bb570c7e@o4511187075923968.ingest.de.sentry.io/4511187305431120",
  environment: process.env.NODE_ENV ?? "development",
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
  ],
  tracesSampleRate: 0.1,
});
