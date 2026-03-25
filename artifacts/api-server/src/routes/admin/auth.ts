import { Router, type IRouter } from "express";
import { createAdminSession, destroyAdminSession, isValidAdminSession, ADMIN_COOKIE } from "../../middlewares/adminAuthMiddleware.js";

const router: IRouter = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body ?? {};
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    res.status(500).json({ error: "Admin credentials not configured" });
    return;
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = createAdminSession();
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ success: true });
});

router.post("/logout", (req, res) => {
  destroyAdminSession(req);
  res.clearCookie(ADMIN_COOKIE, { path: "/" });
  res.json({ success: true });
});

router.get("/session", (req, res) => {
  const valid = isValidAdminSession(req);
  res.json({ authenticated: valid });
});

export default router;
