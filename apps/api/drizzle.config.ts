import { defineConfig } from "drizzle-kit";

import { parseDatabaseEnv } from "./src/config/env";

const env = parseDatabaseEnv(process.env);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
