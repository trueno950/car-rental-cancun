import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type * as schema from "../schema";
import { vehiclesTable } from "../schema/vehicles";

/**
 * Idempotent vehicle seed. Re-running clears + reinserts so dev DBs
 * stay aligned with the canonical fixture.
 *
 * MONEY: stores integer cents only. Decimal conversion belongs in the repository.
 */
const VEHICLE_SEEDS = [
  {
    make: "Toyota",
    model: "Yaris",
    year: 2023,
    dailyRateCents: 4500,
    available: true,
  },
  {
    make: "Volkswagen",
    model: "Jetta",
    year: 2024,
    dailyRateCents: 6200,
    available: true,
  },
  {
    make: "Jeep",
    model: "Wrangler",
    year: 2024,
    dailyRateCents: 9800,
    available: true,
  },
  {
    make: "Nissan",
    model: "Versa",
    year: 2022,
    dailyRateCents: 4100,
    available: false,
  },
] as const;

export async function seedVehicles(db: NodePgDatabase<typeof schema>) {
  await db.execute(sql`TRUNCATE TABLE vehicles RESTART IDENTITY CASCADE`);
  await db.insert(vehiclesTable).values([...VEHICLE_SEEDS]);
}
