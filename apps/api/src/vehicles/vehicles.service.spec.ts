import { ConflictException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { Vehicle } from "@rental/validations";

import { VehiclesService } from "./vehicles.service";
import type { VehiclesRepository } from "./vehicles.repository";

const VEHICLE_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

const vehicle: Vehicle = {
  id: VEHICLE_ID,
  make: "Toyota",
  model: "Yaris",
  year: 2023,
  dailyRate: 45,
  available: true,
  seats: 5,
  doors: 4,
  trunkLiters: 270,
  maxPayloadKg: 355,
  transmissionType: "automatic",
  fuelType: "gasoline",
  category: "economy",
  airConditioned: true,
  airbags: 4,
};

function makeRepository(
  overrides: Partial<VehiclesRepository> = {},
): VehiclesRepository {
  return {
    findAll: vi.fn().mockResolvedValue([vehicle]),
    findById: vi.fn().mockResolvedValue(vehicle),
    findAvailable: vi.fn().mockResolvedValue([vehicle]),
    insert: vi.fn().mockResolvedValue(vehicle),
    update: vi.fn().mockResolvedValue(vehicle),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as VehiclesRepository;
}

describe("VehiclesService", () => {
  describe("findAll()", () => {
    it("returns all vehicles from the repository unchanged", async () => {
      const vehicles: Vehicle[] = [vehicle];
      const repo = makeRepository({ findAll: vi.fn().mockResolvedValue(vehicles) });
      const service = new VehiclesService(repo);

      await expect(service.findAll()).resolves.toEqual(vehicles);
      expect(repo.findAll).toHaveBeenCalledOnce();
    });

    it("returns an empty array when the repository has no vehicles", async () => {
      const repo = makeRepository({ findAll: vi.fn().mockResolvedValue([]) });
      const service = new VehiclesService(repo);

      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe("findByIdOrThrow()", () => {
    it("returns vehicle when found", async () => {
      const repo = makeRepository({ findById: vi.fn().mockResolvedValue(vehicle) });
      const service = new VehiclesService(repo);

      await expect(service.findByIdOrThrow(VEHICLE_ID)).resolves.toEqual(vehicle);
    });

    it("throws NotFoundException when vehicle not found", async () => {
      const repo = makeRepository({ findById: vi.fn().mockResolvedValue(null) });
      const service = new VehiclesService(repo);

      await expect(service.findByIdOrThrow(VEHICLE_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create()", () => {
    it("delegates to repository.insert and returns vehicle", async () => {
      const repo = makeRepository({ insert: vi.fn().mockResolvedValue(vehicle) });
      const service = new VehiclesService(repo);

      const result = await service.create({
        make: "Toyota",
        model: "Yaris",
        year: 2023,
        dailyRate: 45,
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
      });

      expect(result).toEqual(vehicle);
      expect(repo.insert).toHaveBeenCalledOnce();
    });
  });

  describe("update()", () => {
    it("happy path — finds vehicle then delegates to repository.update", async () => {
      const updated = { ...vehicle, make: "Honda" };
      const repo = makeRepository({
        findById: vi.fn().mockResolvedValue(vehicle),
        update: vi.fn().mockResolvedValue(updated),
      });
      const service = new VehiclesService(repo);

      const result = await service.update(VEHICLE_ID, { make: "Honda" });

      expect(result).toEqual(updated);
      expect(repo.findById).toHaveBeenCalledWith(VEHICLE_ID);
      expect(repo.update).toHaveBeenCalledWith(VEHICLE_ID, { make: "Honda" });
    });

    it("throws NotFoundException when vehicle not found", async () => {
      const repo = makeRepository({ findById: vi.fn().mockResolvedValue(null) });
      const service = new VehiclesService(repo);

      await expect(service.update(VEHICLE_ID, { make: "Honda" })).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe("remove()", () => {
    it("happy path — finds vehicle then calls repository.delete", async () => {
      const repo = makeRepository({
        findById: vi.fn().mockResolvedValue(vehicle),
        delete: vi.fn().mockResolvedValue(undefined),
      });
      const service = new VehiclesService(repo);

      await expect(service.remove(VEHICLE_ID)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(VEHICLE_ID);
    });

    it("throws NotFoundException when vehicle not found", async () => {
      const repo = makeRepository({ findById: vi.fn().mockResolvedValue(null) });
      const service = new VehiclesService(repo);

      await expect(service.remove(VEHICLE_ID)).rejects.toThrow(NotFoundException);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it("throws ConflictException when repository throws Postgres FK error (code 23503)", async () => {
      const fkError = Object.assign(new Error("FK violation"), { code: "23503" });
      const repo = makeRepository({
        findById: vi.fn().mockResolvedValue(vehicle),
        delete: vi.fn().mockRejectedValue(fkError),
      });
      const service = new VehiclesService(repo);

      await expect(service.remove(VEHICLE_ID)).rejects.toThrow(ConflictException);
    });
  });
});
