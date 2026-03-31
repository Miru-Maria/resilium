import { Router, type IRouter } from "express";
import { recordCoachingClick } from "../lib/cron.js";

const router: IRouter = Router();

router.post("/coaching/track", (req, res) => {
  recordCoachingClick();
  res.json({ ok: true });
});

export default router;
