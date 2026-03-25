import type { Request, Response, NextFunction } from "express";

export function requireAdminSession(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.isAdmin === true) {
    next();
    return;
  }
  res.status(401).json({ error: "UNAUTHORIZED", message: "Admin authentication required." });
}
