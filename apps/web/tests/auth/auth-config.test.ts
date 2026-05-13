import { beforeEach, describe, expect, it } from "vitest";

import { resetWebEnvCache } from "../../env";

describe("auth config", () => {
  beforeEach(() => {
    process.env = {
      ...process.env,
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/rental_car_cancun",
      AUTH_GITHUB_ID: "github-client-id",
      AUTH_GITHUB_SECRET: "github-client-secret",
      NEXTAUTH_SECRET: "super-secret-value",
      NEXT_PUBLIC_SITE_URL: "https://rental-car-cancun.test",
    };
    resetWebEnvCache();
  });

  it("uses database sessions and a provider-backed sign-in page", async () => {
    const { buildAuthConfig } = await import("../../src/core/auth");
    const config = buildAuthConfig({ adapter: {} as NonNullable<ReturnType<typeof buildAuthConfig>["adapter"]> });

    expect(config.session?.strategy).toBe("database");
    expect(config.providers).toHaveLength(1);
    expect(config.pages?.signIn).toBe("/es/login");
  }, 10_000);
});
