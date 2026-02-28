import { Router } from "express";

import { authenticate } from "../../middlewares/auth";
import { subscriptionGuard } from "../../middlewares/subscription";
import {
  createFolder,
  listFolders,
  renameFolder,
  deleteFolder,
} from "./folder.controller";

const router = Router();

router.use(authenticate);

router.post("/", subscriptionGuard("CREATE_FOLDER"), createFolder);
router.get("/", listFolders);
router.patch("/:id", renameFolder);
router.delete("/:id", deleteFolder);

export default router;
