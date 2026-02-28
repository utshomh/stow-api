import { Response } from "express";

import { prisma } from "../../utils/prisma";
import { AuthRequest } from "../../middlewares/auth";

export const getCurrentSubscription = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: req.userId,
        isActive: true,
      },
      include: { package: true },
    });

    res.json({ success: true, data: subscription });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const selectSubscription = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  try {
    const pkg = await prisma.subscriptionPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    await prisma.userSubscription.updateMany({
      where: {
        userId: req.userId,
        isActive: true,
      },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });

    const newSub = await prisma.userSubscription.create({
      data: {
        userId: req.userId!,
        packageId: id,
      },
      include: { package: true },
    });

    res.json({ success: true, data: newSub });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSubscriptionHistory = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const history = await prisma.userSubscription.findMany({
      where: { userId: req.userId },
      include: { package: true },
      orderBy: { startDate: "desc" },
    });

    res.json({ success: true, data: history });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
