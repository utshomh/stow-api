import cors from "cors";
import express from "express";

import { globalLimiter } from "./middlewares/security";
import authRouter from "./modules/auth/auth.router";
import packageRouter from "./modules/package/package.router";
import subscriptionRouter from "./modules/subscription/subscription.router";

const app = express();

app.use(cors());
app.use(express.json());

app.use(globalLimiter);

app.get("/", (_, res) => {
  res.json({ success: true, message: "Stow API Running 🚀" });
});

app.use("/auth", authRouter);
app.use("/packages", packageRouter);
app.use("/subscriptions", subscriptionRouter);

export default app;
