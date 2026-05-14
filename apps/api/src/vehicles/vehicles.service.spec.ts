import { describe, expect, it, vi } from "vitest";
import type { Vehicle } from "@rental/validations";

import { VehiclesService } from "./vehicles.service";
import type { VehiclesRepository } from "./vehicles.repository";

function makeRepository(rows: Vehicle[]) {
  return {
    findAll: vi.fn().mockResolvedValue(rows),
  } as unknown as VehiclesRepository;
}

describe("VehiclesService", () => {
  it("returns all vehicles from the repository unchanged", async () => {
    const vehicles: Vehicle[] = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        make: "Toyota",
        model: "Yaris",
        year: 2023,
        dailyRate: 45,
        available: true,
      },
    ];
    const repo = makeRepository(vehicles);
    const service = new VehiclesService(repo);

    await expect(service.findAll()).resolves.toEqual(vehicles);
    expect(repo.findAll).toHaveBeenCalledOnce();
  });

  it("returns an empty array when the repository has no vehicles", async () => {
    const repo = makeRepository([]);
    const service = new VehiclesService(repo);

    await expect(service.findAll()).resolves.toEqual([]);
  });
});
