import { jwtVerify } from "jose";
import { beforeEach, describe, expect, it } from "vitest";

import { createApiAccessToken } from "../../src/core/auth";

describe("api access token handoff", () => {
  beforeEach(() => {
    process.env = {
      ...process.env,
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/rental_car_cancun",
      AUTH_GITHUB_ID: "github-client-id",
      AUTH_GITHUB_SECRET: "github-client-secret",
      NEXTAUTH_SECRET: "super-secret-value",
      NEXT_PUBLIC_SITE_URL: "https://rental-car-cancun.test",
    };
  });

  it("signs the bearer token expected by the Nest JWT guard", async () => {
    const token = await createApiAccessToken({
      expiresAt: "2030-01-01T00:00:00.000Z",
      user: {
        id: "550e8400-e29b-41d4-a716-446655440010",
        email: "joel@example.com",
        name: "Joel May",
      },
    });

    const verified = await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

    expect(verified.payload.sub).toBe("550e8400-e29b-41d4-a716-446655440010");
    expect(verified.payload.email).toBe("joel@example.com");
    expect(verified.payload.name).toBe("Joel May");
  });
});
