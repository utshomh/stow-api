import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";

import { env } from "../config/env";

export const hashPassword = async (password: string) =>
  await bcrypt.hash(password, 10);

export const comparePassword = async (password: string, hash: string) =>
  await bcrypt.compare(password, hash);

const encodeSecret = (secret: string) => new TextEncoder().encode(secret);

export const generateAccessToken = async (userId: string) => {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(env.ACCESS_TOKEN_EXPIRES)
    .sign(encodeSecret(env.JWT_ACCESS_SECRET));
};

export const generateRefreshToken = async (userId: string) => {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRES)
    .sign(encodeSecret(env.JWT_REFRESH_SECRET));
};

export const verifyAccessToken = async (token: string) => {
  const { payload } = await jwtVerify(
    token,
    encodeSecret(env.JWT_ACCESS_SECRET),
  );
  return payload as { userId: string };
};

export const verifyRefreshToken = async (token: string) => {
  const { payload } = await jwtVerify(
    token,
    encodeSecret(env.JWT_REFRESH_SECRET),
  );
  return payload as { userId: string };
};
