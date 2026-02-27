import { Router } from "express";

import { validate } from "../../middlewares/validation";
import { authenticate, requireAdmin } from "../../middlewares/auth";
import { createPackageSchema, updatePackageSchema } from "./package.validator";
import {
  createPackage,
  getPackages,
  updatePackage,
  deletePackage,
} from "./package.controller";

const router = Router();

router.use(authenticate, requireAdmin);

router.post("/", validate(createPackageSchema), createPackage);
router.get("/", getPackages);
router.patch("/:id", validate(updatePackageSchema), updatePackage);
router.delete("/:id", deletePackage);

export default router;
