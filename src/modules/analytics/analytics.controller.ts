import { Response } from "express";

import { prisma } from "../../utils/prisma";
import { AppRequest } from "../../types/express";

export const getUsageAnalytics = async (req: AppRequest, res: Response) => {
  const userId = req.userId!;

  const totalFolders = await prisma.folder.count({ where: { userId } });

  const totalFiles = await prisma.file.count({ where: { userId } });

  const files = await prisma.file.findMany({
    where: { userId },
    select: { size: true },
  });
  const totalStorageUsedBytes = files.reduce((acc, f) => acc + f.size, 0);
  const storageUsedMB = totalStorageUsedBytes / (1024 * 1024);

  const activeSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      isActive: true,
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    include: { package: true },
  });

  res.json({
    totalFolders,
    totalFiles,
    totalStorageUsedBytes,
    storageUsedMB,
    activePackage: activeSubscription?.package.name || null,
  });
};
