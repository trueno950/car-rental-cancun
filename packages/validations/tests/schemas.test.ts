import { describe, expect, it } from "vitest";

import {
  ApiJwtClaimsSchema,
  ApiUserSchema,
  BookingSchema,
  CreateBookingSchema,
  CreateVehicleSchema,
  LoginCredentialsSchema,
  ReservationAvailabilityRequestSchema,
  ReservationAvailabilityResponseSchema,
  ReservationRequestFormSchema,
  UpdateUserRoleSchema,
  UserRoleSchema,
  VehicleSchema,
} from "../src";

describe("shared validation contracts", () => {
  it("accepts a valid vehicle payload", () => {
    const specFields = {
      seats: 5,
      doors: 4,
      trunkLiters: 428,
      maxPayloadKg: 450,
      transmissionType: "automatic" as const,
      fuelType: "gasoline" as const,
      category: "compact" as const,
      airConditioned: true,
      airbags: 4,
    };

    const parsed = VehicleSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      make: "Nissan",
      model: "Versa",
      year: 2024,
      dailyRate: 55,
      available: true,
      ...specFields,
    });

    expect(parsed.make).toBe("Nissan");
    expect(
      CreateVehicleSchema.parse({
        make: "Toyota",
        model: "Yaris",
        year: 2025,
        dailyRate: 61,
        available: false,
        ...specFields,
      }).model,
    ).toBe("Yaris");
  });

  it("rejects booking ranges where endDate is before startDate", () => {
    expect(() =>
      BookingSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440001",
        userId: "550e8400-e29b-41d4-a716-446655440002",
        vehicleId: "550e8400-e29b-41d4-a716-446655440003",
        startDate: "2026-06-10T10:00:00.000Z",
        endDate: "2026-06-09T10:00:00.000Z",
        totalPrice: 200,
        status: "pending",
      }),
    ).toThrowError(/after pickupDate/);
  });

  it("defaults new bookings to pending status", () => {
    const parsed = CreateBookingSchema.parse({
      userId: "550e8400-e29b-41d4-a716-446655440004",
      vehicleId: "550e8400-e29b-41d4-a716-446655440005",
      startDate: "2026-06-10T10:00:00.000Z",
      endDate: "2026-06-12T10:00:00.000Z",
      totalPrice: 300,
    });

    expect(parsed.status).toBe("pending");
  });

  it("reuses shared reservation date rules for the calendar form contract", () => {
    const parsed = ReservationRequestFormSchema.parse({
      pickupLocation: "Hotel Zone",
      timezone: "America/Cancun",
      dateRange: {
        from: new Date("2026-07-10T10:00:00.000Z"),
        to: new Date("2026-07-13T10:00:00.000Z"),
      },
    });

    expect(parsed.dateRange.from).toBeInstanceOf(Date);
    expect(parsed.dateRange.to).toBeInstanceOf(Date);
  });

  it("rejects reservation availability payloads longer than 30 nights", () => {
    expect(() =>
      ReservationAvailabilityRequestSchema.parse({
        pickupLocation: "Airport",
        timezone: "America/Cancun",
        pickupDate: "2026-07-01T10:00:00.000Z",
        returnDate: "2026-08-05T10:00:00.000Z",
      }),
    ).toThrowError(/30 nights/);
  });

  it("accepts blocked dates in API responses using YYYY-MM-DD format", () => {
    const parsed = ReservationAvailabilityResponseSchema.parse({
      available: false,
      blockedDates: ["2026-07-12", "2026-07-13"],
      nights: 3,
      timezone: "America/Cancun",
    });

    expect(parsed.blockedDates).toHaveLength(2);
  });

  it("rejects weak login credentials", () => {
    expect(() =>
      LoginCredentialsSchema.parse({
        email: "joel@example.com",
        password: "123",
      }),
    ).toThrowError(/Too small/);
  });

  it("accepts API JWT claims for Nest handoff", () => {
    const parsed = ApiJwtClaimsSchema.parse({
      sub: "550e8400-e29b-41d4-a716-446655440006",
      email: "joel@example.com",
      name: "Joel May",
    });

    expect(parsed.sub).toBe("550e8400-e29b-41d4-a716-446655440006");
  });
});

describe("UserRoleSchema", () => {
  it("accepts all 4 valid roles", () => {
    expect(UserRoleSchema.parse("customer")).toBe("customer");
    expect(UserRoleSchema.parse("employee")).toBe("employee");
    expect(UserRoleSchema.parse("manager")).toBe("manager");
    expect(UserRoleSchema.parse("admin")).toBe("admin");
  });

  it("rejects invalid role values", () => {
    expect(() => UserRoleSchema.parse("superadmin")).toThrow();
    expect(() => UserRoleSchema.parse("")).toThrow();
    expect(() => UserRoleSchema.parse("owner")).toThrow();
  });

  it("has exactly 4 options", () => {
    expect(UserRoleSchema.options).toHaveLength(4);
    expect(UserRoleSchema.options).toEqual([
      "customer",
      "employee",
      "manager",
      "admin",
    ]);
  });
});

describe("ApiJwtClaimsSchema with role (Phase A)", () => {
  it("parses successfully when role is absent (legacy token)", () => {
    const parsed = ApiJwtClaimsSchema.parse({
      sub: "550e8400-e29b-41d4-a716-446655440007",
      email: "joel@example.com",
      name: "Joel May",
    });

    expect(parsed.role).toBeUndefined();
  });

  it("parses successfully when role is a valid value", () => {
    const parsed = ApiJwtClaimsSchema.parse({
      sub: "550e8400-e29b-41d4-a716-446655440007",
      email: "joel@example.com",
      name: "Joel May",
      role: "manager",
    });

    expect(parsed.role).toBe("manager");
  });

  it("accepts all 4 valid roles in token claims", () => {
    for (const role of ["customer", "employee", "manager", "admin"] as const) {
      const parsed = ApiJwtClaimsSchema.parse({
        sub: "550e8400-e29b-41d4-a716-446655440007",
        email: "joel@example.com",
        name: "Joel May",
        role,
      });
      expect(parsed.role).toBe(role);
    }
  });

  it("rejects invalid role values in token claims", () => {
    expect(() =>
      ApiJwtClaimsSchema.parse({
        sub: "550e8400-e29b-41d4-a716-446655440007",
        email: "joel@example.com",
        name: "Joel May",
        role: "superadmin",
      }),
    ).toThrow();
  });
});

describe("ApiUserSchema with role (required)", () => {
  it("parses a user record with a required role field", () => {
    const parsed = ApiUserSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440008",
      email: "joel@example.com",
      name: "Joel May",
      role: "employee",
    });

    expect(parsed.role).toBe("employee");
  });

  it("rejects user records missing the role field", () => {
    expect(() =>
      ApiUserSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440008",
        email: "joel@example.com",
        name: "Joel May",
      }),
    ).toThrow();
  });
});

describe("UpdateUserRoleSchema", () => {
  it("accepts a valid role update payload", () => {
    const parsed = UpdateUserRoleSchema.parse({ role: "manager" });
    expect(parsed.role).toBe("manager");
  });

  it("rejects an invalid role update payload", () => {
    expect(() => UpdateUserRoleSchema.parse({ role: "god" })).toThrow();
  });

  it("rejects missing role in update payload", () => {
    expect(() => UpdateUserRoleSchema.parse({})).toThrow();
  });
});
