import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getWebEnv } from "../../../../env";
import * as schema from "./schema";

let authPool: Pool | null = null;

export function getAuthDb() {
  authPool ??= new Pool({
    connectionString: getWebEnv().DATABASE_URL,
  });

  return drizzle(authPool, { schema });
}
