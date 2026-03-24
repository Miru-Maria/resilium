import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import resilienceRouter from "./resilience/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/resilience", resilienceRouter);

export default router;
