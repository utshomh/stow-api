import cors from "cors";
import express from "express";

import { globalLimiter } from "./middlewares/rateLimiter";

const app = express();

app.use(cors());
app.use(express.json());

app.use(globalLimiter);

app.get("/", (_, res) => {
  res.json({ success: true, message: "Stow API Running 🚀" });
});

export default app;
