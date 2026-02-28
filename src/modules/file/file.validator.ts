import { z } from "zod";

export const uploadFileSchema = z.object({
  folderId: z.string().uuid(),
});

export const renameFileSchema = z.object({
  name: z.string().min(1, "File name cannot be empty"),
});
