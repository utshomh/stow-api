import { Router } from "express";

import { authenticate } from "../../middlewares/auth";
import {
  getCurrentSubscription,
  selectSubscription,
  getSubscriptionHistory,
} from "./subscription.controller";

const router = Router();

router.use(authenticate);

router.get("/", getCurrentSubscription);

router.post("/select/:id", selectSubscription);

router.get("/history", getSubscriptionHistory);

export default router;
