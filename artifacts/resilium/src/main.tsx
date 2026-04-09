import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: "https://c77fc9e84488cf6d595edec251386e5d@o4511187075923968.ingest.de.sentry.io/4511187672957008",
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,
  enabled: import.meta.env.PROD,
});

createRoot(document.getElementById("root")!).render(<App />);
