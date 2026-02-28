import fs from "fs";
import path from "path";
import app from "./app";
import { env } from "./config/env";

// Ensure uploads directory exists
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory");
}

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});
