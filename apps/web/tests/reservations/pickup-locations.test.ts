import { describe, expect, it } from "vitest";

import { getMapCenter } from "@features/map";

import { RESERVATION_PICKUP_LOCATIONS } from "../../src/features/reservations";

describe("reservation pickup locations", () => {
  it("returns a stable fallback center when no locations exist", () => {
    expect(getMapCenter([])).toEqual([21.161908, -86.851528]);
  });

  it("averages configured pickup points for the map viewport", () => {
    const center = getMapCenter(RESERVATION_PICKUP_LOCATIONS);

    expect(center[0]).toBeCloseTo(21.1112666667);
    expect(center[1]).toBeCloseTo(-86.8192666667);
  });
});
