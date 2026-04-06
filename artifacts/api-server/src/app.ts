import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { recordServerError, startCron } from "./lib/cron.js";

const REPLIT_DOMAIN = "resilium-ai.replit.app";
const CANONICAL_DOMAIN = "resilium-platform.com";

const app: Express = express();

app.set("trust proxy", 1);

// 301-redirect legacy Replit domain to canonical domain
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = (req.headers["x-forwarded-host"] as string | undefined) ?? req.headers.host ?? "";
  if (host.includes(REPLIT_DOMAIN)) {
    const target = `https://${CANONICAL_DOMAIN}${req.url}`;
    res.redirect(301, target);
    return;
  }
  next();
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));

// Capture raw body for Paddle webhook HMAC verification before express.json() consumes it
app.use("/api/paddle/webhook", express.raw({ type: "*/*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

// Error-rate tracking middleware — must be BEFORE routes so finish listener is attached
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    if (res.statusCode >= 500) {
      recordServerError(`${res.statusCode} ${_req.method} ${_req.path}`);
    }
  });
  next();
});

app.use("/api", router);

// Start background cron jobs
startCron();

export default app;
