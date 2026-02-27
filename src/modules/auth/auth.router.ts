import { Router } from "express";

import { validate } from "../../middlewares/validation";
import { authLimiter } from "../../middlewares/security";
import { register, login, refresh, logout } from "./auth.controller";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "./auth.validator";

const router = Router();

router.use(authLimiter);

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(logoutSchema), logout);

export default router;
