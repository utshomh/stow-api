import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validation";
import { subscriptionGuard } from "../../middlewares/subscription";
import { uploadFileSchema, renameFileSchema } from "./file.validator";
import {
  uploadFile,
  listFiles,
  renameFile,
  deleteFile,
} from "./file.controller";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.use(authenticate);

router.post(
  "/upload",
  upload.single("file"),
  validate(uploadFileSchema),
  subscriptionGuard("UPLOAD_FILE"),
  uploadFile,
);
router.get("/:folderId", listFiles);
router.patch("/:id", validate(renameFileSchema), renameFile);
router.delete("/:id", deleteFile);

export default router;
