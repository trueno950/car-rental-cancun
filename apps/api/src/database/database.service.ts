import { Injectable } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { OnModuleDestroy } from "@nestjs/common";

import { getApiEnv } from "../config/env";
import * as schema from "./schema";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: getApiEnv().DATABASE_URL,
  });

  readonly db = drizzle(this.pool, { schema });

  async onModuleDestroy() {
    await this.pool.end();
  }
}
