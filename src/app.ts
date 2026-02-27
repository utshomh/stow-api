import cors from "cors";
import express from "express";

import { globalLimiter } from "./middlewares/security";
import authRouter from "./modules/auth/auth.router";

const app = express();

app.use(cors());
app.use(express.json());

app.use(globalLimiter);

app.get("/", (_, res) => {
  res.json({ success: true, message: "Stow API Running 🚀" });
});

app.use("/auth", authRouter);

export default app;
