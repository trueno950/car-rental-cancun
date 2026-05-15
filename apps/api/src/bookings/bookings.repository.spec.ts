import { describe, expect, it, vi } from "vitest";

import { BookingsRepository } from "./bookings.repository";

function makeDbService(overrides: Record<string, unknown> = {}) {
  const mockTransaction = vi.fn();
  const mockSelect = vi.fn().mockReturnThis();
  const mockFrom = vi.fn().mockReturnThis();
  const mockWhere = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockResolvedValue([]);
  const mockInsert = vi.fn().mockReturnThis();
  const mockValues = vi.fn().mockReturnThis();
  const mockReturning = vi.fn().mockResolvedValue([
    {
      id: "11111111-1111-1111-1111-111111111111",
      userId: "22222222-2222-2222-2222-222222222222",
      vehicleId: "33333333-3333-3333-3333-333333333333",
      startDate: new Date("2025-01-10T00:00:00Z"),
      endDate: new Date("2025-01-15T00:00:00Z"),
      totalPriceCents: 22500,
      depositAmountCents: 6750,
      status: "pending",
      notes: null,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z"),
    },
  ]);

  return {
    db: {
      transaction: mockTransaction,
      select: mockSelect,
      from: mockFrom,
      where: mockWhere,
      limit: mockLimit,
      insert: mockInsert,
      values: mockValues,
      returning: mockReturning,
      ...overrides,
    },
  };
}

describe("BookingsRepository", () => {
  describe("toDomain()", () => {
    it("converts totalPriceCents to decimal totalPrice", () => {
      const repo = new BookingsRepository(makeDbService() as never);
      const row = {
        id: "11111111-1111-1111-1111-111111111111",
        userId: "22222222-2222-2222-2222-222222222222",
        vehicleId: "33333333-3333-3333-3333-333333333333",
        startDate: new Date("2025-01-10T00:00:00Z"),
        endDate: new Date("2025-01-15T00:00:00Z"),
        totalPriceCents: 22500,
        depositAmountCents: 6750,
        status: "pending" as const,
        notes: null,
        stripeCheckoutSessionId: null,
        stripePaymentIntentId: null,
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
      };

      const domain = repo.toDomain(row);

      expect(domain.totalPrice).toBe(225);
      expect(domain.depositAmount).toBe(67.5);
      expect(domain.id).toBe(row.id);
    });

    it("handles null depositAmountCents as undefined depositAmount", () => {
      const repo = new BookingsRepository(makeDbService() as never);
      const row = {
        id: "11111111-1111-1111-1111-111111111111",
        userId: "22222222-2222-2222-2222-222222222222",
        vehicleId: "33333333-3333-3333-3333-333333333333",
        startDate: new Date("2025-01-10T00:00:00Z"),
        endDate: new Date("2025-01-15T00:00:00Z"),
        totalPriceCents: 22500,
        depositAmountCents: null,
        status: "pending" as const,
        notes: null,
        stripeCheckoutSessionId: null,
        stripePaymentIntentId: null,
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
      };

      const domain = repo.toDomain(row);

      expect(domain.depositAmount).toBeUndefined();
    });
  });

  describe("findByCustomer()", () => {
    it("calls the DB with the userId filter", async () => {
      const dbService = makeDbService();
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });
      dbService.db.select = mockSelect;

      const repo = new BookingsRepository(dbService as never);
      const userId = "22222222-2222-2222-2222-222222222222";

      const result = await repo.findByCustomer(userId);

      expect(mockSelect).toHaveBeenCalledOnce();
      expect(result).toEqual([]);
    });
  });

  describe("createWithAvailabilityCheck()", () => {
    it("calls db.transaction", async () => {
      const dbService = makeDbService();
      dbService.db.transaction = vi.fn().mockResolvedValue({
        id: "11111111-1111-1111-1111-111111111111",
        userId: "22222222-2222-2222-2222-222222222222",
        vehicleId: "33333333-3333-3333-3333-333333333333",
        startDate: new Date("2025-01-10"),
        endDate: new Date("2025-01-15"),
        totalPriceCents: 22500,
        depositAmountCents: null,
        status: "pending",
        notes: null,
        stripeCheckoutSessionId: null,
        stripePaymentIntentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const repo = new BookingsRepository(dbService as never);

      await repo.createWithAvailabilityCheck({
        userId: "22222222-2222-2222-2222-222222222222",
        vehicleId: "33333333-3333-3333-3333-333333333333",
        startDate: new Date("2025-01-10"),
        endDate: new Date("2025-01-15"),
        depositRate: 0.3,
      });

      expect(dbService.db.transaction).toHaveBeenCalledOnce();
    });
  });
});
