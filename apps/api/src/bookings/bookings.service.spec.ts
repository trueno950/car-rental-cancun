import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";

import { resetApiEnvCache } from "../config/env";
import type { AppConfigService } from "../config/config.service";
import type { BookingsRepository } from "./bookings.repository";
import { BookingsService } from "./bookings.service";

const VEHICLE_ID = "bbbb0000-0000-0000-0000-000000000001";

function makeRepo(
  overrides: Partial<BookingsRepository> = {},
): BookingsRepository {
  return {
    createWithAvailabilityCheck: vi
      .fn()
      .mockResolvedValue({ id: "booking-id", status: "pending" }),
    findAvailability: vi.fn().mockResolvedValue(true),
    findByCustomer: vi.fn().mockResolvedValue([]),
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    updateStatus: vi.fn(),
    toDomain: vi.fn(),
    ...overrides,
  } as unknown as BookingsRepository;
}

function makeConfig(
  overrides: Partial<AppConfigService> = {},
): AppConfigService {
  return {
    getPaymentsConfig: vi.fn().mockReturnValue({ stripeEnabled: false }),
    getBookingConfig: vi
      .fn()
      .mockReturnValue({ depositRateFrequent: 0.2, depositRateNew: 0.3 }),
    ...overrides,
  } as unknown as AppConfigService;
}

const customerUser = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "customer@x.com",
  name: "Customer",
  role: "customer" as const,
  isFrequent: false,
};

const employeeUser = {
  id: "22222222-2222-2222-2222-222222222222",
  email: "emp@x.com",
  name: "Employee",
  role: "employee" as const,
};

const bookingResponse = {
  id: "aaaa0000-0000-0000-0000-000000000001",
  vehicleId: VEHICLE_ID,
  userId: customerUser.id,
  startDate: "2025-01-10T00:00:00.000Z",
  endDate: "2025-01-15T00:00:00.000Z",
  status: "pending" as const,
  totalPrice: 225,
  depositAmount: 67.5,
  notes: null,
  createdAt: "2025-01-01T00:00:00.000Z",
};

function setupEnv(overrides: Record<string, string> = {}) {
  vi.stubEnv("DATABASE_URL", "postgresql://x:x@localhost/x");
  vi.stubEnv("NEXTAUTH_SECRET", "test-secret");
  vi.stubEnv("DEPOSIT_RATE_FREQUENT", "0.20");
  vi.stubEnv("DEPOSIT_RATE_NEW", "0.30");
  for (const [key, value] of Object.entries(overrides)) {
    vi.stubEnv(key, value);
  }
  resetApiEnvCache();
}

afterEach(() => {
  resetApiEnvCache();
  vi.unstubAllEnvs();
});

describe("BookingsService", () => {
  describe("createBooking()", () => {
    it("happy path returns pending booking", async () => {
      setupEnv();
      const repo = makeRepo({
        createWithAvailabilityCheck: vi.fn().mockResolvedValue(bookingResponse),
      });
      const service = new BookingsService(repo, makeConfig());

      const result = await service.createBooking(
        {
          vehicleId: VEHICLE_ID,
          startDate: bookingResponse.startDate,
          endDate: bookingResponse.endDate,
        },
        customerUser,
      );

      expect(result).toEqual(bookingResponse);
      expect(repo.createWithAvailabilityCheck).toHaveBeenCalledOnce();
      expect(repo.createWithAvailabilityCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          vehicleId: VEHICLE_ID,
          depositRate: 0.3,
        }),
      );
    });

    it("throws NotFoundException when repository returns vehicle_not_found", async () => {
      setupEnv();
      const repo = makeRepo({
        createWithAvailabilityCheck: vi
          .fn()
          .mockResolvedValue("vehicle_not_found"),
      });
      const service = new BookingsService(repo, makeConfig());

      await expect(
        service.createBooking(
          {
            vehicleId: VEHICLE_ID,
            startDate: bookingResponse.startDate,
            endDate: bookingResponse.endDate,
          },
          customerUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ConflictException when repository returns conflict", async () => {
      setupEnv();
      const repo = makeRepo({
        createWithAvailabilityCheck: vi.fn().mockResolvedValue("conflict"),
      });
      const service = new BookingsService(repo, makeConfig());

      await expect(
        service.createBooking(
          {
            vehicleId: VEHICLE_ID,
            startDate: bookingResponse.startDate,
            endDate: bookingResponse.endDate,
          },
          customerUser,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("passes DEPOSIT_RATE_FREQUENT for frequent customers", async () => {
      setupEnv();
      const repo = makeRepo({
        createWithAvailabilityCheck: vi.fn().mockResolvedValue(bookingResponse),
      });
      const service = new BookingsService(repo, makeConfig());

      await service.createBooking(
        {
          vehicleId: VEHICLE_ID,
          startDate: bookingResponse.startDate,
          endDate: bookingResponse.endDate,
        },
        { ...customerUser, isFrequent: true },
      );

      expect(repo.createWithAvailabilityCheck).toHaveBeenCalledWith(
        expect.objectContaining({ depositRate: 0.2 }),
      );
    });
  });

  describe("transitionStatus()", () => {
    it("throws BadRequestException for invalid transition (pending → completed)", async () => {
      const pendingBooking = { ...bookingResponse, status: "pending" as const };
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(pendingBooking),
      });
      const service = new BookingsService(repo, makeConfig());

      await expect(
        service.transitionStatus(pendingBooking.id, "completed", employeeUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("allows valid transition pending → confirmed", async () => {
      const confirmedBooking = {
        ...bookingResponse,
        status: "confirmed" as const,
      };
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({
          ...bookingResponse,
          status: "pending" as const,
        }),
        updateStatus: vi.fn().mockResolvedValue(confirmedBooking),
      });
      const service = new BookingsService(repo, makeConfig());

      const result = await service.transitionStatus(
        bookingResponse.id,
        "confirmed",
        employeeUser,
      );

      expect(result.status).toBe("confirmed");
      expect(repo.updateStatus).toHaveBeenCalledWith(
        bookingResponse.id,
        "confirmed",
      );
    });

    it("allows valid transition pending → cancelled", async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue({
          ...bookingResponse,
          status: "pending" as const,
        }),
        updateStatus: vi.fn().mockResolvedValue({
          ...bookingResponse,
          status: "cancelled" as const,
        }),
      });
      const service = new BookingsService(repo, makeConfig());

      const result = await service.transitionStatus(
        bookingResponse.id,
        "cancelled",
        employeeUser,
      );

      expect(result.status).toBe("cancelled");
    });
  });
});
