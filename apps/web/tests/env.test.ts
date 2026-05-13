import { describe, expect, it } from "vitest";

import { parseWebEnv } from "../env";

describe("web env validation", () => {
  it("fails with a descriptive error when DATABASE_URL is missing", () => {
    expect(() =>
      parseWebEnv({
        AUTH_GITHUB_ID: "github-client-id",
        AUTH_GITHUB_SECRET: "github-client-secret",
        NEXT_PUBLIC_SITE_URL: "https://rental-car-cancun.test",
        NEXTAUTH_SECRET: "super-secret-value",
      }),
    ).toThrowError(/DATABASE_URL/);
  });

  it("fails with a descriptive error when NEXTAUTH_SECRET is missing", () => {
    expect(() =>
      parseWebEnv({
        DATABASE_URL: "https://postgres.railway.internal/rental_car_cancun",
        AUTH_GITHUB_ID: "github-client-id",
        AUTH_GITHUB_SECRET: "github-client-secret",
        NEXT_PUBLIC_SITE_URL: "https://rental-car-cancun.test",
      }),
    ).toThrowError(/NEXTAUTH_SECRET/);
  });

  it("accepts valid values and defaults NEXT_PUBLIC_SITE_URL when omitted", () => {
    const parsed = parseWebEnv({
      DATABASE_URL: "https://postgres.railway.internal/rental_car_cancun",
      AUTH_GITHUB_ID: "github-client-id",
      AUTH_GITHUB_SECRET: "github-client-secret",
      NEXTAUTH_SECRET: "super-secret-value",
    });

    expect(parsed.DATABASE_URL).toContain("postgres.railway.internal");
    expect(parsed.AUTH_GITHUB_ID).toBe("github-client-id");
    expect(parsed.NEXTAUTH_SECRET).toBe("super-secret-value");
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });
});
