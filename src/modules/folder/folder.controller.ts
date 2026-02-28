import fs from "fs";
import path from "path";
import { Response } from "express";

import { prisma } from "../../utils/prisma";
import { AppRequest } from "../../types/express";

export const createFolder = async (req: AppRequest, res: Response) => {
  const { name, parentId } = req.body;
  let nestingLevel = 1;

  if (parentId) {
    const parent = await prisma.folder.findUnique({
      where: { id: parentId, userId: req.userId! },
    });

    if (!parent)
      return res.status(404).json({ message: "Parent folder not found" });
    nestingLevel = parent.nestingLevel + 1;
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      parentId: parentId || null,
      nestingLevel,
      userId: req.userId!,
    },
  });

  res.status(201).json(folder);
};

export const listFolders = async (req: AppRequest, res: Response) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.userId! },
    include: { children: true },
  });
  res.json(folders);
};

export const renameFolder = async (req: AppRequest, res: Response) => {
  const id = req.params.id as string;
  const { name } = req.body;

  const updated = await prisma.folder.updateMany({
    where: { id, userId: req.userId! },
    data: { name },
  });

  if (updated.count === 0)
    return res.status(404).json({ message: "Folder not found" });
  res.json({ message: "Folder renamed successfully" });
};

/**
 * Recursively deletes a folder and all its children (folders and files)
 * This function should be called within a transaction
 */
async function deleteFolderRecursive(
  folderId: string,
  userId: string,
  tx: any,
) {
  // Find all child folders
  const childFolders = await tx.folder.findMany({
    where: { parentId: folderId, userId },
  });

  // Recursively delete child folders
  for (const childFolder of childFolders) {
    await deleteFolderRecursive(childFolder.id, userId, tx);
  }

  // Find all files in this folder
  const files = await tx.file.findMany({
    where: { folderId, userId },
  });

  // Delete physical files from disk (outside transaction)
  for (const file of files) {
    try {
      const filePath = path.resolve(file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Failed to delete file ${file.path}:`, err);
    }
  }

  // Delete files from database
  await tx.file.deleteMany({
    where: { folderId, userId },
  });

  // Delete the folder itself
  await tx.folder.delete({
    where: { id: folderId },
  });
}

export const deleteFolder = async (req: AppRequest, res: Response) => {
  const id = req.params.id as string;

  // Verify folder exists and belongs to user
  const folder = await prisma.folder.findFirst({
    where: { id, userId: req.userId! },
  });

  if (!folder) {
    return res.status(404).json({ message: "Folder not found" });
  }

  try {
    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      await deleteFolderRecursive(id, req.userId!, tx);
    });

    res.json({ message: "Folder deleted successfully" });
  } catch (err) {
    console.error("Error deleting folder:", err);
    res.status(500).json({ message: "Failed to delete folder" });
  }
};
