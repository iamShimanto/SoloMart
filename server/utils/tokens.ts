import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { redis } from "../config/redis";

export const generateAccessToken = (userId: Types.ObjectId | string) => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: Types.ObjectId | string) => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: "15d",
  });
};

export const storeRefreshToken = async (
  userId: Types.ObjectId,
  refreshToken: string
): Promise<void> => {
  await redis.set(
    `refresh_token:${userId.toString()}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};
