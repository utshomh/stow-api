import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { getUsageAnalytics } from "./analytics.controller";

const router = Router();

router.use(authenticate);

router.get("/usage", getUsageAnalytics);

export default router;
