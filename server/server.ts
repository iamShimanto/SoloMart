import "dotenv/config";
import app from "./app";
import { env } from "./config/env";
import { dbConfig } from "./config/dbConfig";

dbConfig();

app.listen(env.PORT, () => {
  console.log(`server is running on port ${env.PORT}`);
});
