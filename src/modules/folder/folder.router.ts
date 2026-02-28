import { Router } from "express";

import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validation";
import { subscriptionGuard } from "../../middlewares/subscription";
import { createFolderSchema, renameFolderSchema } from "./folder.validator";
import {
  createFolder,
  listFolders,
  renameFolder,
  deleteFolder,
} from "./folder.controller";

const router = Router();

router.use(authenticate);
router.post(
  "/",
  validate(createFolderSchema),
  subscriptionGuard("CREATE_FOLDER"),
  createFolder,
);
router.get("/", listFolders);
router.patch("/:id", validate(renameFolderSchema), renameFolder);
router.delete("/:id", deleteFolder);

export default router;
