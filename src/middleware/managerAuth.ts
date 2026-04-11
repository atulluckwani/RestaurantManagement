import { Request, Response, NextFunction } from "express";
import { hasSession } from "../services/sessionStore";

export const managerAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.managerToken as string | undefined;

  if (!token || !hasSession(token)) {
    res.status(401).json({ message: "Unauthorized manager access" });
    return;
  }

  next();
};
