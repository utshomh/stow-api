import { Response, NextFunction } from "express";

import { prisma } from "../utils/prisma";
import { isFileTypeAllowed } from "../utils/fileTypes";
import { AppRequest } from "../types/express";

type GuardType = "CREATE_FOLDER" | "UPLOAD_FILE";

/**
 * Middleware factory that enforces subscription package limits
 * Validates user's active subscription and checks against package constraints
 * 
 * Note: Nesting level check happens here, but actual level is calculated in controller
 * This prevents users from bypassing limits by manipulating request body
 */
export const subscriptionGuard = (type: GuardType) => {
  return async (req: AppRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;

    // Find active subscription (either no endDate or endDate in future)
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
        // Check total folder count across all folders
        const folderCount = await prisma.folder.count({
          where: { userId },
        });

        if (folderCount >= limits.maxFolders) {
          return res.status(403).json({
            message: "Folder limit reached",
          });
        }

        // Validate nesting level from request (calculated in controller)
        // This is a secondary check - controller calculates it from parent
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

        // Convert bytes to MB for comparison
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > limits.maxFileSizeMB) {
          return res.status(403).json({
            message: "File too large",
          });
        }

        // Map MIME type to package's file type categories
        if (!isFileTypeAllowed(file.mimetype, limits.allowedFileTypes)) {
          return res.status(403).json({
            message: "File type not allowed",
          });
        }

        // Check total files across entire account
        const totalFiles = await prisma.file.count({
          where: { userId },
        });

        if (totalFiles >= limits.totalFileLimit) {
          return res.status(403).json({
            message: "Total file limit reached",
          });
        }

        // Check files within specific folder (if folderId provided)
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
