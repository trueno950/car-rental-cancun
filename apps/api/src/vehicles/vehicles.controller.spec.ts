import { ConflictException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { ROLES_KEY } from "../auth/roles.decorator";
import type { VehiclesService } from "./vehicles.service";
import { VehiclesController } from "./vehicles.controller";

const VEHICLE_ID = "vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv";

const vehicle = {
  id: VEHICLE_ID,
  make: "Toyota",
  model: "Corolla",
  year: 2023,
  dailyRate: 50,
  available: true,
  seats: 5,
  doors: 4,
  trunkLiters: null,
  maxPayloadKg: null,
  transmissionType: "automatic" as const,
  fuelType: "gasoline" as const,
  category: "compact" as const,
  airConditioned: true,
  airbags: null,
};

function makeService(
  overrides: Partial<VehiclesService> = {},
): VehiclesService {
  return {
    findAll: vi.fn().mockResolvedValue([vehicle]),
    findById: vi.fn().mockResolvedValue(vehicle),
    findByIdOrThrow: vi.fn().mockResolvedValue(vehicle),
    getAvailableVehicles: vi.fn().mockResolvedValue([vehicle]),
    create: vi.fn().mockResolvedValue(vehicle),
    update: vi.fn().mockResolvedValue(vehicle),
    remove: vi.fn().mockResolvedValue(undefined),
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

  describe("GET /vehicles/:id", () => {
    it("delegates to service.findByIdOrThrow and returns vehicle", async () => {
      const service = makeService();
      const controller = new VehiclesController(service);

      const result = await controller.getById(VEHICLE_ID);

      expect(service.findByIdOrThrow).toHaveBeenCalledWith(VEHICLE_ID);
      expect(result).toEqual(vehicle);
    });

    it("propagates NotFoundException from service", async () => {
      const service = makeService({
        findByIdOrThrow: vi.fn().mockRejectedValue(new NotFoundException()),
      });
      const controller = new VehiclesController(service);

      await expect(controller.getById(VEHICLE_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("is decorated with @Roles(manager, admin)", () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        VehiclesController.prototype.getById,
      );
      expect(roles).toContain("manager");
      expect(roles).toContain("admin");
    });
  });

  describe("POST /vehicles", () => {
    const createDto = {
      make: "Toyota",
      model: "Yaris",
      year: 2023,
      dailyRate: 50,
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
    };

    it("delegates to service.create and returns vehicle", async () => {
      const service = makeService();
      const controller = new VehiclesController(service);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(vehicle);
    });

    it("is decorated with @Roles(manager, admin)", () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        VehiclesController.prototype.create,
      );
      expect(roles).toContain("manager");
      expect(roles).toContain("admin");
    });
  });

  describe("PATCH /vehicles/:id", () => {
    it("delegates to service.update and returns updated vehicle", async () => {
      const updated = { ...vehicle, make: "Honda" };
      const service = makeService({ update: vi.fn().mockResolvedValue(updated) });
      const controller = new VehiclesController(service);

      const result = await controller.update(VEHICLE_ID, { make: "Honda" });

      expect(service.update).toHaveBeenCalledWith(VEHICLE_ID, { make: "Honda" });
      expect(result).toEqual(updated);
    });

    it("propagates NotFoundException from service", async () => {
      const service = makeService({
        update: vi.fn().mockRejectedValue(new NotFoundException()),
      });
      const controller = new VehiclesController(service);

      await expect(
        controller.update(VEHICLE_ID, { make: "Honda" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("is decorated with @Roles(manager, admin)", () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        VehiclesController.prototype.update,
      );
      expect(roles).toContain("manager");
      expect(roles).toContain("admin");
    });
  });

  describe("DELETE /vehicles/:id", () => {
    it("delegates to service.remove and returns void", async () => {
      const service = makeService();
      const controller = new VehiclesController(service);

      const result = await controller.remove(VEHICLE_ID);

      expect(service.remove).toHaveBeenCalledWith(VEHICLE_ID);
      expect(result).toBeUndefined();
    });

    it("propagates NotFoundException from service", async () => {
      const service = makeService({
        remove: vi.fn().mockRejectedValue(new NotFoundException()),
      });
      const controller = new VehiclesController(service);

      await expect(controller.remove(VEHICLE_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("propagates ConflictException from service when vehicle has bookings", async () => {
      const service = makeService({
        remove: vi.fn().mockRejectedValue(new ConflictException()),
      });
      const controller = new VehiclesController(service);

      await expect(controller.remove(VEHICLE_ID)).rejects.toThrow(
        ConflictException,
      );
    });

    it("is decorated with @Roles(manager, admin)", () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        VehiclesController.prototype.remove,
      );
      expect(roles).toContain("manager");
      expect(roles).toContain("admin");
    });
  });
});
