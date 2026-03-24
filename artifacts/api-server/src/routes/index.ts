import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import resilienceRouter from "./resilience/index.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/resilience", resilienceRouter);
router.use("/users", usersRouter);

export default router;
