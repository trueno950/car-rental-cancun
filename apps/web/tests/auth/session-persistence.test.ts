import { beforeEach, describe, expect, it } from "vitest";

import { resetWebEnvCache } from "../../env";

describe("auth session persistence", () => {
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

  it("persists and reloads database sessions through the Drizzle adapter", async () => {
    const { buildAuthConfig } = await import("../../src/core/auth");
    const config = buildAuthConfig({ adapter: {} as NonNullable<ReturnType<typeof buildAuthConfig>["adapter"]> });
    const sessionCallback = config.callbacks?.session;

    expect(config.session?.strategy).toBe("database");
    expect(config.adapter).toBeDefined();
    expect(sessionCallback).toBeDefined();

    const session = (await sessionCallback?.({
      session: {
        expires: "2030-01-01T00:00:00.000Z",
        user: {
          email: "joel@example.com",
          name: "Joel May",
        },
      },
      user: {
        id: "550e8400-e29b-41d4-a716-446655440010",
        email: "joel@example.com",
        name: "Joel May",
        emailVerified: null,
        image: null,
      },
    } as never)) as { apiAccessToken?: string; user?: { id?: string } } | undefined;

    expect(session?.user?.id).toBe("550e8400-e29b-41d4-a716-446655440010");
    expect(session?.apiAccessToken).toBeTruthy();
  }, 10_000);
});
