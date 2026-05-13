import { describe, expect, it } from "vitest";

import {
  createReservationAvailabilityPayload,
  formatReservationDateRange,
  getReservationNights,
  mapBlockedDates,
} from "../../src/features/reservations";

describe("reservation date range helpers", () => {
  it("serializes the shared reservation API payload from form values", () => {
    const payload = createReservationAvailabilityPayload({
      pickupLocation: "Airport",
      timezone: "America/Cancun",
      dateRange: {
        from: new Date("2026-07-10T10:00:00.000Z"),
        to: new Date("2026-07-13T10:00:00.000Z"),
      },
    });

    expect(payload.pickupDate).toBe("2026-07-10T10:00:00.000Z");
    expect(payload.returnDate).toBe("2026-07-13T10:00:00.000Z");
  });

  it("counts calendar nights for a selected range", () => {
    expect(
      getReservationNights({
        from: new Date("2026-07-10T00:00:00.000Z"),
        to: new Date("2026-07-13T00:00:00.000Z"),
      }),
    ).toBe(3);
  });

  it("maps blocked date fixtures into calendar-safe Date values", () => {
    expect(mapBlockedDates(["2026-07-12", "2026-07-13"])).toHaveLength(2);
  });

  it("formats incomplete and complete ranges for the button label", () => {
    expect(formatReservationDateRange()).toMatch(/Select pickup/);
    expect(
      formatReservationDateRange({
        from: new Date("2026-07-10T00:00:00.000Z"),
        to: new Date("2026-07-13T00:00:00.000Z"),
      }),
    ).toContain("2026");
  });
});
