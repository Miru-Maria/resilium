import * as Sentry from "@sentry/node";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { recordServerError, startCron } from "./lib/cron.js";

const app: Express = express();

app.set("trust proxy", 1);

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

const CLERK_JWT_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw388/bHaXpS3CQvoBxRb
Msq91ZENbDikY/WK0dH7hUeV/C3bai1iw3fyYNLBuwziBvxfPlowbeKcmEPb6MjD
1oGK7kiQeYyvh0jrz25IZxJbSQgK7Y4pMYjPW8dKL4OOPmk1tbqFncxWRqRnqccu
QOIzdr9cz3QvnH0YttHA/WfRg7Qdh+H1yqOV6d4nm//5jyG9BcbNbAwbPtD5Y7g9
KzTQxlJD2Z6s9ja9FBMfaZWME82Z+xpMDRvT/wSZgZ4rvETfTjEytYP48WNpKrPU
2Vuq/f/HtNj97hnDXOMLqvKL7QJ6YyWhPwcDGbS3y/Ynb17YRMOmrEHwzw2u0B7U
cQIDAQAB
-----END PUBLIC KEY-----`;

app.use(clerkMiddleware({
  publishableKey: "pk_live_Y2xlcmsucmVzaWxpdW0tcGxhdGZvcm0uY29tJA",
  secretKey: process.env["CLERK_SECRET_KEY"],
  jwtKey: CLERK_JWT_KEY,
}));

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

// Sentry error handler — must come after all routes
Sentry.setupExpressErrorHandler(app);

// Start background cron jobs
startCron();

export default app;
