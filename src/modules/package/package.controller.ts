import { Request, Response } from "express";

import { prisma } from "../../utils/prisma";

export const createPackage = async (req: Request, res: Response) => {
  try {
    const pkg = await prisma.subscriptionPackage.create({
      data: req.body,
    });

    res.json({ success: true, data: pkg });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to create package",
    });
  }
};

export const getPackages = async (_: Request, res: Response) => {
  try {
    const packages = await prisma.subscriptionPackage.findMany({
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, data: packages });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch packages",
    });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const updated = await prisma.subscriptionPackage.update({
      where: { id },
      data: req.body,
    });

    res.json({ success: true, data: updated });
  } catch {
    res.status(404).json({
      success: false,
      message: "Package not found",
    });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    await prisma.subscriptionPackage.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Package deleted",
    });
  } catch {
    res.status(404).json({
      success: false,
      message: "Package not found",
    });
  }
};
