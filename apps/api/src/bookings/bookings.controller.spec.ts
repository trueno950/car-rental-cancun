import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { ROLES_KEY } from "../auth/roles.decorator";
import type { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";

function makeService(
  overrides: Partial<BookingsService> = {},
): BookingsService {
  return {
    createBooking: vi
      .fn()
      .mockResolvedValue({ id: "test-id", status: "pending" }),
    checkAvailability: vi.fn().mockResolvedValue({ available: true }),
    getMyBookings: vi.fn().mockResolvedValue([]),
    getAllBookings: vi.fn().mockResolvedValue([]),
    getById: vi
      .fn()
      .mockResolvedValue({ id: "test-id", status: "pending" as const }),
    transitionStatus: vi.fn(),
    calcDepositCents: vi.fn().mockReturnValue(1000),
    ...overrides,
  } as unknown as BookingsService;
}

const customerUser = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "customer@x.com",
  name: "Customer",
  role: "customer" as const,
};

describe("BookingsController", () => {
  describe("GET /bookings/availability", () => {
    it("calls service.checkAvailability and returns result", async () => {
      const service = makeService();
      const controller = new BookingsController(service);
      const query = {
        vehicleId: "33333333-3333-3333-3333-333333333333",
        startDate: "2025-01-10T00:00:00.000Z",
        endDate: "2025-01-15T00:00:00.000Z",
      };

      const result = await controller.checkAvailability(query);

      expect(service.checkAvailability).toHaveBeenCalledWith(query);
      expect(result).toEqual({ available: true });
    });
  });

  describe("POST /bookings", () => {
    it("calls service.createBooking with dto and user", async () => {
      const service = makeService();
      const controller = new BookingsController(service);
      const dto = {
        vehicleId: "33333333-3333-3333-3333-333333333333",
        startDate: "2025-01-10T00:00:00.000Z",
        endDate: "2025-01-15T00:00:00.000Z",
      };

      await controller.createBooking(dto, customerUser);

      expect(service.createBooking).toHaveBeenCalledWith(dto, customerUser);
    });
  });

  describe("GET /bookings/me", () => {
    it("calls service.getMyBookings with user id", async () => {
      const service = makeService();
      const controller = new BookingsController(service);

      await controller.getMyBookings(customerUser);

      expect(service.getMyBookings).toHaveBeenCalledWith(customerUser.id);
    });
  });

  describe("GET /bookings", () => {
    it("calls service.getAllBookings", async () => {
      const service = makeService();
      const controller = new BookingsController(service);

      await controller.getAllBookings();

      expect(service.getAllBookings).toHaveBeenCalledOnce();
    });

    it("is decorated with @Roles(employee, manager, admin)", () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        BookingsController.prototype.getAllBookings,
      );
      expect(roles).toContain("employee");
      expect(roles).toContain("manager");
      expect(roles).toContain("admin");
    });
  });

  describe("GET /bookings/:id", () => {
    it("delegates to service.getById and returns result", async () => {
      const booking = { id: "test-id", status: "pending" };
      const service = makeService({
        getById: vi.fn().mockResolvedValue(booking),
      });
      const controller = new BookingsController(service);

      const result = await controller.getBookingById("test-id");

      expect(service.getById).toHaveBeenCalledWith("test-id");
      expect(result).toEqual(booking);
    });

    it("propagates NotFoundException from service when booking not found", async () => {
      const service = makeService({
        getById: vi.fn().mockRejectedValue(new NotFoundException()),
      });
      const controller = new BookingsController(service);

      await expect(controller.getBookingById("missing-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("PATCH /bookings/:id/status", () => {
    it("is decorated with @Roles(employee, manager, admin)", () => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        BookingsController.prototype.updateStatus,
      );
      expect(roles).toContain("employee");
      expect(roles).toContain("manager");
      expect(roles).toContain("admin");
    });

    it("calls service.transitionStatus", async () => {
      const service = makeService({
        transitionStatus: vi
          .fn()
          .mockResolvedValue({ id: "test", status: "confirmed" }),
      });
      const controller = new BookingsController(service);

      await controller.updateStatus(
        "test-id",
        { status: "confirmed" },
        customerUser,
      );

      expect(service.transitionStatus).toHaveBeenCalledWith(
        "test-id",
        "confirmed",
        customerUser,
      );
    });
  });
});
