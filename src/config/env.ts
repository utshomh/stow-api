import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("8000"),

  DATABASE_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  ACCESS_TOKEN_EXPIRES: z.string(),
  REFRESH_TOKEN_EXPIRES: z.string(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:", result.error.format());
  process.exit(1);
}

export const env = result.data;
