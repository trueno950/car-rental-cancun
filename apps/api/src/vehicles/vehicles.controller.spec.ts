import { describe, expect, it, vi } from "vitest";

import type { VehiclesService } from "./vehicles.service";
import { VehiclesController } from "./vehicles.controller";

const vehicle = {
  id: "vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv",
  make: "Toyota",
  model: "Corolla",
  year: 2023,
  dailyRate: 50,
  available: true,
};

function makeService(
  overrides: Partial<VehiclesService> = {},
): VehiclesService {
  return {
    findAll: vi.fn().mockResolvedValue([vehicle]),
    findById: vi.fn().mockResolvedValue(vehicle),
    getAvailableVehicles: vi.fn().mockResolvedValue([vehicle]),
    ...overrides,
  } as unknown as VehiclesService;
}

describe("VehiclesController", () => {
  describe("GET /vehicles/available", () => {
    it("delegates to service.getAvailableVehicles with parsed dates", async () => {
      const service = makeService();
      const controller = new VehiclesController(service);
      const startDate = "2025-06-01T00:00:00.000Z";
      const endDate = "2025-06-05T00:00:00.000Z";

      const result = await controller.getAvailableVehicles({
        startDate,
        endDate,
      });

      expect(service.getAvailableVehicles).toHaveBeenCalledWith(
        new Date(startDate),
        new Date(endDate),
      );
      expect(result).toEqual([vehicle]);
    });

    it("returns empty array when no vehicles available", async () => {
      const service = makeService({
        getAvailableVehicles: vi.fn().mockResolvedValue([]),
      });
      const controller = new VehiclesController(service);

      const result = await controller.getAvailableVehicles({
        startDate: "2025-06-01T00:00:00.000Z",
        endDate: "2025-06-05T00:00:00.000Z",
      });

      expect(result).toEqual([]);
    });
  });
});
