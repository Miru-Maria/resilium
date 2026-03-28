import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import resilienceRouter from "./resilience/index.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import gdprRouter from "./gdpr/index.js";
import adminRouter from "./admin/index.js";
import feedbackRouter from "./feedback/index.js";
import announcementsRouter from "./announcements.js";
import paddleRouter from "./paddle.js";
import subscriptionRouter from "./subscription.js";
import pushTokensRouter from "./push-tokens.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/resilience", resilienceRouter);
router.use("/users", usersRouter);
router.use("/gdpr", gdprRouter);
router.use("/admin", adminRouter);
router.use("/feedback", feedbackRouter);
router.use(announcementsRouter);
router.use(paddleRouter);
router.use(subscriptionRouter);
router.use(pushTokensRouter);

export default router;
