import {} from "multer";
import { Request, Response, NextFunction } from "express";

import { prisma } from "../utils/prisma";

type GuardType = "CREATE_FOLDER" | "UPLOAD_FILE";

export interface AppRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

export const subscriptionGuard = (type: GuardType) => {
  return async (req: AppRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
      include: { package: true },
    });

    if (!subscription) {
      return res.status(403).json({
        message: "No active subscription",
      });
    }

    const limits = subscription.package;

    try {
      if (type === "CREATE_FOLDER") {
        const folderCount = await prisma.folder.count({
          where: { userId },
        });

        if (folderCount >= limits.maxFolders) {
          return res.status(403).json({
            message: "Folder limit reached",
          });
        }

        if (req.body.nestingLevel > limits.maxNestingLevel) {
          return res.status(403).json({
            message: "Max nesting level exceeded",
          });
        }
      }

      if (type === "UPLOAD_FILE") {
        const file = req.file;

        if (!file) {
          return res.status(400).json({ message: "No file provided" });
        }

        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > limits.maxFileSizeMB) {
          return res.status(403).json({
            message: "File too large",
          });
        }

        if (!limits.allowedFileTypes.includes(file.mimetype)) {
          return res.status(403).json({
            message: "File type not allowed",
          });
        }

        const totalFiles = await prisma.file.count({
          where: { userId },
        });

        if (totalFiles >= limits.totalFileLimit) {
          return res.status(403).json({
            message: "Total file limit reached",
          });
        }

        const folderFileCount = await prisma.file.count({
          where: {
            userId,
            folderId: req.body.folderId,
          },
        });

        if (folderFileCount >= limits.filesPerFolder) {
          return res.status(403).json({
            message: "Folder file limit reached",
          });
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
