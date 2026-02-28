import fs from "fs";
import path from "path";
import { Response } from "express";

import { prisma } from "../../utils/prisma";
import { AppRequest } from "../../middlewares/subscription";

export const uploadFile = async (req: AppRequest, res: Response) => {
  const file = req.file;
  const { folderId } = req.body;

  if (!file) return res.status(400).json({ message: "No file provided" });

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

export const deleteFile = async (req: AppRequest, res: Response) => {
  const id = req.params.id as string;

  const file = await prisma.file.findFirst({
    where: { id, userId: req.userId! },
  });

  if (!file) return res.status(404).json({ message: "File not found" });

  fs.unlink(path.resolve(file.path), (err) => {
    if (err) console.error("Failed to delete file:", err);
  });

  await prisma.file.delete({
    where: { id },
  });

  res.json({ message: "File deleted successfully" });
};
