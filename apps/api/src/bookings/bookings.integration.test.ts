import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { bookingsTable } from "../database/schema/bookings";
import { usersTable } from "../database/schema/users";
import { vehiclesTable } from "../database/schema/vehicles";
import { BookingsRepository } from "./bookings.repository";

const pool = new Pool({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: 5432,
  user: "rental",
  password: "rental",
  database: "rental_dev",
});

const db = drizzle(pool);

class StubDatabaseService {
  readonly db = db;
}

const TEST_USER_ID = "cccc0000-0000-0000-0000-000000000001";
const TEST_VEHICLE_ID = "dddd0000-0000-0000-0000-000000000001";

describe("BookingsRepository (integration) — concurrency", () => {
  const repo = new BookingsRepository(new StubDatabaseService() as never);

  beforeEach(async () => {
    await db.delete(bookingsTable);
    await db
      .insert(usersTable)
      .values({
        id: TEST_USER_ID,
        email: "integration-test@test.com",
        name: "Integration Test User",
        role: "customer",
      })
      .onConflictDoNothing();
    await db
      .insert(vehiclesTable)
      .values({
        id: TEST_VEHICLE_ID,
        make: "Toyota",
        model: "Yaris",
        year: 2023,
        dailyRateCents: 5000,
        available: true,
      })
      .onConflictDoNothing();
  });

  afterEach(async () => {
    await db.delete(bookingsTable);
  });

  it("returns conflict sentinel when vehicle already has overlapping confirmed booking", async () => {
    const startDate = new Date("2025-06-01T00:00:00Z");
    const endDate = new Date("2025-06-05T00:00:00Z");

    await db.insert(bookingsTable).values({
      userId: TEST_USER_ID,
      vehicleId: TEST_VEHICLE_ID,
      startDate,
      endDate,
      totalPriceCents: 20000,
      depositAmountCents: 6000,
      status: "confirmed",
    });

    const result = await repo.createWithAvailabilityCheck({
      userId: TEST_USER_ID,
      vehicleId: TEST_VEHICLE_ID,
      startDate,
      endDate,
      depositRate: 0.3,
    });

    expect(result).toBe("conflict");
  });

  it("returns vehicle_not_found sentinel for unknown vehicle", async () => {
    const result = await repo.createWithAvailabilityCheck({
      userId: TEST_USER_ID,
      vehicleId: "00000000-0000-0000-0000-000000000000",
      startDate: new Date("2025-06-01T00:00:00Z"),
      endDate: new Date("2025-06-05T00:00:00Z"),
      depositRate: 0.3,
    });

    expect(result).toBe("vehicle_not_found");
  });
});
