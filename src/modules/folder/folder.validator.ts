import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  parentId: z.string().uuid().optional(),
});

export const renameFolderSchema = z.object({
  name: z.string().min(1, "Folder name cannot be empty"),
});
