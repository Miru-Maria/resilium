import * as Sentry from "@sentry/node";

// httpIntegration and expressIntegration are auto-included in v8+;
// the ESM import hook registered via --import @sentry/node/import
// ensures Express is patched before it loads.
Sentry.init({
  dsn: "https://261a00a113f21fcf4d0bacd1bb570c7e@o4511187075923968.ingest.de.sentry.io/4511187305431120",
  environment: process.env.NODE_ENV ?? "development",
  tracesSampleRate: 0.1,
});
