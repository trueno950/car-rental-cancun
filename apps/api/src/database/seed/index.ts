import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { parseDatabaseEnv } from "../../config/env";
import * as schema from "../schema";
import { seedVehicles } from "./vehicles.seed";

async function main() {
  const env = parseDatabaseEnv(process.env);
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    await seedVehicles(db);
    process.stdout.write("[seed] vehicles seeded\n");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  process.stderr.write(`[seed] failed: ${(err as Error).message}\n`);
  process.exit(1);
});
