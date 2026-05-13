import { describe, expect, it } from "vitest";

import { parseApiEnv, parseDatabaseEnv } from "./env";

describe("api env validation", () => {
  it("fails with a descriptive error when DATABASE_URL is missing", () => {
    expect(() =>
      parseApiEnv({
        NEXTAUTH_SECRET: "super-secret-value",
        PORT: "3001",
      }),
    ).toThrowError(/DATABASE_URL/);
  });

  it("fails with a descriptive error when NEXTAUTH_SECRET is missing", () => {
    expect(() =>
      parseApiEnv({
        DATABASE_URL: "https://postgres.railway.internal/rental_car_cancun",
        PORT: "3001",
      }),
    ).toThrowError(/NEXTAUTH_SECRET/);
  });

  it("accepts valid values and coerces PORT", () => {
    const parsed = parseApiEnv({
      DATABASE_URL: "https://postgres.railway.internal/rental_car_cancun",
      NEXTAUTH_SECRET: "super-secret-value",
      PORT: "3010",
      NODE_ENV: "test",
    });

    expect(parsed.PORT).toBe(3010);
    expect(parsed.NODE_ENV).toBe("test");
  });

  it("parses database-only env for Drizzle tooling", () => {
    expect(
      parseDatabaseEnv({
        DATABASE_URL: "https://postgres.railway.internal/rental_car_cancun",
      }).DATABASE_URL,
    ).toContain("postgres.railway.internal");
  });
});
