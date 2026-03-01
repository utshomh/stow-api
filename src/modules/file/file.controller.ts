import fs from "fs";
import path from "path";
import { Response } from "express";

import { prisma } from "../../utils/prisma";
import { AppRequest } from "../../types/express";

export const uploadFile = async (req: AppRequest, res: Response) => {
  const file = req.file;
  const { folderId } = req.body;

  if (!file) return res.status(400).json({ message: "No file provided" });

  // Validate folder ownership before saving file record
  // Multer already saved the file to disk, so we need to clean it up on validation failure
  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: req.userId! },
    });

    if (!folder) {
      // Prevent orphaned files on disk when folder validation fails
      try {
        fs.unlinkSync(path.resolve("uploads", file.filename));
      } catch (err) {
        console.error("Failed to clean up file:", err);
      }
      return res.status(404).json({ message: "Folder not found" });
    }
  }

  const filePath = path.join("uploads", file.filename);

  const saved = await prisma.file.create({
    data: {
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      path: filePath,
      folderId,
      userId: req.userId!,
    },
  });

  res.status(201).json(saved);
};

export const listFiles = async (req: AppRequest, res: Response) => {
  const folderId = req.params.folderId as string;

  const files = await prisma.file.findMany({
    where: {
      folderId,
      userId: req.userId!,
    },
  });

  res.json(files);
};

export const renameFile = async (req: AppRequest, res: Response) => {
  const id = req.params.id as string;
  const { name } = req.body;

  const updated = await prisma.file.updateMany({
    where: { id, userId: req.userId! },
    data: { name },
  });

  if (updated.count === 0)
    return res.status(404).json({ message: "File not found" });

  res.json({ message: "File renamed successfully" });
};

export const downloadFile = async (req: AppRequest, res: Response) => {
  const id = req.params.id as string;

  const file = await prisma.file.findFirst({
    where: { id, userId: req.userId! },
  });

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  const filePath = path.resolve(file.path);

  // Handle case where DB record exists but file was manually deleted from disk
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found on disk" });
  }

  // Stream file to client to handle large files efficiently
  res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
  res.setHeader("Content-Type", file.type);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
};

export const deleteFile = async (req: AppRequest, res: Response) => {
  const id = req.params.id as string;

  const file = await prisma.file.findFirst({
    where: { id, userId: req.userId! },
  });

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  const filePath = path.resolve(file.path);

  try {
    // Delete DB record first in transaction to ensure consistency
    // If DB deletion fails, file remains on disk (safer than orphaned DB records)
    await prisma.$transaction(async (tx) => {
      await tx.file.delete({
        where: { id },
      });
    });

    // Physical file deletion happens after DB commit to avoid orphaned records
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ message: "Failed to delete file" });
  }
};
