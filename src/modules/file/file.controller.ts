import fs from "fs";
import path from "path";
import { Response } from "express";

import { prisma } from "../../utils/prisma";
import { AppRequest } from "../../types/express";

export const uploadFile = async (req: AppRequest, res: Response) => {
  const file = req.file;
  const { folderId } = req.body;

  if (!file) return res.status(400).json({ message: "No file provided" });

  // Verify folder exists and belongs to user
  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: req.userId! },
    });

    if (!folder) {
      // Clean up uploaded file if folder doesn't exist
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

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found on disk" });
  }

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
    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      await tx.file.delete({
        where: { id },
      });
    });

    // Delete physical file after successful DB deletion
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ message: "Failed to delete file" });
  }
};
