import { z } from "zod";

export const createPackageSchema = z.object({
  name: z.string().min(2),

  maxFolders: z.number().int().min(0),
  maxNestingLevel: z.number().int().min(0),

  allowedFileTypes: z.array(z.string()),

  maxFileSizeMB: z.number().int().min(1),
  totalFileLimit: z.number().int().min(0),
  filesPerFolder: z.number().int().min(0),
});

export const updatePackageSchema = createPackageSchema.partial();
