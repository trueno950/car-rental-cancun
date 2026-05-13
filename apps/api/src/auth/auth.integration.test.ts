import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { SignJWT } from "jose";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../app.module";
import { resetApiEnvCache } from "../config/env";

const TEST_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/rental_car_cancun";
const TEST_SECRET = "test-nextauth-secret";
const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440010";

describe("auth foundation integration", () => {
  let app: INestApplication | null = null;

  beforeEach(() => {
    process.env = {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      NEXTAUTH_SECRET: TEST_SECRET,
      NODE_ENV: "test",
      PORT: "3001",
    };
    resetApiEnvCache();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = null;
    }

    resetApiEnvCache();
  });

  async function createApplication() {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    return app;
  }

  async function signValidToken() {
    return new SignJWT({
      email: "joel@example.com",
      name: "Joel May",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(TEST_USER_ID)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(TEST_SECRET));
  }

  it("allows requests to public endpoints without a bearer token", async () => {
    const instance = await createApplication();

    const response = await request(instance.getHttpServer()).get("/vehicles");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("rejects protected endpoints without a bearer token", async () => {
    const instance = await createApplication();

    const response = await request(instance.getHttpServer()).get("/profile");

    expect(response.status).toBe(401);
  });

  it("accepts a valid bearer token and exposes the user payload", async () => {
    const instance = await createApplication();
    const token = await signValidToken();

    const response = await request(instance.getHttpServer())
      .get("/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: TEST_USER_ID,
      email: "joel@example.com",
      name: "Joel May",
    });
  });
});
