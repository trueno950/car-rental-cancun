import { describe, expect, it, vi } from "vitest";

import { submitReservationAvailability } from "../../src/features/reservations";

describe("reservation availability proxy", () => {
  it("validates and forwards the shared payload to the Nest boundary", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        available: true,
        blockedDates: ["2026-07-12"],
        nights: 3,
        timezone: "America/Cancun",
      }),
    } as Response);

    const result = await submitReservationAvailability(
      {
        pickupLocation: "Airport",
        timezone: "America/Cancun",
        pickupDate: "2026-07-10T10:00:00.000Z",
        returnDate: "2026-07-13T10:00:00.000Z",
      },
      {
        apiBaseUrl: "https://api.rental-car-cancun.test",
        fetchImpl,
      },
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(String(fetchImpl.mock.calls[0]?.[0])).toBe("https://api.rental-car-cancun.test/bookings/availability");
    expect(result.available).toBe(true);
  });
});
