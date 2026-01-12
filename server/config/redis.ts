import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.UPSTASH_REDIS_URL);

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("error", (error) => {
  console.log("Redis error", error);
});
