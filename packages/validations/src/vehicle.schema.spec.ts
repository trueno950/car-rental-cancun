import { describe, expect, it } from "vitest";
import { UpdateVehicleSchema } from "./vehicle.schema";

describe("UpdateVehicleSchema", () => {
  it("accepts a partial body with only dailyRate", () => {
    const result = UpdateVehicleSchema.safeParse({ dailyRate: 100 });
    expect(result.success).toBe(true);
  });

  it("accepts an empty body (all fields optional)", () => {
    const result = UpdateVehicleSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects { year: 'not-a-number' } with a type error", () => {
    const result = UpdateVehicleSchema.safeParse({ year: "not-a-number" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const yearError = result.error.issues.find((i) =>
        i.path.includes("year"),
      );
      expect(yearError).toBeDefined();
    }
  });

  it("rejects a negative dailyRate even in partial mode", () => {
    const result = UpdateVehicleSchema.safeParse({ dailyRate: -5 });
    expect(result.success).toBe(false);
  });

  it("preserves int constraint — rejects year as float", () => {
    const result = UpdateVehicleSchema.safeParse({ year: 2023.5 });
    expect(result.success).toBe(false);
  });
});
