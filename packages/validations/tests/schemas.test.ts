import { describe, expect, it } from "vitest";

import {
  ApiJwtClaimsSchema,
  BookingSchema,
  CreateBookingSchema,
  CreateVehicleSchema,
  LoginCredentialsSchema,
  ReservationAvailabilityRequestSchema,
  ReservationAvailabilityResponseSchema,
  ReservationRequestFormSchema,
  VehicleSchema,
} from "../src";

describe("shared validation contracts", () => {
  it("accepts a valid vehicle payload", () => {
    const parsed = VehicleSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      make: "Nissan",
      model: "Versa",
      year: 2024,
      dailyRate: 55,
      available: true,
    });

    expect(parsed.make).toBe("Nissan");
    expect(
      CreateVehicleSchema.parse({
        make: "Toyota",
        model: "Yaris",
        year: 2025,
        dailyRate: 61,
        available: false,
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
    expect(() => LoginCredentialsSchema.parse({ email: "joel@example.com", password: "123" })).toThrowError(
      /Too small/,
    );
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
