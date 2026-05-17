import { describe, expect, it, vi } from "vitest";

import type { DatabaseService } from "../database/database.service";
import { VehiclesRepository } from "./vehicles.repository";

const VEHICLE_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

/** Build a minimal row as the DB would return it (cents stored). */
function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: VEHICLE_ID,
    make: "Toyota",
    model: "Yaris",
    year: 2023,
    dailyRateCents: 9550, // 95.50
    available: true,
    seats: 5,
    doors: 4,
    trunkLiters: null,
    maxPayloadKg: null,
    transmissionType: "automatic",
    fuelType: "gasoline",
    category: "economy",
    airConditioned: true,
    airbags: null,
    licensePlate: null,
    color: null,
    imageUrl: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

function makeDb(returning: unknown[] = [makeRow()]) {
  const queryBuilder = {
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(returning),
  };
  return {
    insert: vi.fn().mockReturnValue(queryBuilder),
    update: vi.fn().mockReturnValue(queryBuilder),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
    _queryBuilder: queryBuilder,
  };
}

function makeService(db: ReturnType<typeof makeDb>) {
  return { db } as unknown as DatabaseService;
}

describe("VehiclesRepository.insert", () => {
  it("converts dailyRate decimal to cents before inserting", async () => {
    const db = makeDb([makeRow({ dailyRateCents: 9550 })]);
    const repo = new VehiclesRepository(makeService(db));

    await repo.insert({
      make: "Toyota",
      model: "Yaris",
      year: 2023,
      dailyRate: 95.5,
      available: true,
      seats: 5,
      doors: 4,
      trunkLiters: null,
      maxPayloadKg: null,
      transmissionType: "automatic" as const,
      fuelType: "gasoline" as const,
      category: "economy" as const,
      airConditioned: true,
      airbags: null,
      licensePlate: null,
      color: null,
      imageUrl: null,
    });

    const valuesArg = db._queryBuilder.values.mock.calls[0]![0] as Record<
      string,
      unknown
    >;
    expect(valuesArg.dailyRateCents).toBe(9550);
    expect(valuesArg).not.toHaveProperty("dailyRate");
  });

  it("dailyRate round-trip: insert 95.50 → domain returns 95.50 (not 9550)", async () => {
    const db = makeDb([makeRow({ dailyRateCents: 9550 })]);
    const repo = new VehiclesRepository(makeService(db));

    const vehicle = await repo.insert({
      make: "Toyota",
      model: "Yaris",
      year: 2023,
      dailyRate: 95.5,
      available: true,
      seats: 5,
      doors: 4,
      trunkLiters: null,
      maxPayloadKg: null,
      transmissionType: "automatic" as const,
      fuelType: "gasoline" as const,
      category: "economy" as const,
      airConditioned: true,
      airbags: null,
      licensePlate: null,
      color: null,
      imageUrl: null,
    });

    expect(vehicle.dailyRate).toBe(95.5);
    expect(vehicle).not.toHaveProperty("dailyRateCents");
  });

  it("uses Math.round for float imprecision (49.99 → 4999 cents)", async () => {
    const db = makeDb([makeRow({ dailyRateCents: 4999 })]);
    const repo = new VehiclesRepository(makeService(db));

    await repo.insert({
      make: "Toyota",
      model: "Yaris",
      year: 2023,
      dailyRate: 49.99,
      available: true,
      seats: 5,
      doors: 4,
      trunkLiters: null,
      maxPayloadKg: null,
      transmissionType: "automatic" as const,
      fuelType: "gasoline" as const,
      category: "economy" as const,
      airConditioned: true,
      airbags: null,
      licensePlate: null,
      color: null,
      imageUrl: null,
    });

    const valuesArg = db._queryBuilder.values.mock.calls[0]![0] as Record<
      string,
      unknown
    >;
    expect(valuesArg.dailyRateCents).toBe(4999);
  });
});

describe("VehiclesRepository.update", () => {
  it("builds a sparse patch — only sends present fields", async () => {
    const db = makeDb([makeRow({ dailyRateCents: 10000 })]);
    const repo = new VehiclesRepository(makeService(db));

    await repo.update(VEHICLE_ID, { dailyRate: 100 });

    const setArg = db._queryBuilder.set.mock.calls[0]![0] as Record<
      string,
      unknown
    >;
    expect(setArg).toHaveProperty("dailyRateCents", 10000);
    // Fields not provided must NOT be present in the patch
    expect(setArg).not.toHaveProperty("make");
    expect(setArg).not.toHaveProperty("model");
    expect(setArg).not.toHaveProperty("year");
    expect(setArg).not.toHaveProperty("available");
  });

  it("converts dailyRate to cents inside the patch object", async () => {
    const db = makeDb([makeRow({ dailyRateCents: 7500 })]);
    const repo = new VehiclesRepository(makeService(db));

    await repo.update(VEHICLE_ID, { dailyRate: 75 });

    const setArg = db._queryBuilder.set.mock.calls[0]![0] as Record<
      string,
      unknown
    >;
    expect(setArg.dailyRateCents).toBe(7500);
    expect(setArg).not.toHaveProperty("dailyRate");
  });

  it("sets updatedAt to a Date in every patch", async () => {
    const db = makeDb([makeRow()]);
    const repo = new VehiclesRepository(makeService(db));

    await repo.update(VEHICLE_ID, { make: "Honda" });

    const setArg = db._queryBuilder.set.mock.calls[0]![0] as Record<
      string,
      unknown
    >;
    expect(setArg.updatedAt).toBeInstanceOf(Date);
  });

  it("returns domain object with decimal dailyRate from DB row", async () => {
    const db = makeDb([makeRow({ dailyRateCents: 7500 })]);
    const repo = new VehiclesRepository(makeService(db));

    const vehicle = await repo.update(VEHICLE_ID, { dailyRate: 75 });

    expect(vehicle.dailyRate).toBe(75);
    expect(vehicle).not.toHaveProperty("dailyRateCents");
  });
});

describe("VehiclesRepository.delete", () => {
  it("calls db.delete and resolves without error", async () => {
    const db = makeDb();
    const repo = new VehiclesRepository(makeService(db));

    await expect(repo.delete(VEHICLE_ID)).resolves.toBeUndefined();
    expect(db.delete).toHaveBeenCalledOnce();
  });
});
