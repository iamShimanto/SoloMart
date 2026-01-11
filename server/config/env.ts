import { cleanEnv, str, email, json, port } from "envalid";

export const env = cleanEnv(process.env, {
  PORT: port({ default: 5000 }),
  NODE_ENV: str({ choices: ["development", "production"] }),
  MONGODB_URL: str(),
  UPSTASH_REDIS_URL: str(),
  JWT_ACCESS_SECRET: str(),
  JWT_REFRESH_SECRET: str()
});
