import { Response, NextFunction } from "express";

import { verifyAccessToken } from "../utils/auth";
import { prisma } from "../utils/prisma";
import { AppRequest } from "../types/express";

export const authenticate = async (
  req: AppRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const requireAdmin = async (
  req: AppRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
