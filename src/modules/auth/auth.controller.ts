import { Request, Response } from "express";

import { env } from "../../config/env";
import { prisma } from "../../utils/prisma";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/auth";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    res.json({ success: true, userId: user.id });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid email" });

    const valid = await comparePassword(password, user.password);
    if (!valid)
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });

    // Generate both tokens for stateless authentication
    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    // Calculate expiration from REFRESH_TOKEN_EXPIRES (format: "7d" -> days)
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + parseInt(env.REFRESH_TOKEN_EXPIRES),
    );

    // Store refresh token in DB for revocation capability
    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    res.json({ success: true, accessToken, refreshToken });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    // Verify token exists in DB (prevents use of revoked tokens)
    const existingToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!existingToken)
      return res.status(401).json({ success: false, message: "Token invalid" });

    // Verify token signature and expiration
    const payload = await verifyRefreshToken(refreshToken);

    const userId = payload.userId;

    // Rotate refresh token: delete old, create new (prevents token reuse)
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newRefreshToken = await generateRefreshToken(userId);

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + parseInt(env.REFRESH_TOKEN_EXPIRES),
    );

    await prisma.refreshToken.create({
      data: { userId, token: newRefreshToken, expiresAt },
    });

    const newAccessToken = await generateAccessToken(userId);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    const result = await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Token not found" });
    }

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
