import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import resilienceRouter from "./resilience/index.js";
import usersRouter from "./users.js";
import gdprRouter from "./gdpr/index.js";
import adminRouter from "./admin/index.js";
import feedbackRouter from "./feedback/index.js";
import announcementsRouter from "./announcements.js";
import stripeRouter from "./stripe.js";
import subscriptionRouter from "./subscription.js";
import pushTokensRouter from "./push-tokens.js";
import coachingRouter from "./coaching.js";
import draftsRouter from "./drafts.js";
import emailRouter from "./email.js";
import companionRouter from "./companion.js";
import checkinsRouter from "./checkins.js";
import challengeRouter from "./challenge.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/resilience", resilienceRouter);
router.use("/users", usersRouter);
router.use("/gdpr", gdprRouter);
router.use("/admin", adminRouter);
router.use("/feedback", feedbackRouter);
router.use(announcementsRouter);
router.use(stripeRouter);
router.use(subscriptionRouter);
router.use(pushTokensRouter);
router.use(coachingRouter);
router.use("/drafts", draftsRouter);
router.use(emailRouter);
router.use(companionRouter);
router.use(checkinsRouter);
router.use(challengeRouter);

export default router;
