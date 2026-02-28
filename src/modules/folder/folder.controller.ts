import { Response } from "express";

import { prisma } from "../../utils/prisma";
import { AppRequest } from "../../middlewares/subscription";

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

export const deleteFolder = async (req: AppRequest, res: Response) => {
  const id = req.params.id as string;

  const deleted = await prisma.folder.deleteMany({
    where: { id, userId: req.userId! },
  });

  if (deleted.count === 0)
    return res.status(404).json({ message: "Folder not found" });
  res.json({ message: "Folder deleted successfully" });
};
